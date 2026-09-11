import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NewTask, SavedPath } from '../../models/bot.models';

// Define a generic API response structure for type safety
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any; // Allow other properties like 'bot', 'tasks', etc.
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Bot Status
  getBotStatus(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/bot/status`);
  }

  // Plants
  getPlants(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/plants`);
  }

  // Tasks
  getTasks(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/tasks`);
  }

  createTask(task: NewTask): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/tasks`, task);
  }

  updateTask(id: string, task: Partial<NewTask>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/tasks/${id}`, task);
  }

  deleteTask(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/tasks/${id}`);
  }

  toggleTask(id: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/tasks/${id}/toggle`, {});
  }

  // Alerts
  getAlerts(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/alerts`);
  }

  getAlertStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/alerts/stats`);
  }

  acknowledgeAlert(id: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/alerts/${id}/acknowledge`, {});
  }

  resolveAlert(id: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/alerts/${id}/resolve`, {});
  }

  deleteAlert(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/alerts/${id}`);
  }

  // Path Planning
  getSavedPaths(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/waypoints`);
  }

  savePath(path: Omit<SavedPath, '_id' | 'created_at'>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/waypoints`, path);
  }

  deleteSavedPath(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/waypoints/${id}`);
  }

  createWaypointPath(pathData: { waypoints: any[], path_name: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/waypoints/execute`, pathData);
  }
}
