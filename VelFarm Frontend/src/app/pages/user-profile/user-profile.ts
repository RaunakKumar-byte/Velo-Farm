import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService, User } from '../../services/api.service';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { Collapse } from 'bootstrap';
import { ToastService } from '../../services/toast.service';
import { LoaderService } from '../../services/loader.service';


@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  activeSection = 'farm-details';
  private userSubscription?: Subscription;
  private autoSaveSubscription?: Subscription;
  currentUser: User | null = null;
  isSaving = false;
  hasUnsavedChanges = false;
  lastSaved?: Date;

  // User profile data
  userProfile = {
    name: '',
    farmId: '',
    contact: '',
    email: '',
    profileImage: 'https://via.placeholder.com/150x150/28a745/ffffff?text=AG'
  };

  // Farm details
  farmDetails = {
    farmName: '',
    location: '',
    size: 0,
    primaryCrop: '',
    secondaryCrop: '',
    soilType: 'Loam',
    irrigationType: 'Drip',
    lastHarvest: '',
    nextPlanting: ''
  };

  // Equipment info
  equipmentInfo = {
    sprayerType: '',
    iotDevices: '',
    machinery: '',
    maintenanceSchedule: '',
    lastService: '',
    nextService: ''
  };

  // Pesticide & Fertilizer
  pesticideInfo = {
    pesticides: '',
    fertilizerType: '',
    monthlyExpenditure: 0,
    lastApplication: '',
    nextApplication: '',
    applicationMethod: 'Spray'
  };

  // Subscription info
  subscription = {
    plan: 'Free Plan',
    renewsOn: '',
    features: [] as string[],
    status: 'Active',
    price: 0,
    billingCycle: 'Monthly'
  };

  // Payment details
  paymentDetails = {
    cardType: '',
    lastFour: '',
    expires: '',
    billingAddress: '',
    paymentMethod: 'Credit Card'
  };

  // Form groups
  personalInfoForm!: FormGroup;
  farmInfoForm!: FormGroup;
  equipmentForm!: FormGroup;
  pesticideForm!: FormGroup;
  subscriptionForm!: FormGroup;
  securityForm!: FormGroup;

  // Preferences
  preferences: {
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
  } = {
    language: 'English',
    theme: 'light',
    notifications: {
      email: true,
      sms: false,
      inApp: true,
      weather: true,
      crop: true,
      system: true
    },
    measurementUnits: 'Imperial (acres, lbs)',
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY'
  };

  // Integrations
  integrations = [
    { 
      id: 'weather', 
      name: 'Weather API', 
      status: 'Connected', 
      action: 'Disconnect',
      description: 'Real-time weather data for your farm',
      lastSync: new Date(),
      icon: 'fas fa-cloud-sun'
    },
    { 
      id: 'market', 
      name: 'Market Data Provider', 
      status: 'Connected', 
      action: 'Disconnect',
      description: 'Crop prices and market trends',
      lastSync: new Date(),
      icon: 'fas fa-chart-line'
    },
    { 
      id: 'agritools', 
      name: 'AgriTools Suite', 
      status: 'Not Connected', 
      action: 'Connect',
      description: 'Advanced farming tools and analytics',
      lastSync: null,
      icon: 'fas fa-tools'
    },
    { 
      id: 'soil', 
      name: 'Soil Analysis Lab', 
      status: 'Not Connected', 
      action: 'Connect',
      description: 'Professional soil testing services',
      lastSync: null,
      icon: 'fas fa-flask'
    }
  ];

  // Security settings
  security = {
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordLastChanged: '',
    lastLogin: '',
    failedAttempts: 0,
    securityQuestions: [] as Array<{question: string, answer: string}>
  };

  // System settings
  systemSettings = {
    dataRetention: 365,
    backupFrequency: 'Weekly',
    lastBackup: '',
    systemVersion: '1.0.0',
    storageUsed: '2.5 GB',
    apiCallsToday: 0
  };

  // Modals and UI state
  showPasswordModal = false;
  showEmailModal = false;
  showPaymentModal = false;
  showIntegrationModal = false;
  showSecurityModal = false;
  showBackupModal = false;
  showImageCropModal = false;

  // Form data for modals
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  emailData = {
    newEmail: '',
    currentPassword: ''
  };

  paymentData = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: ''
  };

  securityData = {
    currentPassword: '',
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: ''
  };

  // Image upload
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  croppedImage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly apiService: ApiService,
    private readonly toast: ToastService,
    private readonly loader: LoaderService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.subscribeToUserChanges();
    this.setupAutoSave();
    this.loadSystemData();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
  }

  private subscribeToUserChanges(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadUserDataFromAuth(user);
      }
    });
  }

  private setupAutoSave(): void {
    // Auto-save personal info form
    this.autoSaveSubscription = this.personalInfoForm.valueChanges
      .pipe(debounceTime(2000), distinctUntilChanged())
      .subscribe(() => {
        if (this.personalInfoForm.valid) {
          this.autoSave();
        }
      });

    // Auto-save farm info form
    this.farmInfoForm.valueChanges
      .pipe(debounceTime(2000), distinctUntilChanged())
      .subscribe(() => {
        if (this.farmInfoForm.valid) {
          this.autoSave();
        }
      });
  }

  private loadSystemData(): void {
    // Load system information
    this.systemSettings.lastBackup = new Date().toISOString();
    this.systemSettings.apiCallsToday = Math.floor(Math.random() * 100);
  }

  initializeForms(): void {
    this.personalInfoForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{0,15}$/)]],
      communicationPreference: ['Email'],
      language: ['English']
    });

    this.farmInfoForm = this.fb.group({
      farmName: ['', Validators.required],
      farmLocation: ['', Validators.required],
      farmSize: ['', [Validators.required, Validators.min(0.1)]],
      primaryCrops: [''],
      secondaryCrops: [''],
      soilType: ['Loam'],
      irrigationType: ['Drip'],
      lastHarvest: [''],
      nextPlanting: ['']
    });

    this.equipmentForm = this.fb.group({
      sprayerType: [''],
      iotDevices: [''],
      machinery: [''],
      maintenanceSchedule: [''],
      lastService: [''],
      nextService: ['']
    });

    this.pesticideForm = this.fb.group({
      pesticides: [''],
      fertilizerType: [''],
      monthlyExpenditure: ['', [Validators.min(0)]],
      lastApplication: [''],
      nextApplication: [''],
      applicationMethod: ['Spray']
    });

    this.subscriptionForm = this.fb.group({
      plan: ['Free Plan'],
      billingCycle: ['Monthly']
    });

    this.securityForm = this.fb.group({
      twoFactorEnabled: [false],
      loginAlerts: [true],
      sessionTimeout: [30, [Validators.min(5), Validators.max(480)]]
    });
  }

  loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.loadUserDataFromAuth(user);
    } else {
      this.loadDefaultData();
    }
  }

  private loadUserDataFromAuth(user: User): void {
    // Update user profile display
    this.userProfile = {
      name: user.fullName || '',
      farmId: user._id ? user._id.substring(0, 8).toUpperCase() : 'N/A',
      contact: user.phone || '',
      email: user.email || '',
      profileImage: user.profileImage || 'https://via.placeholder.com/150x150/28a745/ffffff?text=' + (user.fullName?.charAt(0) || 'U')
    };

    // Update farm details
    this.farmDetails = {
      farmName: user.farmName || '',
      location: user.farmLocation || '',
      size: user.farmSize || 0,
      primaryCrop: user.primaryCrops ? user.primaryCrops.join(', ') : '',
      secondaryCrop: user.secondaryCrops ? user.secondaryCrops.join(', ') : '',
      soilType: user.soilType || 'Loam',
      irrigationType: user.irrigationType || 'Drip',
      lastHarvest: user.lastHarvest ? this.formatDate(user.lastHarvest) : '',
      nextPlanting: user.nextPlanting ? this.formatDate(user.nextPlanting) : ''
    };

    // Update equipment info
    this.equipmentInfo = {
      sprayerType: user.sprayerType || '',
      iotDevices: user.iotDevices ? user.iotDevices.join(', ') : '',
      machinery: user.machinery ? user.machinery.join(', ') : '',
      maintenanceSchedule: user.maintenanceSchedule || 'Monthly',
      lastService: user.lastService ? this.formatDate(user.lastService) : '',
      nextService: user.nextService ? this.formatDate(user.nextService) : ''
    };

    // Update pesticide info
    this.pesticideInfo = {
      pesticides: user.pesticides ? user.pesticides.map(p => p.name).join(', ') : '',
      fertilizerType: user.fertilizerPreference || '',
      monthlyExpenditure: user.monthlyExpenditure || 0,
      lastApplication: user.lastApplication ? this.formatDate(user.lastApplication) : '',
      nextApplication: user.nextApplication ? this.formatDate(user.nextApplication) : '',
      applicationMethod: user.applicationMethod || 'Spray'
    };

    // Update subscription info
    this.subscription = {
      plan: user.subscription?.plan || 'Free Plan',
      renewsOn: user.subscription?.renewsOn ? this.formatDate(user.subscription.renewsOn) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      features: user.subscription?.features || [
        'Basic Analytics',
        'Email Support',
        'Weather Data'
      ],
      status: user.subscription?.status || 'Active',
      price: user.subscription?.price || 0,
      billingCycle: user.subscription?.billingCycle || 'Monthly'
    };

    // Update payment details
    this.paymentDetails = {
      cardType: user.paymentDetails?.cardType || '',
      lastFour: user.paymentDetails?.lastFour || '',
      expires: user.paymentDetails?.expires || '',
      billingAddress: user.paymentDetails?.billingAddress || '',
      paymentMethod: user.paymentDetails?.paymentMethod || 'Credit Card'
    };

    // Update security info
    this.security = {
      twoFactorEnabled: user.security?.twoFactorEnabled || false,
      loginAlerts: user.security?.loginAlerts || true,
      sessionTimeout: user.security?.sessionTimeout || 30,
      passwordLastChanged: user.security?.passwordLastChanged ? this.formatDate(user.security.passwordLastChanged) : '',
      lastLogin: user.security?.lastLogin ? this.formatDate(user.security.lastLogin) : '',
      failedAttempts: user.security?.failedAttempts || 0,
      securityQuestions: user.security?.securityQuestions || []
    };

    // Update preferences
    if (user.preferences) {
      this.preferences = {
        language: user.preferences.language || 'English',
        theme: user.preferences.theme || 'light',
        notifications: {
          email: user.preferences.notifications?.email || true,
          sms: user.preferences.notifications?.sms || false,
          inApp: user.preferences.notifications?.inApp || true,
          weather: user.preferences.notifications?.weather || true,
          crop: user.preferences.notifications?.crop || true,
          system: user.preferences.notifications?.system || true
        },
        measurementUnits: user.preferences.measurementUnits || 'Imperial (acres, lbs)',
        timezone: user.preferences.timezone || 'UTC-5',
        dateFormat: user.preferences.dateFormat || 'MM/DD/YYYY'
      };
    }

    // Update integrations
    if (user.integrations && user.integrations.length > 0) {
      this.integrations = user.integrations.map(integration => ({
        id: integration.id,
        name: integration.name,
        status: integration.status,
        action: integration.status === 'Connected' ? 'Disconnect' : 'Connect',
        description: this.getIntegrationDescription(integration.id),
        lastSync: integration.lastSync ? new Date(integration.lastSync) : null,
        icon: this.getIntegrationIcon(integration.id)
      }));
    }

    // Update forms with real data
    this.personalInfoForm.patchValue({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phone || '',
      communicationPreference: user.communication || 'Email Only',
      language: user.language || 'English'
    });

    this.farmInfoForm.patchValue({
      farmName: user.farmName || '',
      farmLocation: user.farmLocation || '',
      farmSize: user.farmSize || '',
      primaryCrops: user.primaryCrops ? user.primaryCrops.join(', ') : '',
      secondaryCrops: user.secondaryCrops ? user.secondaryCrops.join(', ') : '',
      soilType: user.soilType || 'Loam',
      irrigationType: user.irrigationType || 'Drip',
      lastHarvest: user.lastHarvest ? this.formatDateForInput(user.lastHarvest) : '',
      nextPlanting: user.nextPlanting ? this.formatDateForInput(user.nextPlanting) : ''
    });

    this.equipmentForm.patchValue({
      sprayerType: user.sprayerType || '',
      iotDevices: user.iotDevices ? user.iotDevices.join(', ') : '',
      machinery: user.machinery ? user.machinery.join(', ') : '',
      maintenanceSchedule: user.maintenanceSchedule || 'Monthly',
      lastService: user.lastService ? this.formatDateForInput(user.lastService) : '',
      nextService: user.nextService ? this.formatDateForInput(user.nextService) : ''
    });

    this.pesticideForm.patchValue({
      pesticides: user.pesticides ? user.pesticides.map(p => p.name).join(', ') : '',
      fertilizerType: user.fertilizerPreference || '',
      monthlyExpenditure: user.monthlyExpenditure || '',
      lastApplication: user.lastApplication ? this.formatDateForInput(user.lastApplication) : '',
      nextApplication: user.nextApplication ? this.formatDateForInput(user.nextApplication) : '',
      applicationMethod: user.applicationMethod || 'Spray'
    });

    this.subscriptionForm.patchValue({
      plan: user.subscription?.plan || 'Free Plan',
      billingCycle: user.subscription?.billingCycle || 'Monthly'
    });

    this.securityForm.patchValue({
      twoFactorEnabled: user.security?.twoFactorEnabled || false,
      loginAlerts: user.security?.loginAlerts || true,
      sessionTimeout: user.security?.sessionTimeout || 30
    });
  }

  private loadDefaultData(): void {
    // Fallback to default data if no user is logged in
    this.personalInfoForm.patchValue({
      fullName: 'Demo User',
      email: 'demo@example.com',
      phoneNumber: '+1 (555) 123-4567',
      communicationPreference: 'Email Only',
      language: 'English'
    });

    this.farmInfoForm.patchValue({
      farmName: 'Green Acres Farm',
      farmLocation: 'Meadowshire, USA',
      farmSize: 150,
      primaryCrops: 'Corn, Soybeans',
      secondaryCrops: 'Wheat',
      soilType: 'Loam',
      irrigationType: 'Drip',
      lastHarvest: '',
      nextPlanting: ''
    });

    this.equipmentForm.patchValue({
      sprayerType: 'Boom Sprayer',
      iotDevices: 'Soil Sensors, Drones',
      machinery: 'Tractor, Combine Harvester',
      maintenanceSchedule: 'Monthly',
      lastService: '',
      nextService: ''
    });

    this.pesticideForm.patchValue({
      pesticides: 'Glyphosate',
      fertilizerType: 'Conventional',
      monthlyExpenditure: 5000,
      lastApplication: '',
      nextApplication: '',
      applicationMethod: 'Spray'
    });
  }


  // Navigation and UI methods
  setActiveSection(section: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.activeSection = section;

    // Close sidebar ONLY on small screens
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (window.innerWidth < 768 && sidebarMenu?.classList.contains('show')) {
      const bsCollapse = Collapse.getInstance(sidebarMenu);
      bsCollapse?.hide();
    }
  }

  toggleSidebar(): void {
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (sidebarMenu) {
      const bsCollapse = Collapse.getInstance(sidebarMenu) || new Collapse(sidebarMenu);
      bsCollapse.toggle();
    }
  }

  // Auto-save functionality
  private autoSave(): void {
    if (this.isSaving) return;
    
    this.isSaving = true;
    this.hasUnsavedChanges = true;
    
    // Simulate auto-save
    setTimeout(() => {
      this.isSaving = false;
      this.lastSaved = new Date();
      this.toast.show('Changes auto-saved', 'success');
    }, 1000);
  }

  // Form validation helpers
  getFieldError(fieldName: string, form: FormGroup): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return 'Please enter a valid phone number';
      if (field.errors['min']) return `${fieldName} must be greater than ${field.errors['min'].min}`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string, form: FormGroup): boolean {
    const field = form.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  // Save changes
  saveChanges(): void {
    if (!this.currentUser) {
      this.toast.show('Please login first to edit your profile', 'error');
      return;
    }

    // Validate all forms
    if (!this.personalInfoForm.valid || !this.farmInfoForm.valid) {
      this.toast.show('Please fix form errors before saving', 'error');
      return;
    }

    this.loader.show();
    this.isSaving = true;

    // Collect all form data
    const personalData = this.personalInfoForm.value;
    const farmData = this.farmInfoForm.value;
    const equipmentData = this.equipmentForm.value;
    const pesticideData = this.pesticideForm.value;

    // Prepare user data for update - start with minimal required data only
    const updatedUser: any = {
      fullName: personalData.fullName,
      email: personalData.email,
      phone: personalData.phoneNumber
    };

    // Add date fields conditionally
    if (farmData.lastHarvest) {
      updatedUser.lastHarvest = new Date(farmData.lastHarvest);
    }
    if (farmData.nextPlanting) {
      updatedUser.nextPlanting = new Date(farmData.nextPlanting);
    }
    if (equipmentData.lastService) {
      updatedUser.lastService = new Date(equipmentData.lastService);
    }
    if (equipmentData.nextService) {
      updatedUser.nextService = new Date(equipmentData.nextService);
    }
    if (pesticideData.lastApplication) {
      updatedUser.lastApplication = new Date(pesticideData.lastApplication);
    }
    if (pesticideData.nextApplication) {
      updatedUser.nextApplication = new Date(pesticideData.nextApplication);
    }

    // Update password if provided
    if (personalData.password && personalData.password.trim() !== '') {
      updatedUser.password = personalData.password;
    } else {
      // Remove password field if empty to avoid validation errors
      delete updatedUser.password;
    }

    // Save to backend
    console.log('Sending profile update data:', updatedUser);
    console.log('Data size:', JSON.stringify(updatedUser).length);
    this.authService.updateProfile(updatedUser).subscribe({
      next: (response) => {
        this.loader.hide();
        this.isSaving = false;
        this.hasUnsavedChanges = false;
        this.lastSaved = new Date();
        
        if (response.success) {
          this.toast.show('Profile updated successfully!', 'success');
          this.loadUserDataFromAuth(response.user!);
        } else {
          this.toast.show('Failed to update profile: ' + response.message, 'error');
        }
      },
      error: (error) => {
        this.loader.hide();
        this.isSaving = false;
        
        // Display detailed error information
        let errorMessage = 'Error updating profile. Please try again.';
        if (error.error && error.error.errorDetails) {
          const errorDetails = error.error.errorDetails;
          errorMessage = `Validation failed: ${errorDetails.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        this.toast.show(errorMessage, 'error');
        console.error('Full error object:', error);
        console.error('Error response:', error.error);
        console.error('Error details:', error.error?.errorDetails);
      }
    });
  }

  // Authentication methods
  logout(): void {
    this.authService.logout();
  }

  // Password management
  changePassword(): void {
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.showPasswordModal = true;
  }

  onPasswordSubmit(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toast.show('Passwords do not match!', 'error');
      return;
    }
    if (this.passwordData.newPassword.length < 6) {
      this.toast.show('Password must be at least 6 characters!', 'error');
      return;
    }
    
    this.loader.show();
    // Simulate password change
    setTimeout(() => {
      this.loader.hide();
      this.toast.show('Password changed successfully!', 'success');
      this.closeModals();
      this.security.passwordLastChanged = new Date().toLocaleDateString();
    }, 2000);
  }

  // Email management
  updateEmail(): void {
    this.emailData = { newEmail: '', currentPassword: '' };
    this.showEmailModal = true;
  }

  onEmailSubmit(): void {
    if (!this.emailData.newEmail.includes('@')) {
      this.toast.show('Please enter a valid email address!', 'error');
      return;
    }
    
    this.loader.show();
    // Simulate email update
    setTimeout(() => {
      this.loader.hide();
      this.toast.show('Email update request sent! Check your new email for verification.', 'success');
      this.closeModals();
    }, 2000);
  }

  // Payment management
  updatePayment(): void {
    this.paymentData = {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: '',
      billingAddress: ''
    };
    this.showPaymentModal = true;
  }

  onPaymentSubmit(): void {
    this.loader.show();
    // Simulate payment update
    setTimeout(() => {
      this.loader.hide();
      this.toast.show('Payment method updated successfully!', 'success');
      this.closeModals();
      this.paymentDetails.cardType = 'Visa';
      this.paymentDetails.lastFour = '1234';
      this.paymentDetails.expires = '12/2026';
    }, 2000);
  }

  viewBillingHistory(): void {
    this.toast.show('Opening billing history...', 'info');
    // Implement billing history logic
  }

  changePlan(): void {
    this.toast.show('Opening plan selection...', 'info');
    // Implement plan change logic
  }

  // Subscription management
  upgradePlan(): void {
    this.loader.show();
    setTimeout(() => {
      this.loader.hide();
      this.subscription.plan = 'Premium Plan';
      this.subscription.price = 49.99;
      this.toast.show('Plan upgraded successfully!', 'success');
    }, 2000);
  }

  cancelSubscription(): void {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      this.loader.show();
      setTimeout(() => {
        this.loader.hide();
        this.subscription.status = 'Cancelled';
        this.toast.show('Subscription cancelled. You can reactivate anytime.', 'info');
      }, 2000);
    }
  }

  // Security management
  toggleTwoFactor(): void {
    this.loader.show();
      this.security.twoFactorEnabled = !this.security.twoFactorEnabled;
    
    this.apiService.updateSecurity(this.security).subscribe({
      next: (response: any) => {
        this.loader.hide();
        if (response.success) {
      this.toast.show(`Two-factor authentication ${this.security.twoFactorEnabled ? 'enabled' : 'disabled'}`, 'success');
        } else {
          this.toast.show('Failed to update security settings: ' + response.message, 'error');
          // Revert the change
          this.security.twoFactorEnabled = !this.security.twoFactorEnabled;
        }
      },
      error: (error: any) => {
        this.loader.hide();
        this.toast.show('Error updating security settings. Please try again.', 'error');
        // Revert the change
        this.security.twoFactorEnabled = !this.security.twoFactorEnabled;
        console.error('Error updating security settings:', error);
      }
    });
  }

  setupSecurityQuestions(): void {
    this.securityData = {
      currentPassword: '',
      securityQuestion1: '',
      securityAnswer1: '',
      securityQuestion2: '',
      securityAnswer2: ''
    };
    this.showSecurityModal = true;
  }

  onSecuritySubmit(): void {
    this.loader.show();
    setTimeout(() => {
      this.loader.hide();
      this.toast.show('Security questions updated!', 'success');
      this.closeModals();
    }, 2000);
  }

  // Preferences management
  toggleTheme(theme: string): void {
    this.preferences.theme = theme;
    this.savePreferences();
    // Apply theme to document
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }

  toggleNotification(type: string): void {
    this.preferences.notifications[type as keyof typeof this.preferences.notifications] =
      !this.preferences.notifications[type as keyof typeof this.preferences.notifications];
    this.savePreferences();
  }

  changeLanguage(language: string): void {
    this.preferences.language = language;
    this.savePreferences();
  }

  private savePreferences(): void {
    if (!this.currentUser) return;
    
    this.apiService.updatePreferences(this.preferences).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toast.show('Preferences updated successfully!', 'success');
        } else {
          this.toast.show('Failed to update preferences: ' + response.message, 'error');
        }
      },
      error: (error: any) => {
        this.toast.show('Error updating preferences. Please try again.', 'error');
        console.error('Error updating preferences:', error);
      }
    });
  }

  // Integration management
  handleIntegrationAction(integration: any): void {
    this.loader.show();
    
    // Update integration status
    if (integration.status === 'Connected') {
      integration.status = 'Not Connected';
      integration.action = 'Connect';
      integration.lastSync = null;
    } else {
      integration.status = 'Connected';
      integration.action = 'Disconnect';
      integration.lastSync = new Date();
    }

    // Save to backend
    this.apiService.updateIntegrations(this.integrations).subscribe({
      next: (response: any) => {
      this.loader.hide();
        if (response.success) {
          this.toast.show(`${integration.name} ${integration.status === 'Connected' ? 'connected' : 'disconnected'} successfully!`, 'success');
        } else {
          this.toast.show('Failed to update integrations: ' + response.message, 'error');
          // Revert the change
      if (integration.status === 'Connected') {
        integration.status = 'Not Connected';
        integration.action = 'Connect';
        integration.lastSync = null;
      } else {
        integration.status = 'Connected';
        integration.action = 'Disconnect';
        integration.lastSync = new Date();
          }
        }
      },
      error: (error: any) => {
        this.loader.hide();
        this.toast.show('Error updating integrations. Please try again.', 'error');
        // Revert the change
        if (integration.status === 'Connected') {
          integration.status = 'Not Connected';
          integration.action = 'Connect';
          integration.lastSync = null;
        } else {
          integration.status = 'Connected';
          integration.action = 'Disconnect';
          integration.lastSync = new Date();
        }
        console.error('Error updating integrations:', error);
      }
    });
  }

  // Image upload
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.toast.show('Image size must be less than 5MB', 'error');
        return;
      }
      
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.showImageCropModal = true;
      };
      reader.readAsDataURL(file);
    }
  }

  cropImage(): void {
    // Simulate image cropping
    this.croppedImage = this.imagePreview;
    this.userProfile.profileImage = this.croppedImage!;
    
    // Save to backend
    this.loader.show();
    this.apiService.updateProfileImage(this.croppedImage!).subscribe({
      next: (response: any) => {
        this.loader.hide();
        if (response.success) {
    this.toast.show('Profile image updated!', 'success');
    this.closeModals();
        } else {
          this.toast.show('Failed to update profile image: ' + response.message, 'error');
        }
      },
      error: (error: any) => {
        this.loader.hide();
        this.toast.show('Error updating profile image. Please try again.', 'error');
        console.error('Error updating profile image:', error);
      }
    });
  }

  // Data management
  exportData(): void {
    const exportData = {
      userProfile: this.userProfile,
      farmDetails: this.farmDetails,
      equipmentInfo: this.equipmentInfo,
      pesticideInfo: this.pesticideInfo,
      preferences: this.preferences,
      subscription: this.subscription,
      security: this.security,
      systemSettings: this.systemSettings,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `khetloom-profile-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    this.toast.show('Profile data exported successfully!', 'success');
  }

  importData(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          this.loadImportedData(data);
          this.toast.show('Profile data imported successfully!', 'success');
        } catch (error) {
          console.error('Error parsing imported data:', error);
          this.toast.show('Invalid file format', 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  private loadImportedData(data: any): void {
    if (data.userProfile) this.userProfile = data.userProfile;
    if (data.farmDetails) this.farmDetails = data.farmDetails;
    if (data.equipmentInfo) this.equipmentInfo = data.equipmentInfo;
    if (data.pesticideInfo) this.pesticideInfo = data.pesticideInfo;
    if (data.preferences) this.preferences = data.preferences;
    if (data.subscription) this.subscription = data.subscription;
    if (data.security) this.security = data.security;
    if (data.systemSettings) this.systemSettings = data.systemSettings;
  }

  // System management
  createBackup(): void {
    this.loader.show();
    setTimeout(() => {
      this.loader.hide();
      this.systemSettings.lastBackup = new Date().toISOString();
      this.toast.show('Backup created successfully!', 'success');
    }, 2000);
  }

  restoreBackup(): void {
    if (confirm('This will restore your data from the last backup. Continue?')) {
      this.loader.show();
      setTimeout(() => {
        this.loader.hide();
        this.toast.show('Data restored from backup!', 'success');
      }, 2000);
    }
  }

  clearCache(): void {
    if (confirm('This will clear all cached data. Continue?')) {
      this.loader.show();
      setTimeout(() => {
        this.loader.hide();
        this.toast.show('Cache cleared successfully!', 'success');
      }, 1000);
    }
  }

  // Modal management
  closeModals(): void {
    this.showPasswordModal = false;
    this.showEmailModal = false;
    this.showPaymentModal = false;
    this.showIntegrationModal = false;
    this.showSecurityModal = false;
    this.showBackupModal = false;
    this.showImageCropModal = false;
  }

  // Utility methods
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  private getIntegrationDescription(id: string): string {
    const descriptions: { [key: string]: string } = {
      'weather': 'Real-time weather data for your farm',
      'market': 'Crop prices and market trends',
      'agritools': 'Advanced farming tools and analytics',
      'soil': 'Professional soil testing services'
    };
    return descriptions[id] || 'Integration service';
  }

  private getIntegrationIcon(id: string): string {
    const icons: { [key: string]: string } = {
      'weather': 'fas fa-cloud-sun',
      'market': 'fas fa-chart-line',
      'agritools': 'fas fa-tools',
      'soil': 'fas fa-flask'
    };
    return icons[id] || 'fas fa-puzzle-piece';
  }

  getPasswordStrength(password: string): { score: number; text: string; color: string } {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z\d]/.test(password)) score++;

    const levels = [
      { text: 'Very Weak', color: 'red' },
      { text: 'Weak', color: 'orange' },
      { text: 'Fair', color: 'yellow' },
      { text: 'Good', color: 'lightgreen' },
      { text: 'Strong', color: 'green' }
    ];

    return {
      score,
      text: levels[Math.min(score, 4)].text,
      color: levels[Math.min(score, 4)].color
    };
  }
}




