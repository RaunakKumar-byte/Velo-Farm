import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService, User, LoginRequest, RegisterRequest, AuthResponse } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    // Check if user is already logged in
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    if (this.apiService.isAuthenticated()) {
      this.getProfile().subscribe({
        next: (response) => {
          if (response.success && response.user) {
            this.currentUserSubject.next(response.user);
          } else {
            this.logout();
          }
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      console.log('🔐 AuthService: Starting login process');
      this.apiService.login(credentials).subscribe({
        next: (response: AuthResponse) => {
          console.log('📨 AuthService: Received response:', response);
          console.log('✅ Response success:', response.success);
          console.log('🔑 Response token:', response.token ? 'Present' : 'Missing');
          console.log('👤 Response user:', response.user ? 'Present' : 'Missing');
          
          if (response.success && response.token && response.user) {
            console.log('✅ Login successful, setting token and user');
            this.apiService.setToken(response.token);
            this.currentUserSubject.next(response.user);
            observer.next(response);
            observer.complete();
          } else {
            console.log('❌ Login failed - missing required fields');
            observer.error(new Error(response.message || 'Login failed - invalid response'));
          }
        },
        error: (error) => {
          console.log('❌ AuthService: Login error:', error);
          observer.error(error);
        }
      });
    });
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      this.apiService.register(userData).subscribe({
        next: (response: AuthResponse) => {
          if (response.success && response.token && response.user) {
            this.apiService.setToken(response.token);
            this.currentUserSubject.next(response.user);
            observer.next(response);
            observer.complete();
          } else {
            observer.error(new Error(response.message || 'Registration failed'));
          }
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  getProfile(): Observable<AuthResponse> {
    // Check if user is using demo login
    const token = this.apiService.getToken();
    if (token === 'demo-token-12345') {
      // For demo users, return the current user data
      return new Observable(observer => {
        observer.next({
          success: true,
          message: 'Profile retrieved successfully (Demo Mode)',
          user: this.currentUser || undefined
        });
        observer.complete();
      });
    }
    
    return this.apiService.getProfile();
  }

  logout(): void {
    this.apiService.logout();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Navigation helpers
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }

  updateProfile(userData: User): Observable<AuthResponse> {
    return new Observable(observer => {
      // Check if user is using demo login
      const token = this.apiService.getToken();
      if (token === 'demo-token-12345') {
        // For demo users, just update the local user data
        const updatedUser = { ...this.currentUser, ...userData };
        this.currentUserSubject.next(updatedUser);
        observer.next({
          success: true,
          message: 'Profile updated successfully (Demo Mode)',
          user: updatedUser
        });
        observer.complete();
        return;
      }

      this.apiService.updateProfile(userData).subscribe({
        next: (response: AuthResponse) => {
          if (response.success && response.user) {
            this.currentUserSubject.next(response.user);
            observer.next(response);
            observer.complete();
          } else {
            observer.error(new Error(response.message || 'Profile update failed'));
          }
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // Demo login method for demonstration purposes
  demoLogin(): void {
    const demoUser: User = {
      _id: 'demo-user-123',
      fullName: 'John Demo Farmer',
      email: 'demo@fertiarm.com',
      phone: '+1 (555) 123-4567',
      communication: 'English',
      language: 'English',
      farmName: 'Green Valley Farm',
      farmLocation: 'California, USA',
      farmSize: 150,
      primaryCrops: ['Wheat', 'Corn', 'Soybeans'],
      secondaryCrops: ['Sunflower', 'Barley'],
      sprayerType: 'Hydraulic Boom Sprayer',
      iotDevices: ['Soil Moisture Sensor', 'Weather Station', 'Crop Camera'],
      machinery: ['Tractor', 'Sprayer', 'Seeder', 'Harvester'],
      pesticides: [
        { name: 'Glyphosate', frequency: 'Monthly' },
        { name: 'Atrazine', frequency: 'Bi-weekly' },
        { name: '2,4-D', frequency: 'As needed' }
      ],
      fertilizerPreference: 'Organic',
      monthlyExpenditure: 5000,
      farmingExperience: '10+ years',
      createdAt: new Date('2020-01-15')
    };

    // Set a demo token for authentication
    this.apiService.setToken('demo-token-12345');
    this.currentUserSubject.next(demoUser);
    
    // Navigate to control panel to show the demo
    this.router.navigate(['/main/control-panel']);
  }
}
