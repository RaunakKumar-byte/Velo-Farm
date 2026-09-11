import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { LoaderService } from '../../services/loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-setting',
  standalone: false,
  templateUrl: './setting.html',
  styleUrl: './setting.scss'
})
export class Setting implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription: Subscription = new Subscription();

  // Settings state
  settings = {
    notifications: {
      push: true,
      email: true,
      sms: false,
      weather: true,
      crop: true,
      system: true
    },
    language: 'English',
    theme: 'light',
    sprayerCalibration: {
      pressure: 40,
      flowRate: 2.5,
      nozzleSize: 0.5,
      speed: 8
    },
    farmDetails: {
      name: '',
      location: '',
      size: 0,
      primaryCrops: [] as string[],
      soilType: 'Loam'
    }
  };

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    private readonly loaderService: LoaderService,
    private readonly apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadSettings();
    this.applyTheme();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  private loadUserData(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.settings.farmDetails = {
          name: user.farmName || '',
          location: user.farmLocation || '',
          size: user.farmSize || 0,
          primaryCrops: user.primaryCrops || [],
          soilType: 'Loam'
        };
      }
    });
  }

  private loadSettings(): void {
    const savedSettings = localStorage.getItem('khetloom-settings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }

  private saveSettings(): void {
    localStorage.setItem('khetloom-settings', JSON.stringify(this.settings));
  }

  // Navigation methods
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Profile management
  editProfile(): void {
    this.router.navigate(['/profile']);
  }

  // Account settings
  showPasswordModal = false;
  showEmailModal = false;
  showSprayerModal = false;
  showFarmModal = false;

  // Password change
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Email update
  emailData = {
    newEmail: '',
    currentPassword: ''
  };

  // Sprayer calibration
  sprayerData = {
    pressure: 40,
    flowRate: 2.5,
    nozzleSize: 0.5,
    speed: 8,
    calculatedCoverage: 0
  };

  // Farm details
  farmData = {
    name: '',
    location: '',
    size: 0,
    primaryCrops: [] as string[],
    soilType: 'Loam'
  };

  changePassword(): void {
    this.showPasswordModal = true;
  }

  updateEmail(): void {
    this.showEmailModal = true;
  }

  // Modal methods
  closeModals(): void {
    this.showPasswordModal = false;
    this.showEmailModal = false;
    this.showSprayerModal = false;
    this.showFarmModal = false;
  }

  // Password change methods
  onPasswordSubmit(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toastService.show('Passwords do not match!', 'error');
      return;
    }
    if (this.passwordData.newPassword.length < 6) {
      this.toastService.show('Password must be at least 6 characters!', 'error');
      return;
    }

    this.loaderService.show();
    // Simulate API call
    setTimeout(() => {
      this.loaderService.hide();
      this.toastService.show('Password changed successfully!', 'success');
      this.closeModals();
      this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    }, 2000);
  }

  // Email update methods
  onEmailSubmit(): void {
    if (!this.emailData.newEmail.includes('@')) {
      this.toastService.show('Please enter a valid email address!', 'error');
      return;
    }

    this.loaderService.show();
    // Simulate API call
    setTimeout(() => {
      this.loaderService.hide();
      this.toastService.show('Email update request sent! Check your new email for verification.', 'success');
      this.closeModals();
      this.emailData = { newEmail: '', currentPassword: '' };
    }, 2000);
  }

  // Sprayer calibration
  openSprayerCalibration(): void {
    this.sprayerData = { ...this.settings.sprayerCalibration, calculatedCoverage: 0 };
    this.calculateCoverage();
    this.showSprayerModal = true;
  }

  calculateCoverage(): void {
    // Coverage = (Flow Rate * Speed * 60) / (Pressure * Nozzle Size)
    this.sprayerData.calculatedCoverage =
      (this.sprayerData.flowRate * this.sprayerData.speed * 60) /
      (this.sprayerData.pressure * this.sprayerData.nozzleSize);
  }

  onSprayerSubmit(): void {
    this.settings.sprayerCalibration = { ...this.sprayerData };
    this.saveSettings();
    this.toastService.show('Sprayer calibration saved!', 'success');
    this.closeModals();
  }

  // Farm details
  openFarmDetails(): void {
    this.farmData = { ...this.settings.farmDetails };
    this.showFarmModal = true;
  }

  onFarmSubmit(): void {
    this.settings.farmDetails = { ...this.farmData };
    this.saveSettings();
    this.toastService.show('Farm details updated!', 'success');
    this.closeModals();
  }

  addCrop(crop: string): void {
    if (crop.trim() && !this.farmData.primaryCrops.includes(crop.trim())) {
      this.farmData.primaryCrops.push(crop.trim());
    }
  }

  removeCrop(index: number): void {
    this.farmData.primaryCrops.splice(index, 1);
  }

  // Data export functionality
  exportData(): void {
    const exportData = {
      settings: this.settings,
      user: this.currentUser,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `khetloom-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
    this.toastService.show('Settings exported successfully!', 'success');
  }

  // Security settings
  openSecuritySettings(): void {
    this.toastService.show('Security settings feature coming soon!', 'info');
  }

  // System health
  openSystemHealth(): void {
    this.toastService.show('System health check feature coming soon!', 'info');
  }

  // App preferences
  toggleNotification(type: string): void {
    this.settings.notifications[type as keyof typeof this.settings.notifications] =
      !this.settings.notifications[type as keyof typeof this.settings.notifications];
    this.saveSettings();
    this.toastService.show(`${type} notifications ${this.settings.notifications[type as keyof typeof this.settings.notifications] ? 'enabled' : 'disabled'}`, 'success');
  }

  changeLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const language = target.value;
    this.settings.language = language;
    this.saveSettings();
    this.toastService.show(`Language changed to ${language}`, 'success');
  }


  // Theme toggle
  toggleTheme(): void {
    this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
    this.saveSettings();
    this.applyTheme();
    this.toastService.show(`Theme changed to ${this.settings.theme}`, 'success');
  }

  private applyTheme(): void {
    if (this.settings.theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
