import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap } from 'rxjs';

export interface BotStatus {
  id: number;
  x: number;
  y: number;
  battery: number;
  fertilizer_level: number;
  is_moving: boolean;
  status: string;
  last_updated: string;
}

export interface Plant {
  id: number;
  x: number;
  y: number;
  health: number;
  growth_stage: string;
  last_fertilized: string | null;
  fertilizer_count: number;
  needs_attention: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  x: number | null;
  y: number | null;
  details: string;
  timestamp: string;
}

export interface Analytics {
  dailyFertilizations: number;
  plantsFertilizedToday: number;
  averageHealth: number;
  totalActivities: number;
  efficiencyScore: number;
}

export interface Command {
  id: number;
  type: string;
  x: number | null;
  y: number | null;
  executed: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class FarmingApiService {
  private baseUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) { }

  // Bot Control
  moveBot(x: number, y: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/move`, { x, y });
  }

  dropFertilizer(): Observable<any> {
    return this.http.post(`${this.baseUrl}/drop`, {});
  }

  emergencyStop(): Observable<any> {
    return this.http.post(`${this.baseUrl}/emergency-stop`, {});
  }

  refillFertilizer(): Observable<any> {
    return this.http.post(`${this.baseUrl}/refill`, {});
  }

  chargeBattery(): Observable<any> {
    return this.http.post(`${this.baseUrl}/charge`, {});
  }

  // Data Fetching
  getBotStatus(): Observable<BotStatus> {
    return this.http.get<BotStatus>(`${this.baseUrl}/status`);
  }

  getPlants(): Observable<Plant[]> {
    return this.http.get<Plant[]>(`${this.baseUrl}/plants`);
  }

  getLogs(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.baseUrl}/logs`);
  }

  getAnalytics(): Observable<Analytics> {
    return this.http.get<Analytics>(`${this.baseUrl}/analytics`);
  }

  getPendingCommands(): Observable<Command[]> {
    return this.http.get<Command[]>(`${this.baseUrl}/commands`);
  }

  // Real-time Data Streams
  getBotStatusStream(): Observable<BotStatus> {
    return interval(2000).pipe(
      switchMap(() => this.getBotStatus())
    );
  }

  getPlantsStream(): Observable<Plant[]> {
    return interval(5000).pipe(
      switchMap(() => this.getPlants())
    );
  }

  getLogsStream(): Observable<ActivityLog[]> {
    return interval(3000).pipe(
      switchMap(() => this.getLogs())
    );
  }

  getAnalyticsStream(): Observable<Analytics> {
    return interval(10000).pipe(
      switchMap(() => this.getAnalytics())
    );
  }
}