import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotService, Analytic, Plant, LogEntry } from '../../services/bot.services';
@Component({
  selector: 'app-logs',
  standalone: false,
  templateUrl: './logs.html',
  styleUrl: './logs.scss'
})
export class Logs implements OnInit {
 allLogs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];
  isLoading: boolean = true;
  lastUpdated: Date = new Date();

  // Filter settings
  filterType: string = '';
  logLimit: number = 50;

  // Statistics
  totalLogs: number = 0;
  movementLogs: number = 0;
  fertilizationLogs: number = 0;

  constructor(private farmingApi: BotService) {}

  ngOnInit() {
    this.loadLogs();

    // Auto-refresh every 5 seconds
    // setInterval(() => {
    //   this.loadLogs(false);
    // }, 5000);
  }

  loadLogs(showLoading: boolean = true) {
    if (showLoading) {
      this.isLoading = true;
    }

    this.farmingApi.getLogs(this.logLimit).subscribe(
      logs => {
        this.allLogs = logs;
        this.calculateStatistics();
        this.applyFilters();
        this.lastUpdated = new Date();
        this.isLoading = false;
      },
      error => {
        console.error('Failed to load logs:', error);
        this.isLoading = false;
      }
    );
  }

  refreshLogs() {
    this.loadLogs(true);
  }

  applyFilters() {
    if (!Array.isArray(this.allLogs)) {
      this.filteredLogs = [];
      return;
    }
    
    if (this.filterType === '') {
      this.filteredLogs = [...this.allLogs];
    } else {
      this.filteredLogs = this.allLogs.filter(log => log.action === this.filterType);
    }
  }

  calculateStatistics() {
    if (!Array.isArray(this.allLogs)) {
      this.totalLogs = 0;
      this.movementLogs = 0;
      this.fertilizationLogs = 0;
      return;
    }
    this.totalLogs = this.allLogs.length;
    this.movementLogs = this.allLogs.filter(log => log.action === 'movement').length;
    this.fertilizationLogs = this.allLogs.filter(log => log.action === 'fertilization').length;
  }

  exportLogs() {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `farming-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(): string {
    const headers = ['ID', 'Timestamp', 'Action', 'X', 'Y', 'Details'];
    
    if (!Array.isArray(this.filteredLogs)) {
      return headers.join(',') + '\n';
    }
    
    const rows = this.filteredLogs.map(log => [
      log.id,
      log.timestamp,
      log.action,
      log.x || '',
      log.y || '',
      `"${log.details.replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  // Formatting methods
  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString();
  }

  getRelativeTime(timestamp: string): string {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffMs = now.getTime() - logTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return this.formatDate(timestamp);
  }

  // Styling methods
  getActionIcon(action: string): string {
    switch (action) {
      case 'movement': return 'bi bi-arrow-right-circle';
      case 'fertilization': return 'bi bi-droplet-fill';
      default: return 'bi bi-info-circle';
    }
  }

  getActionBadgeClass(action: string): string {
    switch (action) {
      case 'movement': return 'bg-primary';
      case 'fertilization': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getTimelineMarkerClass(action: string): string {
    switch (action) {
      case 'movement': return 'timeline-marker-primary';
      case 'fertilization': return 'timeline-marker-success';
      default: return 'timeline-marker-secondary';
    }
  }

  getRowClass(action: string, index: number): string {
    const baseClass = index % 2 === 0 ? 'table-row-even' : 'table-row-odd';
    return `${baseClass} log-${action}`;
  }

  // Statistics methods
  getRecentLogsCount(): number {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (!Array.isArray(this.allLogs)) {
      return 0;
    }
    return this.allLogs.filter(log => new Date(log.timestamp) > oneDayAgo).length;
  }

  getRecentActivity(): LogEntry[] {
    if (!Array.isArray(this.allLogs)) {
      return [];
    }
    return this.allLogs.slice(0, 10);
  }

  getMovementPercentage(): number {
    if (this.totalLogs === 0) return 0;
    return Math.round((this.movementLogs / this.totalLogs) * 100);
  }

  getFertilizationPercentage(): number {
    if (this.totalLogs === 0) return 0;
    return Math.round((this.fertilizationLogs / this.totalLogs) * 100);
  }
}
