import { Component, OnInit } from '@angular/core';
import { ApiService, User } from '../../services/api.service';

@Component({
  selector: 'app-analytics',
  standalone: false,
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss'
})
export class Analytics implements OnInit {
  isLoading = false;
  errorMessage = '';

  // Single user profile
  user: User | null = null;

  // Derived analytics
  monthlyExpenditureSeries: number[] = []; // last 12 months
  jobsByMonth: { month: string; completed: number; pending: number }[] = [];
  cropsBreakdown: { label: string; value: number }[] = [];
  devicesCount = 0;
  fieldsCount = 0;
  jobsSummary = { total: 0, completed: 0, pending: 0 };
  latestHealthReport: any = null;

  // Raw datasets for interactive tables
  fields: any[] = [];
  devices: any[] = [];
  crops: any[] = [];
  jobs: any[] = [];

  // Preview/insights datasets (bind real API if available, else demo)
  notificationsPreview: any[] = [];
  activitiesPreview: any[] = [];
  financeSummary: any = null;
  weatherPreview: any = null;
  logsPreview: any[] = [];
  publicStats: { totalUsers?: number; avgFarmSize?: number; avgMonthlyExpenditure?: number } = {};

  // Coming-soon registry to surface future datasets on UI
  upcomingDatasets: Array<{ key: string; title: string; description: string; available: boolean }> = [
    { key: 'notifications', title: 'Notifications', description: 'System and farm alerts preview', available: false },
    { key: 'activities', title: 'Recent Activities', description: 'Latest actions in your account', available: false },
    { key: 'financeSummary', title: 'Finance Summary', description: 'Aggregated spend and trends', available: false },
    { key: 'weather', title: 'Weather Cache', description: 'Cached weather for your farm', available: false },
    { key: 'logs', title: 'App Logs', description: 'Recent system logs snapshot', available: false },
    { key: 'publicStats', title: 'Public Stats', description: 'Platform-wide aggregates', available: false }
  ];

  // Field filter state
  selectedFieldId: string = 'all';

  constructor(private readonly apiService: ApiService) { }

  ngOnInit(): void {
    this.loadUserAnalytics();
  }

  loadUserAnalytics() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Fetch profile first, then parallel load of related datasets
    this.apiService.getProfile().subscribe({
      next: (res) => {
        if (!res?.success || !res.user) {
          this.isLoading = false;
          this.errorMessage = res?.message || 'Failed to load profile';
          return;
        }
        this.user = res.user;

        // Load dependent resources in parallel via forkJoin-like manual subs
        let pending = 6;
        const done = () => { pending--; if (pending === 0) { this.isLoading = false; } };
        const fail = (err: any) => { this.errorMessage = err?.message || 'Failed to load analytics'; this.isLoading = false; };

        this.apiService.getFinanceRecords().subscribe({
          next: (res: any) => {
            try {
              const records = Array.isArray(res) ? res : (res?.entries || []);
              this.monthlyExpenditureSeries = this.computeLast12MonthsSpend(records);
            } catch (e: any) { console.error('finance parse error', e); }
            finally { done(); }
          },
          error: fail
        });

        this.apiService.getJobs().subscribe({
          next: (res: any) => {
            try {
              const jobs = Array.isArray(res) ? res : (res?.jobs || []);
              this.processJobs(jobs);
              this.jobs = jobs;
            } catch (e: any) { console.error('jobs parse error', e); }
            finally { done(); }
          },
          error: fail
        });

        this.apiService.getCrops().subscribe({
          next: (res: any) => {
            try {
              const crops = Array.isArray(res) ? res : (res?.crops || []);
              this.processCrops(crops);
              this.crops = crops;
            } catch (e: any) { console.error('crops parse error', e); }
            finally { done(); }
          },
          error: fail
        });

        this.apiService.getDevices().subscribe({
          next: (res: any) => {
            try {
              const devices = Array.isArray(res) ? res : (res?.devices || []);
              this.devicesCount = devices.length;
              this.devices = devices;
            } catch (e: any) { console.error('devices parse error', e); }
            finally { done(); }
          },
          error: fail
        });

        this.apiService.getFields().subscribe({
          next: (res: any) => {
            try {
              const fields = Array.isArray(res) ? res : (res?.fields || []);
              this.fieldsCount = fields.length;
              this.fields = fields;
            } catch (e: any) { console.error('fields parse error', e); }
            finally { done(); }
          },
          error: fail
        });

        this.apiService.getHealthReports().subscribe({
          next: (res: any) => {
            try {
              const reports = Array.isArray(res) ? res : (res?.reports || []);
              this.latestHealthReport = (reports || [])[0] || null;
            } catch (e: any) { console.error('health reports parse error', e); }
            finally { done(); }
          },
          error: fail
        });

        // Soft-load optional/preview datasets (non-blocking)
        this.loadPreviews();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to load profile';
      }
    });
  }

  refreshData() {
    this.loadUserAnalytics();
  }

  // ===== Analytics computation =====
  private computeLast12MonthsSpend(records: any[]): number[] {
    const now = new Date();
    const buckets = new Array(12).fill(0);
    for (const rec of records) {
      const d = new Date(rec?.date || rec?.createdAt || now);
      const monthsDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (monthsDiff >= 0 && monthsDiff < 12) {
        const idx = 11 - monthsDiff; // oldest at 0, latest at 11
        const amount = Number(rec?.amount || rec?.cost || 0);
        buckets[idx] += isNaN(amount) ? 0 : amount;
      }
    }
    return buckets;
  }

  private processJobs(jobs: any[]): void {
    const now = new Date();
    const labels = [] as { month: string; year: number; idx: number }[];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push({ month: d.toLocaleString(undefined, { month: 'short' }), year: d.getFullYear(), idx: labels.length });
    }
    const completed = new Array(12).fill(0);
    const pending = new Array(12).fill(0);
    let total = 0, done = 0, pend = 0;
    for (const job of jobs) {
      const d = new Date(job?.date || job?.scheduledFor || job?.createdAt || now);
      const monthsDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (monthsDiff >= 0 && monthsDiff < 12) {
        const idx = 11 - monthsDiff;
        total++;
        if ((job?.status || '').toLowerCase() === 'completed') { completed[idx]++; done++; } else { pending[idx]++; pend++; }
      }
    }
    this.jobsSummary = { total, completed: done, pending: pend };
    this.jobsByMonth = labels.map((l, i) => ({ month: l.month, completed: completed[i], pending: pending[i] }));
  }

  private processCrops(crops: any[]): void {
    const primary = (this.user?.primaryCrops || []).length;
    const secondary = (this.user?.secondaryCrops || []).length;
    const others = Math.max(0, (crops || []).length - primary - secondary);
    this.cropsBreakdown = [
      { label: 'Primary', value: primary },
      { label: 'Secondary', value: secondary },
      { label: 'Other', value: others }
    ];
  }

  // ===== Lightweight SVG helpers =====
  getSparklinePath(values: number[], width = 280, height = 60, padding = 6): string {
    if (!values || values.length === 0) return '';
    const n = values.length;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const xStep = (width - padding * 2) / (n - 1);
    const scaleY = (val: number) => {
      if (max === min) return height / 2;
      return height - padding - ((val - min) / (max - min)) * (height - padding * 2);
    };
    let d = '';
    values.forEach((v, i) => {
      const x = padding + i * xStep;
      const y = scaleY(v);
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return d;
  }

  getBarHeights(pairs: { completed: number; pending: number }[], maxHeight = 80): { c: number; p: number }[] {
    const maxVal = Math.max(1, ...pairs.map(x => Math.max(x.completed, x.pending)));
    return pairs.map(x => ({
      c: Math.round((x.completed / maxVal) * maxHeight),
      p: Math.round((x.pending / maxVal) * maxHeight)
    }));
  }

  getDonutMetrics(series: { label: string; value: number }[], radius = 48) {
    const total = series.reduce((s, x) => s + x.value, 0) || 1;
    const circumference = 2 * Math.PI * radius;
    const segments = series.map(x => ({
      label: x.label,
      value: x.value,
      dash: (x.value / total) * circumference,
    }));
    return { circumference, segments };
  }

  // ===== Template helpers =====
  trackById(index: number, item: any) {
    return item && item._id ? item._id : index;
  }

  // ===== Optional preview loaders with demo fallbacks =====
  private loadPreviews(): void {
    // Notifications
    this.apiService.getNotifications().subscribe({
      next: (res: any) => {
        const arr = Array.isArray(res) ? res : (res?.notifications || []);
        this.notificationsPreview = (arr || []).slice(0, 5);
        this.setAvailable('notifications', this.notificationsPreview.length > 0);
      },
      error: () => {
        this.notificationsPreview = [
          { _id: 'demo-n1', title: 'Irrigation scheduled', createdAt: new Date(), level: 'info' },
          { _id: 'demo-n2', title: 'Device 1 needs maintenance', createdAt: new Date(), level: 'warning' },
        ];
        this.setAvailable('notifications', false);
      }
    });

    // Activities
    this.apiService.getRecentActivities().subscribe({
      next: (arr: any[]) => {
        this.activitiesPreview = (arr || []).slice(0, 5);
        this.setAvailable('activities', this.activitiesPreview.length > 0);
      },
      error: () => {
        this.activitiesPreview = [
          { _id: 'demo-a1', action: 'Updated profile', createdAt: new Date() },
          { _id: 'demo-a2', action: 'Added field Field 5', createdAt: new Date() }
        ];
        this.setAvailable('activities', false);
      }
    });

    // Finance summary
    this.apiService.getFinanceSummary().subscribe({
      next: (sum: any) => {
        this.financeSummary = sum || null;
        this.setAvailable('financeSummary', !!this.financeSummary);
      },
      error: () => {
        this.financeSummary = { totalSpend: this.monthlyExpenditureSeries.reduce((s, x) => s + x, 0) };
        this.setAvailable('financeSummary', false);
      }
    });

    // Weather (use farmLocation if available)
    const location = this.user?.farmLocation || 'Barahiya';
    this.apiService.getCachedWeather(location).subscribe({
      next: (wx: any) => {
        this.weatherPreview = wx || null;
        this.setAvailable('weather', !!this.weatherPreview);
      },
      error: () => {
        this.weatherPreview = { location, tempC: 30, condition: 'Sunny' };
        this.setAvailable('weather', false);
      }
    });

    // Logs
    this.apiService.getRecentLogs().subscribe({
      next: (arr: any[]) => {
        this.logsPreview = (arr || []).slice(0, 5);
        this.setAvailable('logs', this.logsPreview.length > 0);
      },
      error: () => {
        this.logsPreview = [
          { _id: 'demo-l1', level: 'info', message: 'System healthy', createdAt: new Date() }
        ];
        this.setAvailable('logs', false);
      }
    });

    // Public stats
    this.apiService.getPublicStats().subscribe({
      next: (s: any) => {
        this.publicStats = s || {};
        this.setAvailable('publicStats', !!(s && (s.totalUsers || s.avgFarmSize)));
      },
      error: () => {
        this.publicStats = { totalUsers: 1, avgFarmSize: this.user?.farmSize || 0 };
        this.setAvailable('publicStats', false);
      }
    });
  }

  private setAvailable(key: string, available: boolean) {
    const idx = this.upcomingDatasets.findIndex(x => x.key === key);
    if (idx >= 0) {
      this.upcomingDatasets[idx] = { ...this.upcomingDatasets[idx], available };
    }
  }

  // Badge helpers for template (avoid complex expressions in HTML)
  isDatasetAvailable(key: string): boolean {
    const item = this.upcomingDatasets.find(x => x.key === key);
    return !!(item && item.available);
  }

  getDatasetBadgeClass(key: string): string {
    return this.isDatasetAvailable(key) ? 'bg-success' : 'bg-secondary';
  }

  getDatasetModeLabel(key: string): string {
    return this.isDatasetAvailable(key) ? 'Live' : 'Demo';
  }

  // ===== Field filter helpers =====
  setSelectedField(id: string) {
    this.selectedFieldId = id || 'all';
  }

  getSelectedField(): any | null {
    if (this.selectedFieldId === 'all') return null;
    return this.fields.find(f => f && f._id === this.selectedFieldId) || null;
  }

  getJobsForSelected(): any[] {
    if (this.selectedFieldId === 'all') return this.jobs;
    return (this.jobs || []).filter(j => j && j.fieldId === this.selectedFieldId);
  }

  getCropsForSelected(): any[] {
    if (this.selectedFieldId === 'all') return this.crops;
    return (this.crops || []).filter(c => c && (c.fieldId === this.selectedFieldId));
  }

  getSelectedFieldJobSummary(): { total: number; completed: number; pending: number } {
    const arr = this.getJobsForSelected();
    let total = 0, completed = 0, pending = 0;
    for (const j of arr) {
      total++;
      if ((j?.status || '').toLowerCase() === 'completed') completed++; else pending++;
    }
    return { total, completed, pending };
  }
}