import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/services/api.service';
import { SocketService } from '../../services/services/socket.service';
import { Subscription } from 'rxjs';
import { Alert, AlertStats, AlertType, AlertSeverity, AlertStatus } from '../../models/bot.models';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-9">
          <div class="card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                  System Alerts & Notifications
                </h5>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-success" (click)="markAllAsRead()">
                    <i class="fas fa-check-double me-1"></i>Mark All Read
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="clearResolvedAlerts()">
                    <i class="fas fa-trash me-1"></i>Clear Resolved
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body">
              <!-- Filter Controls -->
              <div class="row mb-4">
                <div class="col-md-3">
                  <select class="form-select" [(ngModel)]="filterType" (change)="applyFilters()">
                    <option value="">All Types</option>
                    <option value="low_battery">Low Battery</option>
                    <option value="low_fertilizer">Low Fertilizer</option>
                    <option value="low_water">Low Water</option>
                    <option value="plant_health">Plant Health</option>
                    <option value="system_error">System Error</option>
                    <option value="task_failed">Task Failed</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <select class="form-select" [(ngModel)]="filterSeverity" (change)="applyFilters()">
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <select class="form-select" [(ngModel)]="filterStatus" (change)="applyFilters()">
                    <option value="">All Status</option>
                    <option value="unresolved">Unresolved</option>
                    <option value="resolved">Resolved</option>
                    <option value="acknowledged">Acknowledged</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-outline-secondary w-100" (click)="clearFilters()">
                    <i class="fas fa-times me-1"></i>Clear Filters
                  </button>
                </div>
              </div>

              <!-- Alerts List -->
              <div *ngIf="filteredAlerts.length === 0" class="text-center text-muted py-5">
                <i class="fas fa-bell-slash fa-3x mb-3"></i>
                <h5>No Alerts Found</h5>
                <p>{{ alerts.length === 0 ? 'All systems are running smoothly!' : 'Try adjusting your filters.' }}</p>
              </div>

              <div *ngFor="let alert of filteredAlerts"
                   class="alert-item mb-3 p-3 border rounded"
                   [class.border-danger]="alert.severity === 'critical'"
                   [class.border-warning]="alert.severity === 'warning'"
                   [class.border-info]="alert.severity === 'info'"
                   [class.alert-resolved]="alert.resolved">

                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-2">
                      <i class="fas me-2"
                         [class.fa-battery-quarter]="alert.type === 'low_battery'"
                         [class.fa-tint]="alert.type === 'low_fertilizer' || alert.type === 'low_water'"
                         [class.fa-leaf]="alert.type === 'plant_health'"
                         [class.fa-exclamation-circle]="alert.type === 'system_error'"
                         [class.fa-times-circle]="alert.type === 'task_failed'"
                         [class.text-danger]="alert.severity === 'critical'"
                         [class.text-warning]="alert.severity === 'warning'"
                         [class.text-info]="alert.severity === 'info'"></i>

                      <span class="badge me-2"
                            [class.bg-danger]="alert.severity === 'critical'"
                            [class.bg-warning]="alert.severity === 'warning'"
                            [class.bg-info]="alert.severity === 'info'">
                        {{ alert.severity | titlecase }}
                      </span>

                      <span class="badge bg-secondary me-2">
                        {{ getTypeLabel(alert.type) }}
                      </span>

                      <small class="text-muted">
                        {{ alert.created_at | date:'medium' }}
                      </small>
                    </div>

                    <div class="alert-message mb-2">
                      <strong>{{ alert.message }}</strong>
                    </div>

                    <!-- Alert Data -->
                    <div *ngIf="alert.data && objectKeys(alert.data).length > 0" class="alert-data mb-2">
                      <small class="text-muted">
                        <span *ngIf="alert.data.battery">Battery: {{ alert.data.battery }}%</span>
                        <span *ngIf="alert.data.fertilizer_level">Fertilizer: {{ alert.data.fertilizer_level }}%</span>
                        <span *ngIf="alert.data.water_level">Water: {{ alert.data.water_level }}%</span>
                        <span *ngIf="alert.data.x !== undefined && alert.data.y !== undefined">
                          Position: ({{ alert.data.x }}, {{ alert.data.y }})
                        </span>
                        <span *ngIf="alert.data.health">Health: {{ alert.data.health }}%</span>
                      </small>
                    </div>

                    <!-- Status Information -->
                    <div class="alert-status">
                      <span *ngIf="alert.acknowledged && !alert.resolved" class="badge bg-primary me-1">
                        <i class="fas fa-eye me-1"></i>Acknowledged
                      </span>
                      <span *ngIf="alert.resolved" class="badge bg-success me-1">
                        <i class="fas fa-check me-1"></i>Resolved
                      </span>
                      <span *ngIf="!alert.acknowledged && !alert.resolved" class="badge bg-warning me-1">
                        <i class="fas fa-bell me-1"></i>New
                      </span>
                    </div>
                  </div>

                  <div class="alert-actions">
                    <div class="btn-group btn-group-sm">
                      <button *ngIf="!alert.acknowledged"
                              class="btn btn-outline-primary"
                              (click)="acknowledgeAlert(alert._id)"
                              title="Acknowledge">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button *ngIf="!alert.resolved"
                              class="btn btn-outline-success"
                              (click)="resolveAlert(alert._id)"
                              title="Resolve">
                        <i class="fas fa-check"></i>
                      </button>
                      <button class="btn btn-outline-danger"
                              (click)="deleteAlert(alert._id)"
                              title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Sidebar -->
        <div class="col-lg-3">
          <div class="card mb-4">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="fas fa-chart-bar text-info me-2"></i>
                Alert Statistics
              </h6>
            </div>
            <div class="card-body">
              <div class="row text-center mb-3">
                <div class="col-4">
                  <h4 class="text-danger">{{ alertStats.criticalAlerts || 0 }}</h4>
                  <small class="text-muted">Critical</small>
                </div>
                <div class="col-4">
                  <h4 class="text-warning">{{ getWarningCount() }}</h4>
                  <small class="text-muted">Warning</small>
                </div>
                <div class="col-4">
                  <h4 class="text-info">{{ getInfoCount() }}</h4>
                  <small class="text-muted">Info</small>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between">
                  <small>Unresolved</small>
                  <small><strong>{{ alertStats.unresolvedAlerts || 0 }}</strong></small>
                </div>
                <div class="progress" style="height: 8px;">
                  <div class="progress-bar bg-warning"
                       [style.width.%]="getUnresolvedPercentage()"></div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between">
                  <small>Total Alerts</small>
                  <small><strong>{{ alertStats.totalAlerts || 0 }}</strong></small>
                </div>
              </div>
            </div>
          </div>

          <!-- Alert Types Breakdown -->
          <div class="card mb-4">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="fas fa-list text-success me-2"></i>
                Alert Types
              </h6>
            </div>
            <div class="card-body">
              <div *ngFor="let typeData of alertStats.alertsByType" class="mb-2">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <i class="fas me-2"
                       [class.fa-battery-quarter]="typeData._id === 'low_battery'"
                       [class.fa-tint]="typeData._id === 'low_fertilizer' || typeData._id === 'low_water'"
                       [class.fa-leaf]="typeData._id === 'plant_health'"
                       [class.fa-exclamation-circle]="typeData._id === 'system_error'"></i>
                    <small>{{ getTypeLabel(typeData._id) }}</small>
                  </div>
                  <span class="badge bg-secondary">{{ typeData.count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="fas fa-bolt text-warning me-2"></i>
                Quick Actions
              </h6>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button class="btn btn-sm btn-outline-danger"
                        (click)="showCriticalOnly()"
                        [disabled]="filterSeverity === 'critical'">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  Critical Only
                </button>
                <button class="btn btn-sm btn-outline-warning"
                        (click)="showUnresolvedOnly()"
                        [disabled]="filterStatus === 'unresolved'">
                  <i class="fas fa-bell me-2"></i>
                  Unresolved Only
                </button>
                <button class="btn btn-sm btn-outline-info"
                        (click)="showPlantHealthAlerts()"
                        [disabled]="filterType === 'plant_health'">
                  <i class="fas fa-leaf me-2"></i>
                  Plant Health
                </button>
                <button class="btn btn-sm btn-outline-secondary"
                        (click)="refreshAlerts()">
                  <i class="fas fa-sync me-2"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert-item {
      transition: all 0.2s ease;
    }

    .alert-item:hover {
      background: #f8f9fa;
    }

    .alert-resolved {
      opacity: 0.7;
    }

    .alert-message {
      font-size: 1rem;
      line-height: 1.4;
    }

    .alert-data {
      background: #f8f9fa;
      padding: 0.5rem;
      border-radius: 4px;
      border-left: 3px solid #dee2e6;
    }

    .alert-actions .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
    }

    .progress {
      border-radius: 10px;
    }

    .progress-bar {
      border-radius: 10px;
    }

    .badge {
      font-size: 0.75rem;
    }

    @media (max-width: 768px) {
      .alert-item .d-flex {
        flex-direction: column;
      }

      .alert-actions {
        margin-top: 1rem;
        align-self: flex-start;
      }
    }
  `]
})
export class AlertsComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  alertStats: AlertStats = { criticalAlerts: 0, unresolvedAlerts: 0, totalAlerts: 0, alertsByType: [] };

  filterType: AlertType | '' = '';
  filterSeverity: AlertSeverity | '' = '';
  filterStatus: AlertStatus | '' = '';

  private alertSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.loadAlerts();
    this.loadAlertStats();
    this.subscribeToNewAlerts();
  }

  ngOnDestroy() {
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }
  }

  loadAlerts() {
    this.apiService.getAlerts().subscribe(response => {
      if (response.success) {
        this.alerts = response['alerts'];
        this.applyFilters();
      }
    });
  }

  loadAlertStats() {
    this.apiService.getAlertStats().subscribe(response => {
      if (response.success) {
        this.alertStats = response['stats'];
      }
    });
  }

  subscribeToNewAlerts() {
    this.alertSubscription = this.socketService.onNewAlert().subscribe(alert => {
      this.alerts.unshift(alert);
      this.applyFilters();
      this.loadAlertStats();

      // Show browser notification for critical alerts
      if (alert.severity === 'critical' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Critical Alert', {
            body: alert.message,
            icon: '/assets/alert-icon.png'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Critical Alert', {
                body: alert.message,
                icon: '/assets/alert-icon.png'
              });
            }
          });
        }
      }
    });
  }

  applyFilters() {
    this.filteredAlerts = this.alerts.filter(alert => {
      const typeMatch = !this.filterType || alert.type === this.filterType;
      const severityMatch = !this.filterSeverity || alert.severity === this.filterSeverity;

      let statusMatch = true;
      if (this.filterStatus === 'unresolved') {
        statusMatch = !alert.resolved;
      } else if (this.filterStatus === 'resolved') {
        statusMatch = alert.resolved;
      } else if (this.filterStatus === 'acknowledged') {
        statusMatch = alert.acknowledged && !alert.resolved;
      }

      return typeMatch && severityMatch && statusMatch;
    });
  }

  clearFilters() {
    this.filterType = '';
    this.filterSeverity = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  acknowledgeAlert(alertId: string) {
    this.apiService.acknowledgeAlert(alertId).subscribe(response => {
      if (response.success) {
        this.loadAlerts();
        this.loadAlertStats();
      }
    });
  }

  resolveAlert(alertId: string) {
    this.apiService.resolveAlert(alertId).subscribe(response => {
      if (response.success) {
        this.loadAlerts();
        this.loadAlertStats();
      }
    });
  }

  deleteAlert(alertId: string) {
    if (confirm('Are you sure you want to delete this alert?')) {
      this.apiService.deleteAlert(alertId).subscribe(response => {
        if (response.success) {
          this.loadAlerts();
          this.loadAlertStats();
        }
      });
    }
  }

  markAllAsRead() {
    const unacknowledgedAlerts = this.alerts.filter(alert => !alert.acknowledged);

    if (unacknowledgedAlerts.length === 0) {
      alert('No unread alerts to mark as read.');
      return;
    }

    if (confirm(`Mark ${unacknowledgedAlerts.length} alerts as read?`)) {
      Promise.all(
        unacknowledgedAlerts.map(alert =>
          this.apiService.acknowledgeAlert(alert._id).toPromise()
        )
      ).then(() => {
        this.loadAlerts();
        this.loadAlertStats();
      });
    }
  }

  clearResolvedAlerts() {
    const resolvedAlerts = this.alerts.filter(alert => alert.resolved);

    if (resolvedAlerts.length === 0) {
      alert('No resolved alerts to clear.');
      return;
    }

    if (confirm(`Delete ${resolvedAlerts.length} resolved alerts?`)) {
      Promise.all(
        resolvedAlerts.map(alert =>
          this.apiService.deleteAlert(alert._id).toPromise()
        )
      ).then(() => {
        this.loadAlerts();
        this.loadAlertStats();
      });
    }
  }

  refreshAlerts() {
    this.loadAlerts();
    this.loadAlertStats();
  }

  // Quick filter methods
  showCriticalOnly() {
    this.filterSeverity = 'critical';
    this.applyFilters();
  }

  showUnresolvedOnly() {
    this.filterStatus = 'unresolved';
    this.applyFilters();
  }

  showPlantHealthAlerts() {
    this.filterType = 'plant_health';
    this.applyFilters();
  }

  // Helper methods
  getTypeLabel(type: AlertType): string {
    const labels: { [key in AlertType]: string } = {
      'low_battery': 'Low Battery',
      'low_fertilizer': 'Low Fertilizer',
      'low_water': 'Low Water',
      'plant_health': 'Plant Health',
      'system_error': 'System Error',
      'task_failed': 'Task Failed',
      'maintenance_due': 'Maintenance Due'
    };
    return labels[type] || type;
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getWarningCount(): number {
    return this.alerts.filter(alert => alert.severity === 'warning' && !alert.resolved).length;
  }

  getInfoCount(): number {
    return this.alerts.filter(alert => alert.severity === 'info' && !alert.resolved).length;
  }

  getUnresolvedPercentage(): number {
    if (this.alertStats.totalAlerts === 0) return 0;
    return (this.alertStats.unresolvedAlerts / this.alertStats.totalAlerts) * 100;
  }
}
