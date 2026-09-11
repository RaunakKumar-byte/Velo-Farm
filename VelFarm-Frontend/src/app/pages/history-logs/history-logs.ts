import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { LogsService, SystemLog, LogFilter, DataSet, ComparisonResult } from '../../services/logs.service';
import { ApiService } from '../../services/api.service';
import { SharedModule } from '../../shared/shared-module';


@Component({
  selector: 'app-history-logs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SharedModule],
  templateUrl: './history-logs.html',
  styleUrls: ['./history-logs.scss']
})
export class HistoryLogsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Data properties
  logs: SystemLog[] = [];
  filteredLogs: SystemLog[] = [];
  dataSets: DataSet[] = [];
  comparisonResult: ComparisonResult | null = null;

  // Form properties
  searchForm!: FormGroup;
  filterForm!: FormGroup;
  comparisonForm!: FormGroup;

  // UI state
  currentView: 'timeline' | 'tabular' | 'comparison' = 'timeline';
  isLoading = false;
  showExportModal = false;
  exportFormat: 'csv' | 'json' | 'pdf' = 'csv';

  // Filter options
  eventTypes: string[] = [];
  selectedEventTypes: string[] = ['scans'];

  // Sample data for demonstration
  sampleLogs: SystemLog[] = [
    {
      id: 'scan-20231026-A1',
      type: 'scan',
      title: 'Scan Event',
      message: 'Infection: 15% | Spray Duration: 2 hours | Cost Saved: $500',
      timestamp: new Date('2023-10-26'),
      scanId: '20231026-A1',
      infectionRate: 15,
      sprayDuration: 2,
      costSaved: 500,
      severity: 'medium',
      isRead: true
    },
    {
      id: 'spray-20231027-A',
      type: 'spray_event',
      title: 'Spraying Event',
      message: 'October 27, 2023 - Zone A - 50L Pesticide',
      timestamp: new Date('2023-10-27'),
      zone: 'A',
      pesticideAmount: 50,
      note: 'Noticed a higher than usual pest concentration near the riverbank. Adjusted spray pattern to compensate.',
      severity: 'low',
      isRead: true
    },
    {
      id: 'alert-20231028-001',
      type: 'critical_alert',
      title: 'Critical Alert',
      message: 'High infection rate detected in Zone B - Immediate action required',
      timestamp: new Date('2023-10-28'),
      zone: 'B',
      severity: 'critical',
      isRead: false
    },
    {
      id: 'update-20231029-001',
      type: 'system_update',
      title: 'System Update',
      message: 'AI model updated to version 2.1.3 - Improved accuracy by 5%',
      timestamp: new Date('2023-10-29'),
      severity: 'low',
      isRead: true
    }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly logsService: LogsService,
    private readonly api: ApiService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadData();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    this.filterForm = this.fb.group({
      eventTypes: [['scans']],
      dateRange: this.fb.group({
        start: [''],
        end: ['']
      })
    });

    this.comparisonForm = this.fb.group({
      dataset1: ['infection-rate-oct-2023'],
      dataset2: ['pesticide-usage-oct-2023']
    });
  }

  private loadData(): void {
    this.eventTypes = this.logsService.getEventTypes();
    this.dataSets = this.logsService.getDataSets();
    this.logs = [...this.sampleLogs];

    this.logsService.getAllLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe(logs => {
        this.logs = [...this.sampleLogs, ...logs];
        this.applyFilters();
      });

    // Load recent logs from backend API and merge
    this.api.getRecentLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (recent: any[]) => {
          const apiLogs: SystemLog[] = (recent || []).map(item => ({
            id: item._id || item.id,
            type: (item.type || 'system_update'),
            title: item.title || item.message || 'Log',
            message: item.message || '',
            timestamp: item.createdAt ? new Date(item.createdAt) : new Date(),
            severity: item.severity || 'low',
            isRead: !!item.isRead,
            scanId: item.scanId,
            zone: item.zone,
            infectionRate: item.infectionRate,
            sprayDuration: item.sprayDuration,
            costSaved: item.costSaved,
            note: item.note
          } as SystemLog));
          // Merge and dedupe by id
          const byId: { [k: string]: SystemLog } = {};
          [...this.sampleLogs, ...this.logs, ...apiLogs].forEach(l => { if (l) byId[l.id] = l; });
          this.logs = Object.values(byId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          this.applyFilters();
        },
        error: () => {}
      });

    this.applyFilters();
  }

  private setupSubscriptions(): void {
    // Search subscription
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.applyFilters());

    // Filter subscription
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    // Comparison subscription
    this.comparisonForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.performComparison());
  }

  private applyFilters(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value || '';
    const eventTypes = this.filterForm.get('eventTypes')?.value || [];
    const dateRange = this.filterForm.get('dateRange')?.value;

    let filtered = [...this.logs];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.title.toLowerCase().includes(term) ||
        log.message.toLowerCase().includes(term) ||
        log.scanId?.toLowerCase().includes(term) ||
        log.zone?.toLowerCase().includes(term)
      );
    }

    // Event type filter
    if (eventTypes.length > 0) {
      filtered = filtered.filter(log => {
        if (eventTypes.includes('scans') && log.type === 'scan') return true;
        if (eventTypes.includes('spray_events') && log.type === 'spray_event') return true;
        if (eventTypes.includes('critical_alerts') && log.type === 'critical_alert') return true;
        if (eventTypes.includes('system_updates') && log.type === 'system_update') return true;
        return false;
      });
    }

    // Date range filter
    if (dateRange?.start && dateRange?.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter(log =>
        log.timestamp >= startDate && log.timestamp <= endDate
      );
    }

    this.filteredLogs = filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  performComparison(): void {
    const dataset1Id = this.comparisonForm.get('dataset1')?.value;
    const dataset2Id = this.comparisonForm.get('dataset2')?.value;

    if (dataset1Id && dataset2Id && dataset1Id !== dataset2Id) {
      this.comparisonResult = this.logsService.compareDataSets(dataset1Id, dataset2Id);
    } else {
      this.comparisonResult = null;
    }
  }

  // View switching
  switchView(view: 'timeline' | 'tabular' | 'comparison'): void {
    this.currentView = view;
    if (view === 'comparison') {
      this.performComparison();
    }
  }

  // Event type filtering
  toggleEventType(eventType: string): void {
    const currentTypes = this.filterForm.get('eventTypes')?.value || [];
    if (currentTypes.includes(eventType)) {
      this.filterForm.patchValue({
        eventTypes: currentTypes.filter((type: string) => type !== eventType)
      });
    } else {
      this.filterForm.patchValue({
        eventTypes: [...currentTypes, eventType]
      });
    }
  }

  isEventTypeSelected(eventType: string): boolean {
    return this.selectedEventTypes.includes(eventType);
  }

  // Export functionality
  openExportModal(): void {
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  exportLogs(): void {
    const exportData = this.logsService.exportLogs(this.exportFormat);

    if (this.exportFormat === 'csv') {
      this.downloadCSV(exportData, 'logs-export.csv');
    } else if (this.exportFormat === 'json') {
      this.downloadJSON(exportData, 'logs-export.json');
    } else if (this.exportFormat === 'pdf') {
      // PDF export would need a proper PDF library
      console.log('PDF export:', exportData);
    }

    this.closeExportModal();
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private downloadJSON(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Utility methods
  getEventTypeIcon(eventType: string): string {
    const icons: { [key: string]: string } = {
      'scans': 'bi-search',
      'spray_events': 'bi-droplet',
      'critical_alerts': 'bi-exclamation-triangle-fill',
      'system_updates': 'bi-gear'
    };
    return icons[eventType] || 'bi-circle';
  }

  getEventTypeColor(eventType: string): string {
    const colors: { [key: string]: string } = {
      'scans': 'text-success',
      'spray_events': 'text-primary',
      'critical_alerts': 'text-danger',
      'system_updates': 'text-info'
    };
    return colors[eventType] || 'text-secondary';
  }

  getLogIcon(type: string): string {
    return this.logsService.getLogIcon(type as any);
  }

  getLogColor(type: string): string {
    return this.logsService.getLogColor(type as any);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return this.formatDate(date);
  }

  // Action methods
  replayHeatmap(log: SystemLog): void {
    console.log('Replaying heatmap for:', log);
    // Implementation for replaying heatmap
  }

  addNote(log: SystemLog): void {
    console.log('Adding note for:', log);
    // Implementation for adding notes
  }

  filterEvents(): void {
    console.log('Filter events clicked');
    // Implementation for advanced filtering
  }

  compareDataSets(): void {
    this.performComparison();
  }

  formatEventTypeName(eventType: string): string {
    return eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
