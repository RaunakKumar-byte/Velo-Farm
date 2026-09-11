import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface BotStatus {
  _id?: string;
  x: number;
  y: number;
  battery: number;
  fertilizer_level: number;
  status: 'idle' | 'moving' | 'watering' | 'fertilizing' | 'scanning' | 'charging' | 'error';
  isMoving: boolean;
  lastUpdate: string;
}

export interface Plant {
  id: number;
  x: number;
  y: number;
  health: number;
  growth_stage: string;
  last_fertilized: string | null;
  fertilizer_count: number;
  created_at: string;
}

export interface LogEntry {
  id: number;
  action: string;
  x: number | null;
  y: number | null;
  details: string;
  timestamp: string;
}

export interface Analytic {
  totalActions: number;
  movements: number;
  fertilizations: number;
  avgPlantHealth: number;
  healthyPlants: number;
  plantsNeedingCare: number;
  totalPlants: number;
  efficiency: number;
}

@Injectable({
  providedIn: 'root'
})
export class BotService {
 private baseUrl = 'https://khetloom-bot-backend.vercel.app/api';

  // Real-time data subjects
  private botStatusSubject = new BehaviorSubject<BotStatus>({
    x: 0, 
    y: 0, 
    battery: 100, 
    fertilizer_level: 100, 
    status: 'idle', 
    isMoving: false,
    lastUpdate: new Date().toISOString()
  });
  private plantsSubject = new BehaviorSubject<Plant[]>([]);
  private logsSubject = new BehaviorSubject<LogEntry[]>([]);

  public botStatus$ = this.botStatusSubject.asObservable();
  public plants$ = this.plantsSubject.asObservable();
  public logs$ = this.logsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startRealTimeUpdates();
  }

  private startRealTimeUpdates() {
    // Update data every 3 seconds
    // setInterval(() => {
    //   this.refreshBotStatus();
    //   this.refreshPlants();
    //   this.refreshLogs();
    // }, 3000);

    // Initial load
    this.refreshBotStatus();
    this.refreshPlants();
    this.refreshLogs();
  }

  // Real-time data refresh methods
  private async refreshBotStatus() {
    try {
      const status = await this.getBotStatus().toPromise();
      this.botStatusSubject.next(status!);
    } catch (error) {
      console.error('Failed to refresh bot status:', error);
    }
  }

  private async refreshPlants() {
    try {
      const plants = await this.getPlants().toPromise();
      this.plantsSubject.next(plants || []);
    } catch (error) {
      console.error('Failed to refresh plants:', error);
      this.plantsSubject.next([]);
    }
  }

  private async refreshLogs() {
    try {
      const logs = await this.getLogs().toPromise();
      this.logsSubject.next(logs || []);
    } catch (error) {
      console.error('Failed to refresh logs:', error);
      this.logsSubject.next([]);
    }
  }

  // API Methods
  moveBot(x: number, y: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/bot/move`, { x, y });
  }

  dropFertilizer(): Observable<any> {
    return this.http.post(`${this.baseUrl}/bot/drop`, {});
  }

  getBotStatus(): Observable<BotStatus> {
    return this.http.get<any>(`${this.baseUrl}/bot/status`).pipe(
      map((data: any) => ({
        _id: data._id,
        x: data.x || 0,
        y: data.y || 0,
        battery: data.battery || 100,
        fertilizer_level: data.fertilizer_level || 100,
        status: data.status || 'idle',
        isMoving: data.isMoving || false,
        lastUpdate: data.lastUpdate || new Date().toISOString()
      }))
    );
  }

  getPlants(): Observable<Plant[]> {
    return this.http.get<Plant[]>(`${this.baseUrl}/plants`);
  }

  getLogs(limit: number = 50): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(`${this.baseUrl}/logs?limit=${limit}`);
  }

  getAnalytics(): Observable<Analytic> {
    return this.http.get<Analytic>(`${this.baseUrl}/analytics`);
  }

  getCommands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/bot/commands`);
  }

  emergencyStop(): Observable<any> {
    return this.http.post(`${this.baseUrl}/bot/emergency-stop`, {});
  }

  refillResources(battery: boolean = false, fertilizer: boolean = false): Observable<any> {
    return this.http.post(`${this.baseUrl}/bot/refill`, { battery, fertilizer });
  }

  // Utility methods
  getPlantHealthColor(health: number): string {
    if (health >= 80) return 'success';
    if (health >= 60) return 'warning';
    if (health >= 40) return 'orange';
    return 'danger';
  }

  getGrowthStageIcon(stage: string): string {
    switch (stage) {
      case 'seedling': return 'bi-seed';
      case 'growing': return 'bi-tree';
      case 'mature': return 'bi-tree-fill';
      case 'flowering': return 'bi-flower1';
      default: return 'bi-circle';
    }
  }

  getBatteryIcon(battery: number): string {
    if (battery > 80) return 'bi-battery-full';
    if (battery > 60) return 'bi-battery-half';
    if (battery > 20) return 'bi-battery';
    return 'bi-battery-empty';
  }

  getCurrentBotStatus(): BotStatus {
    return this.botStatusSubject.value;
  }

  getCurrentPlants(): Plant[] {
    return this.plantsSubject.value;
  }

  getCurrentLogs(): LogEntry[] {
    return this.logsSubject.value;
  }

  // Add missing getFertilizerLogs method
  getFertilizerLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/fertilizer-logs`);
  }
}
