import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService, KeyMetric, Equipment, FieldStatus, Alert } from '../../services/dashboard.service';
import { WeatherService, WeatherData, WeatherAlert } from '../../services/weather.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  forecastData = [
  { day: 'Mon', icon: 'fa-sun', temp: 32, rain: 10 },
  { day: 'Tue', icon: 'fa-cloud', temp: 30, rain: 20 },
  { day: 'Wed', icon: 'fa-cloud-showers-heavy', temp: 28, rain: 70 },
  { day: 'Thu', icon: 'fa-bolt', temp: 29, rain: 40 },
  { day: 'Fri', icon: 'fa-cloud-sun', temp: 31, rain: 15 },
  { day: 'Sat', icon: 'fa-snowflake', temp: 18, rain: 50 },
  { day: 'Sun', icon: 'fa-sun', temp: 33, rain: 5 },
];

  // Dashboard data
  keyMetrics: KeyMetric[] = [];
  equipment: Equipment[] = [];
  fieldStatus: FieldStatus[] = [];
  alerts: Alert[] = [];
  weatherData: WeatherData | null = null;
  weatherAlerts: WeatherAlert[] = [];

  // Backend summary/public stats
  totalUsers?: number;
  avgFarmSize?: number;
  newThisWeek?: number;
  avgMonthlyExpenditure?: number;
  recentUsers: any[] = [];

  // UI state
  isLoading = true;
  selectedFarm = 'Green Acres';
  farmOptions = ['Green Acres', 'Sunrise Farm', 'Valley Fields'];
  currentUser = 'Guest';
  currentLocation = 'Iowa';

  // Dashboard sections
  dashboardTitle = 'AgriTrack';
  welcomeMessage = `Welcome back, ${this.currentUser}!`;
  farmInfo = `Farm: ${this.selectedFarm} | Crop: Corn | Location: ${this.currentLocation}`;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly weatherService: WeatherService,
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Update welcome name dynamically from auth state
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user?.fullName || 'Guest';
        this.welcomeMessage = `Welcome back, ${this.currentUser}!`;
      });

    this.loadDashboardData();
    // this.loadBackendSummary();
    this.loadWeatherData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // private loadBackendSummary(): void {
  //   // Load summary numbers
  //   this.apiService.getSummary()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (summary) => {
  //         this.totalUsers = summary.totalUsers;
  //         this.newThisWeek = summary.newThisWeek;
  //         this.avgFarmSize = summary.avgFarmSize;
  //         // this.mergeSummaryIntoMetrics();
  //       },
  //       error: () => {}
  //     });

  //   // Load public stats
  //   this.apiService.getPublicStats()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (stats) => {
  //         this.avgMonthlyExpenditure = stats.avgMonthlyExpenditure;
  //         // Optionally merge into metrics as an extra card if present
  //         this.mergePublicStatsIntoMetrics(stats);
  //       },
  //       error: () => {}
  //     });

  //   // Load recent users (public)
  //   // this.apiService.getRecentUsers(10)
  //   //   .pipe(takeUntil(this.destroy$))
  //   //   .subscribe({
  //   //     next: (users) => { this.recentUsers = users || []; },
  //   //     error: () => {}
  //   //   });
  // }

  // private mergeSummaryIntoMetrics(): void {
  //   if (!this.keyMetrics || this.keyMetrics.length === 0) return;

  //   // Update or append metrics for total users and new users this week
  //   const upsert = (id: string, partial: Partial<KeyMetric>) => {
  //     const idx = this.keyMetrics.findIndex(m => m.id === id);
  //     if (idx >= 0) {
  //       this.keyMetrics[idx] = { ...this.keyMetrics[idx], ...partial } as KeyMetric;
  //     } else {
  //       this.keyMetrics.push({
  //         id,
  //         title: partial.title || '',
  //         value: partial.value as number,
  //         unit: partial.unit || '',
  //         trend: partial.trend ?? 0,
  //         trendDirection: (partial.trendDirection as any) || 'up',
  //         icon: partial.icon || 'bi-info-circle',
  //         color: partial.color || 'primary',
  //         description: partial.description || ''
  //       } as KeyMetric);
  //     }
  //   };

  //   if (typeof this.totalUsers === 'number') {
  //     upsert('total-users', {
  //       title: 'Total Users',
  //       value: this.totalUsers,
  //       unit: '',
  //       icon: 'bi-people-fill',
  //       color: 'primary',
  //       description: 'Users registered in the system'
  //     });
  //   }

  //   if (typeof this.newThisWeek === 'number') {
  //     upsert('new-users-week', {
  //       title: 'New Users (7d)',
  //       value: this.newThisWeek,
  //       unit: '',
  //       icon: 'bi-person-plus-fill',
  //       color: 'success',
  //       description: 'New registrations this week'
  //     });
  //   }

  //   if (typeof this.avgFarmSize === 'number') {
  //     upsert('avg-farm-size', {
  //       title: 'Avg. Farm Size',
  //       value: this.avgFarmSize,
  //       unit: 'acres',
  //       icon: 'bi-bar-chart',
  //       color: 'secondary',
  //       description: 'Average farm size across users'
  //     });
  //   }
  // }

  private mergePublicStatsIntoMetrics(stats: { totalUsers: number; avgFarmSize: number; avgMonthlyExpenditure: number }): void {
    const idx = this.keyMetrics.findIndex(m => m.id === 'avg-monthly-expenditure');
    const card: KeyMetric = {
      id: 'avg-monthly-expenditure',
      title: 'Avg. Monthly Expenditure',
      value: stats.avgMonthlyExpenditure,
      unit: '$',
      trend: 0,
      trendDirection: 'up',
      icon: 'bi-cash-coin',
      color: 'warning',
      description: 'Average spend reported by users'
    };
    if (idx >= 0) {
      this.keyMetrics[idx] = { ...this.keyMetrics[idx], ...card };
    } else {
      this.keyMetrics.push(card);
    }
  }

  private loadDashboardData(): void {
    // Load key metrics
    this.dashboardService.getKeyMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => {
        this.keyMetrics = metrics;
        // this.mergeSummaryIntoMetrics();
        this.isLoading = false;
      });

    // Load equipment
    this.dashboardService.getEquipment()
      .pipe(takeUntil(this.destroy$))
      .subscribe(equipment => {
        this.equipment = equipment;
      });

    // Load field status
    this.dashboardService.getFieldStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(fields => {
        this.fieldStatus = fields;
      });

    // Load alerts
    this.dashboardService.getAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(alerts => {
        this.alerts = alerts;
      });
  }

  private loadWeatherData(): void {
    // Load current weather
    this.weatherService.getCurrentWeather()
      .pipe(takeUntil(this.destroy$))
      .subscribe(weather => {
        this.weatherData = weather;
      });

    // Load weather alerts
    this.weatherService.getWeatherAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(alerts => {
        this.weatherAlerts = alerts;
      });
  }

  // Utility methods
  getStatusColor(status: string): string {
    return this.dashboardService.getStatusColor(status);
  }

  getStatusIcon(status: string): string {
    return this.dashboardService.getStatusIcon(status);
  }

  getTrendIcon(direction: 'up' | 'down'): string {
    return this.dashboardService.getTrendIcon(direction);
  }

  getTrendColor(direction: 'up' | 'down', metricId: string): string {
    return this.dashboardService.getTrendColor(direction, metricId);
  }

  getWeatherIcon(condition: string): string {
    return this.weatherService.getWeatherIcon(condition);
  }

  getAlertIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'pest': 'bi-bug',
      'disease': 'bi-virus',
      'equipment': 'bi-tools',
      'weather': 'bi-cloud-lightning',
      'irrigation': 'bi-house-gear'
    };
    return iconMap[type] || 'bi-exclamation-triangle';
  }

  getSeverityColor(severity: string): string {
    const colorMap: { [key: string]: string } = {
      'low': 'text-danger',
      'medium': 'text-warning',
      'high': 'text-danger',
      'critical': 'text-danger'
    };
    return colorMap[severity] || 'text-secondary';
  }

  getSeverityBadgeClass(severity: string): string {
    const badgeMap: { [key: string]: string } = {
      'low': 'badge bg-danger',
      'medium': 'badge bg-warning',
      'high': 'badge bg-danger',
      'critical': 'badge bg-danger'
    };
    return badgeMap[severity] || 'badge bg-secondary';
  }

  formatTimeAgo(date: Date): string {
    return this.dashboardService.formatTimeAgo(date);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  onFarmChange(farm: string): void {
    this.selectedFarm = farm;
    this.farmInfo = `Farm: ${farm} | Crop: Corn | Location: ${this.currentLocation}`;
    // In a real app, you would reload data based on selected farm
  }

  onAlertClick(alert: Alert): void {
    if (!alert.isRead) {
      this.dashboardService.markAlertAsRead(alert.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          alert.isRead = true;
        });
    }
  }

  onEquipmentClick(equipment: Equipment): void {
    // Navigate to equipment details or show modal
    console.log('Equipment clicked:', equipment);
  }

  onFieldClick(field: FieldStatus): void {
    // Navigate to field details or show modal
    console.log('Field clicked:', field);
  }

  refreshData(): void {
    this.isLoading = true;
    this.loadDashboardData();
    // this.loadBackendSummary();
    this.loadWeatherData();
  }

  // Test method for toast functionality (remove in production)
  testToast(type: 'success' | 'error' | 'info' | 'warning'): void {
    const messages = {
      success: 'This is a success toast message!',
      error: 'This is an error toast message!',
      info: 'This is an info toast message!',
      warning: 'This is a warning toast message!'
    };
    this.toastService.show(messages[type], type);
  }
}
