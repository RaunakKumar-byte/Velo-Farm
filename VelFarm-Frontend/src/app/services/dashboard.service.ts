import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface KeyMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  trend: number;
  trendDirection: 'up' | 'down';
  icon: string;
  color: string;
  description: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'maintenance' | 'error';
  lastMaintenance: Date;
  nextMaintenance: Date;
  maintenanceOverdue?: number; // days overdue
  location: string;
  efficiency: number;
}

export interface FieldStatus {
  id: string;
  name: string;
  crop: string;
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
  imageUrl: string;
  area: number; // in acres
  plantCount: number;
  healthScore: number; // 0-100
}

export interface Alert {
  id: string;
  type: 'pest' | 'disease' | 'equipment' | 'weather' | 'irrigation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  field: string;
  timestamp: Date;
  icon: string;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private keyMetricsSubject = new BehaviorSubject<KeyMetric[]>(this.getDefaultKeyMetrics());
  public keyMetrics$ = this.keyMetricsSubject.asObservable();

  private equipmentSubject = new BehaviorSubject<Equipment[]>(this.getDefaultEquipment());
  public equipment$ = this.equipmentSubject.asObservable();

  private fieldStatusSubject = new BehaviorSubject<FieldStatus[]>(this.getDefaultFieldStatus());
  public fieldStatus$ = this.fieldStatusSubject.asObservable();

  private alertsSubject = new BehaviorSubject<Alert[]>(this.getDefaultAlerts());
  public alerts$ = this.alertsSubject.asObservable();

  constructor() {
    // Simulate real-time updates
    this.startRealTimeUpdates();
  }

  private getDefaultKeyMetrics(): KeyMetric[] {
    return [
      {
        id: 'total-plants',
        title: 'Total Plants Monitored',
        value: 12500,
        unit: '',
        trend: 10,
        trendDirection: 'up',
        icon: 'bi-plant',
        color: 'success',
        description: 'Plants being monitored across all fields'
      },
      {
        id: 'infection-rate',
        title: 'Infection Rate',
        value: 2.5,
        unit: '%',
        trend: -0.5,
        trendDirection: 'down',
        icon: 'bi-virus',
        color: 'danger',
        description: 'Percentage of infected plants'
      },
      {
        id: 'pesticide-saved',
        title: 'Pesticide Saved',
        value: 150,
        unit: 'Liters',
        trend: 20,
        trendDirection: 'up',
        icon: 'bi-droplet',
        color: 'primary',
        description: 'Pesticide saved through precision application'
      },
      {
        id: 'cost-savings',
        title: 'Estimated Cost Savings',
        value: 3200,
        unit: '$',
        trend: 15,
        trendDirection: 'up',
        icon: 'bi-piggy-bank',
        color: 'warning',
        description: 'Total estimated cost savings this month'
      }
    ];
  }

  private getDefaultEquipment(): Equipment[] {
    return [
      {
        id: 'tractor-1',
        name: 'Tractor JD 5075E',
        type: 'Tractor',
        status: 'active',
        lastMaintenance: new Date('2023-10-15'),
        nextMaintenance: new Date('2024-04-15'),
        location: 'Field A',
        efficiency: 95
      },
      {
        id: 'harvester-1',
        name: 'Combine Harvester S780',
        type: 'Harvester',
        status: 'idle',
        lastMaintenance: new Date('2023-11-01'),
        nextMaintenance: new Date('2024-05-01'),
        location: 'Storage',
        efficiency: 88
      },
      {
        id: 'sprayer-1',
        name: 'Sprayer R4045',
        type: 'Sprayer',
        status: 'maintenance',
        lastMaintenance: new Date('2023-09-20'),
        nextMaintenance: new Date('2023-12-15'),
        maintenanceOverdue: 25,
        location: 'Field B',
        efficiency: 75
      }
    ];
  }

  private getDefaultFieldStatus(): FieldStatus[] {
    return [
      {
        id: 'field-a',
        name: 'Field A',
        crop: 'Corn',
        status: 'healthy',
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
        area: 25.5,
        plantCount: 8500,
        healthScore: 92
      },
      {
        id: 'field-b',
        name: 'Field B',
        crop: 'Soybean',
        status: 'warning',
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
        area: 18.2,
        plantCount: 6200,
        healthScore: 78
      },
      {
        id: 'field-c',
        name: 'Field C',
        crop: 'Wheat',
        status: 'critical',
        lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        area: 32.1,
        plantCount: 11200,
        healthScore: 45
      }
    ];
  }

  private getDefaultAlerts(): Alert[] {
    return [
      {
        id: 'alert-1',
        type: 'pest',
        severity: 'medium',
        title: 'Potential Pest Infestation',
        description: 'Aphids detected in multiple areas',
        field: 'Field B - Soybean',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: 'bi-bug',
        isRead: false
      },
      {
        id: 'alert-2',
        type: 'irrigation',
        severity: 'low',
        title: 'Irrigation System Malfunction',
        description: 'Water pressure below optimal levels',
        field: 'Field C - Wheat',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        icon: 'bi-house-gear',
        isRead: false
      },
      {
        id: 'alert-3',
        type: 'equipment',
        severity: 'high',
        title: 'Equipment Maintenance Due',
        description: 'Sprayer R4045 maintenance overdue by 25 days',
        field: 'Field B',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        icon: 'bi-tools',
        isRead: true
      }
    ];
  }

  private startRealTimeUpdates(): void {
    // Update metrics every 5 minutes
    setInterval(() => {
      this.updateKeyMetrics();
    }, 5 * 60 * 1000);

    // Update field status every 2 minutes
    setInterval(() => {
      this.updateFieldStatus();
    }, 2 * 60 * 1000);
  }

  private updateKeyMetrics(): void {
    const currentMetrics = this.keyMetricsSubject.value;
    const updatedMetrics = currentMetrics.map(metric => {
      // Add small random variations to simulate real-time data
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      return {
        ...metric,
        value: Math.max(0, metric.value * (1 + variation))
      };
    });
    this.keyMetricsSubject.next(updatedMetrics);
  }

  private updateFieldStatus(): void {
    const currentFields = this.fieldStatusSubject.value;
    const updatedFields = currentFields.map(field => ({
      ...field,
      lastUpdated: new Date(),
      healthScore: Math.max(0, Math.min(100, field.healthScore + (Math.random() - 0.5) * 2))
    }));
    this.fieldStatusSubject.next(updatedFields);
  }

  // Public methods
  getKeyMetrics(): Observable<KeyMetric[]> {
    return this.keyMetrics$.pipe(delay(300));
  }

  getEquipment(): Observable<Equipment[]> {
    return this.equipment$.pipe(delay(200));
  }

  getFieldStatus(): Observable<FieldStatus[]> {
    return this.fieldStatus$.pipe(delay(250));
  }

  getAlerts(): Observable<Alert[]> {
    return this.alerts$.pipe(delay(200));
  }

  getUnreadAlerts(): Observable<Alert[]> {
    return this.alerts$.pipe(
      map(alerts => alerts.filter(alert => !alert.isRead)),
      delay(200)
    );
  }

  markAlertAsRead(alertId: string): Observable<boolean> {
    const currentAlerts = this.alertsSubject.value;
    const updatedAlerts = currentAlerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    );
    this.alertsSubject.next(updatedAlerts);
    return of(true).pipe(delay(100));
  }

  getEquipmentStatusCount(): Observable<{ active: number; idle: number; maintenance: number; error: number }> {
    return this.equipment$.pipe(
      map(equipment => ({
        active: equipment.filter(e => e.status === 'active').length,
        idle: equipment.filter(e => e.status === 'idle').length,
        maintenance: equipment.filter(e => e.status === 'maintenance').length,
        error: equipment.filter(e => e.status === 'error').length
      }))
    );
  }

  getFieldHealthSummary(): Observable<{ healthy: number; warning: number; critical: number }> {
    return this.fieldStatus$.pipe(
      map(fields => ({
        healthy: fields.filter(f => f.status === 'healthy').length,
        warning: fields.filter(f => f.status === 'warning').length,
        critical: fields.filter(f => f.status === 'critical').length
      }))
    );
  }

  // Utility methods
  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'active': 'success',
      'idle': 'secondary',
      'maintenance': 'warning',
      'error': 'danger',
      'healthy': 'success',
      'warning': 'warning',
      'critical': 'danger'
    };
    return colorMap[status] || 'secondary';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'active': 'bi-check-circle-fill',
      'idle': 'bi-pause-circle-fill',
      'maintenance': 'bi-tools',
      'error': 'bi-x-circle-fill',
      'healthy': 'bi-check-circle-fill',
      'warning': 'bi-exclamation-triangle-fill',
      'critical': 'bi-x-circle-fill'
    };
    return iconMap[status] || 'bi-question-circle-fill';
  }

  getTrendIcon(direction: 'up' | 'down'): string {
    return direction === 'up' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  getTrendColor(direction: 'up' | 'down', metricId: string): string {
    if (metricId === 'infection-rate') {
      return direction === 'down' ? 'text-success' : 'text-danger';
    }
    return direction === 'up' ? 'text-success' : 'text-danger';
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }
}
