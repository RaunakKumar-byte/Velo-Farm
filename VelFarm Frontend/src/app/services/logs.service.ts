import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, filter } from 'rxjs/operators';

export interface SystemLog {
  id: string;
  type: 'device_activity' | 'system_alert' | 'error' | 'info' | 'warning' | 'scan' | 'spray_event' | 'system_update' | 'critical_alert';
  title: string;
  message: string;
  timestamp: Date;
  deviceId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  scanId?: string;
  infectionRate?: number;
  sprayDuration?: number;
  costSaved?: number;
  zone?: string;
  pesticideAmount?: number;
  note?: string;
}

export interface LogFilter {
  type?: string;
  severity?: string;
  deviceId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
  eventTypes?: string[];
}

export interface DataSet {
  id: string;
  name: string;
  type: 'infection_rate' | 'pesticide_usage' | 'spray_events' | 'cost_savings';
  data: any[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface ComparisonResult {
  dataset1: DataSet;
  dataset2: DataSet;
  correlation: number;
  insights: string[];
  chartData: any;
}

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private logsSubject = new BehaviorSubject<SystemLog[]>([]);
  public logs$ = this.logsSubject.asObservable();

  private logInterval?: any;

  constructor() {
    this.initializeLogs();
    // Simulate new log entries every 2-5 minutes with proper cleanup
    this.scheduleNextLog();
  }

  private scheduleNextLog(): void {
    const delay = 120000 + Math.random() * 180000; // 2-5 minutes
    this.logInterval = setTimeout(() => {
      this.generateRandomLog();
      this.scheduleNextLog(); // Schedule next log
    }, delay);
  }

  private initializeLogs(): void {
    const sampleLogs: SystemLog[] = [
      {
        id: 'log-1',
        type: 'device_activity',
        title: 'Device Activity',
        message: 'Sprayer 1 activated automatically based on AI threshold (78%).',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        deviceId: 'sprayer-1',
        severity: 'low',
        isRead: false
      },
      {
        id: 'log-2',
        type: 'system_alert',
        title: 'System Alert',
        message: 'Drone 1 battery is low (15%). Please recharge soon.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        deviceId: 'drone-1',
        severity: 'high',
        isRead: false
      },
      {
        id: 'log-3',
        type: 'error',
        title: 'Error',
        message: 'Failed to connect to Sprayer 2. Check device connection.',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        deviceId: 'sprayer-2',
        severity: 'critical',
        isRead: false
      },
      {
        id: 'log-4',
        type: 'device_activity',
        title: 'Device Activity',
        message: 'Drone 1 completed scheduled spray cycle successfully.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        deviceId: 'drone-1',
        severity: 'low',
        isRead: true
      },
      {
        id: 'log-5',
        type: 'info',
        title: 'System Info',
        message: 'AI model accuracy improved to 94.2% after latest update.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        severity: 'low',
        isRead: true
      }
    ];
    this.logsSubject.next(sampleLogs);
  }

  getAllLogs(): Observable<SystemLog[]> {
    return this.logs$;
  }

  getFilteredLogs(filter: LogFilter): Observable<SystemLog[]> {
    return this.logs$.pipe(
      map(logs => {
        let filteredLogs = [...logs];

        if (filter.type) {
          filteredLogs = filteredLogs.filter(log => log.type === filter.type);
        }

        if (filter.severity) {
          filteredLogs = filteredLogs.filter(log => log.severity === filter.severity);
        }

        if (filter.deviceId) {
          filteredLogs = filteredLogs.filter(log => log.deviceId === filter.deviceId);
        }

        if (filter.dateRange) {
          filteredLogs = filteredLogs.filter(log => 
            log.timestamp >= filter.dateRange!.start && 
            log.timestamp <= filter.dateRange!.end
          );
        }

        if (filter.searchTerm) {
          const searchTerm = filter.searchTerm.toLowerCase();
          filteredLogs = filteredLogs.filter(log => 
            log.title.toLowerCase().includes(searchTerm) ||
            log.message.toLowerCase().includes(searchTerm)
          );
        }

        return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      })
    );
  }

  getLogTypes(): string[] {
    return ['device_activity', 'system_alert', 'error', 'info', 'warning', 'scan', 'spray_event', 'system_update', 'critical_alert'];
  }

  getEventTypes(): string[] {
    return ['spray_events', 'critical_alerts', 'system_updates', 'scans'];
  }

  getLogSeverities(): string[] {
    return ['low', 'medium', 'high', 'critical'];
  }

  markLogAsRead(logId: string): void {
    const currentLogs = this.logsSubject.value;
    const logIndex = currentLogs.findIndex(log => log.id === logId);
    
    if (logIndex !== -1) {
      currentLogs[logIndex] = { ...currentLogs[logIndex], isRead: true };
      this.logsSubject.next([...currentLogs]);
    }
  }

  markAllLogsAsRead(): void {
    const currentLogs = this.logsSubject.value;
    const updatedLogs = currentLogs.map(log => ({ ...log, isRead: true }));
    this.logsSubject.next(updatedLogs);
  }

  getUnreadLogCount(): Observable<number> {
    return this.logs$.pipe(
      map(logs => logs.filter(log => !log.isRead).length)
    );
  }

  addLog(log: Omit<SystemLog, 'id' | 'timestamp'>): void {
    const newLog: SystemLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    const currentLogs = this.logsSubject.value;
    this.logsSubject.next([newLog, ...currentLogs]);
  }

  clearLogs(): void {
    this.logsSubject.next([]);
  }

  // Cleanup method to stop log generation
  destroy(): void {
    if (this.logInterval) {
      clearTimeout(this.logInterval);
      this.logInterval = undefined;
    }
  }

  private generateRandomLog(): void {
    const logTypes: SystemLog['type'][] = ['device_activity', 'system_alert', 'error', 'info', 'warning'];
    const devices = ['sprayer-1', 'sprayer-2', 'drone-1'];
    const severities: SystemLog['severity'][] = ['low', 'medium', 'high', 'critical'];
    
    const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];
    const randomDevice = devices[Math.floor(Math.random() * devices.length)];
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
    
    const logMessages = {
      device_activity: [
        'Device activated automatically based on AI threshold.',
        'Scheduled spray cycle completed successfully.',
        'Device calibration completed.',
        'New device connected to the network.'
      ],
      system_alert: [
        'Battery level is low. Please recharge soon.',
        'Maintenance required for optimal performance.',
        'Weather conditions may affect spray effectiveness.',
        'Device temperature is above normal range.'
      ],
      error: [
        'Connection lost. Attempting to reconnect...',
        'Calibration failed. Manual intervention required.',
        'Spray system malfunction detected.',
        'GPS signal lost. Device may be offline.'
      ],
      info: [
        'System update completed successfully.',
        'New firmware available for download.',
        'Performance metrics updated.',
        'Backup completed successfully.'
      ],
      warning: [
        'Device performance degraded.',
        'Scheduled maintenance due soon.',
        'Weather alert: High winds detected.',
        'Resource usage approaching limits.'
      ],
      scan: [
        'Field scan completed successfully.',
        'Infection rate detected in scanned area.',
        'Scan data processed and analyzed.',
        'New scan results available for review.'
      ],
      spray_event: [
        'Spraying operation initiated.',
        'Spray cycle completed in target zone.',
        'Pesticide application finished.',
        'Spray pattern adjusted for optimal coverage.'
      ],
      system_update: [
        'System update installed successfully.',
        'New features available after update.',
        'Performance improvements applied.',
        'Security patches updated.'
      ],
      critical_alert: [
        'Critical system failure detected.',
        'Immediate attention required.',
        'Emergency shutdown initiated.',
        'Critical threshold exceeded.'
      ]
    };
    
    const randomMessage = logMessages[randomType][Math.floor(Math.random() * logMessages[randomType].length)];
    
    this.addLog({
      type: randomType,
      title: this.getLogTitle(randomType),
      message: randomMessage,
      deviceId: randomType === 'device_activity' ? randomDevice : undefined,
      severity: randomSeverity,
      isRead: false
    });
  }

  private getLogTitle(type: SystemLog['type']): string {
    const titles = {
      device_activity: 'Device Activity',
      system_alert: 'System Alert',
      error: 'Error',
      info: 'System Info',
      warning: 'Warning',
      scan: 'Scan Event',
      spray_event: 'Spray Event',
      system_update: 'System Update',
      critical_alert: 'Critical Alert'
    };
    return titles[type];
  }

  getLogIcon(type: SystemLog['type']): string {
    const icons = {
      device_activity: 'bi-activity',
      system_alert: 'bi-exclamation-triangle-fill',
      error: 'bi-x-circle-fill',
      info: 'bi-info-circle-fill',
      warning: 'bi-exclamation-triangle',
      scan: 'bi-search',
      spray_event: 'bi-droplet',
      system_update: 'bi-gear',
      critical_alert: 'bi-exclamation-triangle-fill'
    };
    return icons[type];
  }

  getLogColor(type: SystemLog['type']): string {
    const colors = {
      device_activity: 'text-primary',
      system_alert: 'text-warning',
      error: 'text-danger',
      info: 'text-info',
      warning: 'text-warning',
      scan: 'text-success',
      spray_event: 'text-primary',
      system_update: 'text-info',
      critical_alert: 'text-danger'
    };
    return colors[type];
  }

  // Data Sets and Comparison Methods
  getDataSets(): DataSet[] {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    return [
      {
        id: 'infection-rate-oct-2023',
        name: 'Infection Rate (Oct 2023)',
        type: 'infection_rate',
        data: this.generateInfectionRateData(),
        dateRange: { start: lastMonth, end: now }
      },
      {
        id: 'pesticide-usage-oct-2023',
        name: 'Pesticide Usage (Oct 2023)',
        type: 'pesticide_usage',
        data: this.generatePesticideUsageData(),
        dateRange: { start: lastMonth, end: now }
      },
      {
        id: 'spray-events-oct-2023',
        name: 'Spray Events (Oct 2023)',
        type: 'spray_events',
        data: this.generateSprayEventsData(),
        dateRange: { start: lastMonth, end: now }
      },
      {
        id: 'cost-savings-oct-2023',
        name: 'Cost Savings (Oct 2023)',
        type: 'cost_savings',
        data: this.generateCostSavingsData(),
        dateRange: { start: lastMonth, end: now }
      }
    ];
  }

  compareDataSets(dataset1Id: string, dataset2Id: string): ComparisonResult {
    const datasets = this.getDataSets();
    const dataset1 = datasets.find(ds => ds.id === dataset1Id)!;
    const dataset2 = datasets.find(ds => ds.id === dataset2Id)!;
    
    // Calculate correlation (simplified)
    const correlation = this.calculateCorrelation(dataset1.data, dataset2.data);
    
    // Generate insights
    const insights = this.generateInsights(dataset1, dataset2, correlation);
    
    // Generate chart data
    const chartData = this.generateChartData(dataset1, dataset2);
    
    return {
      dataset1,
      dataset2,
      correlation,
      insights,
      chartData
    };
  }

  exportLogs(format: 'csv' | 'json' | 'pdf'): string {
    const logs = this.logsSubject.value;
    
    switch (format) {
      case 'csv':
        return this.exportToCSV(logs);
      case 'json':
        return JSON.stringify(logs, null, 2);
      case 'pdf':
        return this.exportToPDF(logs);
      default:
        return '';
    }
  }

  private generateInfectionRateData(): any[] {
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        date: new Date(2023, 9, i + 1),
        value: Math.random() * 30 + 5, // 5-35% infection rate
        zone: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      });
    }
    return data;
  }

  private generatePesticideUsageData(): any[] {
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        date: new Date(2023, 9, i + 1),
        value: Math.random() * 100 + 20, // 20-120L pesticide
        zone: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      });
    }
    return data;
  }

  private generateSprayEventsData(): any[] {
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        date: new Date(2023, 9, i + 1),
        value: Math.floor(Math.random() * 5) + 1, // 1-5 spray events
        zone: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      });
    }
    return data;
  }

  private generateCostSavingsData(): any[] {
    const data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        date: new Date(2023, 9, i + 1),
        value: Math.random() * 1000 + 200, // $200-$1200 savings
        zone: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      });
    }
    return data;
  }

  private calculateCorrelation(data1: any[], data2: any[]): number {
    // Simplified correlation calculation
    return Math.random() * 0.8 + 0.1; // 0.1 to 0.9 correlation
  }

  private generateInsights(dataset1: DataSet, dataset2: DataSet, correlation: number): string[] {
    const insights = [];
    
    if (correlation > 0.7) {
      insights.push(`Strong positive correlation (${(correlation * 100).toFixed(1)}%) between ${dataset1.name} and ${dataset2.name}`);
    } else if (correlation > 0.3) {
      insights.push(`Moderate correlation (${(correlation * 100).toFixed(1)}%) between ${dataset1.name} and ${dataset2.name}`);
    } else {
      insights.push(`Weak correlation (${(correlation * 100).toFixed(1)}%) between ${dataset1.name} and ${dataset2.name}`);
    }
    
    insights.push(`Peak activity observed in Zone A during mid-October`);
    insights.push(`Cost savings increased by 15% compared to previous month`);
    
    return insights;
  }

  private generateChartData(dataset1: DataSet, dataset2: DataSet): any {
    return {
      labels: dataset1.data.map(d => d.date.toLocaleDateString()),
      datasets: [
        {
          label: dataset1.name,
          data: dataset1.data.map(d => d.value),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        },
        {
          label: dataset2.name,
          data: dataset2.data.map(d => d.value),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        }
      ]
    };
  }

  private exportToCSV(logs: SystemLog[]): string {
    const headers = ['ID', 'Type', 'Title', 'Message', 'Timestamp', 'Severity', 'Device ID'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.id,
        log.type,
        `"${log.title}"`,
        `"${log.message}"`,
        log.timestamp.toISOString(),
        log.severity,
        log.deviceId || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }

  private exportToPDF(logs: SystemLog[]): string {
    // Simplified PDF export - in real implementation, use a PDF library
    return `PDF Export for ${logs.length} logs - Implementation needed`;
  }
}
