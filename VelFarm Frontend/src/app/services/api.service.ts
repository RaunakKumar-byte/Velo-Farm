import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface User {
  _id?: string;
  fullName: string;
  email: string;
  password?: string; // Make password optional for profile updates
  phone: string;
  communication?: string;
  language?: string;
  farmName?: string;
  farmLocation?: string;
  farmSize?: number;
  primaryCrops?: string[];
  secondaryCrops?: string[];
  sprayerType?: string;
  iotDevices?: string[];
  machinery?: string[];
  pesticides?: Array<{
    name: string;
    frequency: string;
  }>;
  fertilizerPreference?: string;
  monthlyExpenditure?: number;
  createdAt?: Date;
  updatedAt?: Date;
  farmingExperience: string;

  // Additional Profile Fields
  profileImage?: string;

  // Farm Details
  soilType?: string;
  irrigationType?: string;
  lastHarvest?: Date | string;
  nextPlanting?: Date | string;

  // Equipment Details
  maintenanceSchedule?: string;
  lastService?: Date | string;
  nextService?: Date | string;

  // Pesticide Details
  lastApplication?: Date | string;
  nextApplication?: Date | string;
  applicationMethod?: string;

  // Subscription Info
  subscription?: {
    plan: string;
    status: string;
    price: number;
    billingCycle: string;
    renewsOn?: Date | string;
    features: string[];
  };

  // Payment Details
  paymentDetails?: {
    cardType?: string;
    lastFour?: string;
    expires?: string;
    billingAddress?: string;
    paymentMethod?: string;
  };

  // Preferences
  preferences?: {
    language: string;
    theme: string;
    notifications: {
      email: boolean;
      sms: boolean;
      inApp: boolean;
      weather: boolean;
      crop: boolean;
      system: boolean;
    };
    measurementUnits: string;
    timezone: string;
    dateFormat: string;
  };

  // Security Settings
  security?: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
    passwordLastChanged?: Date | string;
    lastLogin?: Date | string;
    failedAttempts: number;
    securityQuestions: Array<{
      question: string;
      answer: string;
    }>;
  };

  // System Settings
  systemSettings?: {
    dataRetention: number;
    backupFrequency: string;
    lastBackup?: Date | string;
    systemVersion: string;
    storageUsed: string;
    apiCallsToday: number;
  };

  // Integrations
  integrations?: Array<{
    id: string;
    name: string;
    status: string;
    lastSync?: Date | string;
    config?: any;
  }>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  communication?: string;
  language?: string;
  farmName?: string;
  farmLocation?: string;
  farmSize?: number;
  primaryCrops?: string[];
  secondaryCrops?: string[];
  sprayerType?: string;
  iotDevices?: string[];
  machinery?: string[];
  pesticides?: Array<{
    name: string;
    frequency: string;
  }>;
  fertilizerPreference?: string;
  monthlyExpenditure?: number;
  farmingExperience: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  errors?: string[];
}

export interface UsersResponse {
  success: boolean;
  message: string;
  count?: number;
  users?: User[];
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'https://khetloom-backend.vercel.app/api';

  constructor(private readonly http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else if (error.error?.message) {
      // Server-side error with message
      errorMessage = error.error.message;
      // Add detailed validation errors if available
      if (Array.isArray(error.error?.errors)) {
        errorMessage += ': ' + error.error.errors.join(', ');
      }
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
    } else if (error.status === 400) {
      errorMessage = 'Bad Request: Please check your input data.';
      if (error.error?.errors) {
        errorMessage += ' Errors: ' + JSON.stringify(error.error.errors);
      }
    } else if (error.status === 401) {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else {
      errorMessage = `Error Code: ${error.status} - ${error.statusText}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  // Authentication methods
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          // Response handling can be added here if needed
        }),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(catchError(this.handleError));
  }

  getProfile(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/profile`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateProfile(userData: User): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/profile`, userData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Profile section-specific updates
  updateSubscription(subscriptionData: any): Observable<AuthResponse> {
    const token = this.getToken();
    if (token === 'demo-token-12345') {
      return new Observable(observer => {
        observer.next({
          success: true,
          message: 'Subscription updated successfully (Demo Mode)',
          user: undefined
        });
        observer.complete();
      });
    }
    
    return this.http.put<AuthResponse>(`${this.apiUrl}/profile/subscription`, subscriptionData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updatePreferences(preferencesData: any): Observable<AuthResponse> {
    const token = this.getToken();
    if (token === 'demo-token-12345') {
      return new Observable(observer => {
        observer.next({
          success: true,
          message: 'Preferences updated successfully (Demo Mode)',
          user: undefined
        });
        observer.complete();
      });
    }
    
    return this.http.put<AuthResponse>(`${this.apiUrl}/profile/preferences`, preferencesData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateSecurity(securityData: any): Observable<AuthResponse> {
    const token = this.getToken();
    if (token === 'demo-token-12345') {
      return new Observable(observer => {
        observer.next({
          success: true,
          message: 'Security settings updated successfully (Demo Mode)',
          user: undefined
        });
        observer.complete();
      });
    }
    
    return this.http.put<AuthResponse>(`${this.apiUrl}/profile/security`, securityData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updatePayment(paymentData: any): Observable<AuthResponse> {
    const token = this.getToken();
    if (token === 'demo-token-12345') {
      return new Observable(observer => {
        observer.next({
          success: true,
          message: 'Payment details updated successfully (Demo Mode)',
          user: undefined
        });
        observer.complete();
      });
    }
    
    return this.http.put<AuthResponse>(`${this.apiUrl}/profile/payment`, paymentData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateIntegrations(integrationsData: any): Observable<AuthResponse> {
    const token = this.getToken();
    if (token === 'demo-token-12345') {
      return new Observable(observer => {
        observer.next({
          success: true,
          message: 'Integrations updated successfully (Demo Mode)',
          user: undefined
        });
        observer.complete();
      });
    }
    
    return this.http.put<AuthResponse>(`${this.apiUrl}/profile/integrations`, integrationsData, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateProfileImage(imageUrl: string): Observable<AuthResponse> {
    const token = this.getToken();
    if (token === 'demo-token-12345') {
      return new Observable(observer => {
        observer.next({
          success: true,
          message: 'Profile image updated successfully (Demo Mode)',
          user: undefined
        });
        observer.complete();
      });
    }
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/profile/image`, { imageUrl }, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAllUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.apiUrl}/users`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Health
  getHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`)
      .pipe(catchError(this.handleError));
  }

  // Public dashboards (no auth)
  getPublicStats(): Observable<{ totalUsers: number; avgFarmSize: number; avgMonthlyExpenditure: number }> {
    return this.http.get<{ totalUsers: number; avgFarmSize: number; avgMonthlyExpenditure: number }>(`${this.apiUrl}/public/stats`)
      .pipe(catchError(this.handleError));
  }

  getRecentUsers(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/public/recent-users`, { params: { limit: String(limit) } })
      .pipe(catchError(this.handleError));
  }

  getSummary(): Observable<{ totalUsers: number; newThisWeek: number; avgFarmSize: number }> {
    return this.http.get<{ totalUsers: number; newThisWeek: number; avgFarmSize: number }>(`${this.apiUrl}/summary`)
      .pipe(catchError(this.handleError));
  }

  // Already present in backend list
  getAppData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/app-data`)
      .pipe(catchError(this.handleError));
  }

  getPublicConfig(): Observable<{ environment: string; version: string; time: string }> {
    return this.http.get<{ environment: string; version: string; time: string }>(`${this.apiUrl}/public/config`)
      .pipe(catchError(this.handleError));
  }

  // Devices
  createDevice(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/devices`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getDevices(params?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/devices`, { headers: this.getHeaders(), params })
      .pipe(catchError(this.handleError));
  }

  getDeviceByIdApi(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/devices/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
  // Alias for consistency with the rest of code
  getDevice(id: string): Observable<any> { return this.getDeviceByIdApi(id); }

  updateDevice(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/devices/${id}`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteDevice(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/devices/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Fields
  createField(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/fields`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getFields(params?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/fields`, { headers: this.getHeaders(), params })
      .pipe(catchError(this.handleError));
  }

  updateField(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/fields/${id}`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getField(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/fields/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
  // Field-scoped fetchers
  getJobsByField(fieldId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/jobs`, { headers: this.getHeaders(), params: { fieldId } })
      .pipe(catchError(this.handleError));
  }
  getCropsByField(fieldId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/crops`, { headers: this.getHeaders(), params: { fieldId } })
      .pipe(catchError(this.handleError));
  }

  deleteField(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/fields/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Crops
  createCrop(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crops`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getCrops(params?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/crops`, { headers: this.getHeaders(), params })
      .pipe(catchError(this.handleError));
  }

  updateCrop(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/crops/${id}`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getCrop(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/crops/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteCrop(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/crops/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Jobs
  createJob(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jobs`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getJobs(params?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/jobs`, { headers: this.getHeaders(), params })
      .pipe(catchError(this.handleError));
  }

  updateJob(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/jobs/${id}`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getJob(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/jobs/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteJob(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/jobs/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Finance
  createFinanceRecord(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/finance`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getFinanceRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/finance`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getFinanceSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/finance/summary`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Health Reports
  createHealthReport(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/health-reports`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getHealthReports(params?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/health-reports`, { headers: this.getHeaders(), params })
      .pipe(catchError(this.handleError));
  }

  // Job status update
  updateJobStatus(id: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/jobs/${id}/status`, { status }, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
  getHealthReport(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health-reports/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Weather Cache
  getCachedWeather(location: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/weather`, { params: { location } })
      .pipe(catchError(this.handleError));
  }

  setCachedWeather(payload: { location: string; data: any; ttlMinutes?: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/weather`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Notifications
  createNotification(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notifications`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  markNotificationRead(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/notifications/${id}/read`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Activities
  createActivity(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/activities`, payload, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getRecentActivities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activities/recent`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // App Logs
  createClientLog(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logs`, payload)
      .pipe(catchError(this.handleError));
  }

  getRecentLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/logs/recent`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  logout(): void {
    this.removeToken();
  }
}