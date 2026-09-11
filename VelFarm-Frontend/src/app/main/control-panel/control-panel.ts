import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime, throttleTime } from 'rxjs';
import { DeviceService, Device } from '../../services/device.service';
import { LogsService, SystemLog, LogFilter } from '../../services/logs.service';
import { AISettingsService, AISettings, CalibrationResult, DiagnosticResult } from '../../services/ai-settings.service';
import { AIModelService, AIModel, ModelUploadResult } from '../../services/ai-model.service';
import { AuthService } from '../../services/auth.service';
import { SharedModule } from '../../shared/shared-module';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SharedModule],
  templateUrl: './control-panel.html',
  styleUrls: ['./control-panel.scss']
})
export class ControlPanelComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  // Data properties
  devices: Device[] = [];
  logs: SystemLog[] = [];
  aiSettings: AISettings | null = null;
  aiModels: AIModel[] = [];
  
  // Form properties
  logFilterForm!: FormGroup;
  aiSettingsForm!: FormGroup;
  
  // UI state
  isLoading = false;
  showCalibrationModal = false;
  showDiagnosticsModal = false;
  showUploadModal = false;
  calibrationResult: CalibrationResult | null = null;
  diagnosticsResult: DiagnosticResult | null = null;
  uploadResult: ModelUploadResult | null = null;
  
  // Filter options
  logTypes: string[] = [];
  logSeverities: string[] = [];
  selectedFile: File | null = null;
  
  // Real-time updates
  unreadLogCount = 0;
  overallAccuracy = 0;
  performanceMode = false; // Toggle to disable real-time updates

  constructor(
    private readonly fb: FormBuilder,
    private readonly deviceService: DeviceService,
    private readonly logsService: LogsService,
    private readonly aiSettingsService: AISettingsService,
    private readonly aiModelService: AIModelService,
    private readonly authService: AuthService,
    private readonly toast: ToastService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadData();
    this.setupSubscriptions();
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Cleanup services to prevent memory leaks
    this.deviceService.destroy();
    this.logsService.destroy();
    
    // Clear any remaining timeouts
    this.forceCloseAllModals();
  }

  private initializeForms(): void {
    this.logFilterForm = this.fb.group({
      searchTerm: [''],
      type: [''],
      severity: ['']
    });

    this.aiSettingsForm = this.fb.group({
      sprayThreshold: [75, [Validators.min(0), Validators.max(100)]],
      autoUpdates: [true],
      weatherIntegration: [true],
      soilMoistureThreshold: [60, [Validators.min(0), Validators.max(100)]],
      pestDetectionSensitivity: [80, [Validators.min(0), Validators.max(100)]],
      cropGrowthStage: ['vegetative']
    });
  }

  private loadData(): void {
    this.isLoading = true;
    
    // Load devices
    this.deviceService.getAllDevices()
      .pipe(takeUntil(this.destroy$))
      .subscribe(devices => {
        this.devices = devices;
      });

    // Load logs
    this.logsService.getAllLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe(logs => {
        this.logs = logs;
      });

    // Load AI settings
    this.aiSettingsService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.aiSettings = settings;
        this.aiSettingsForm.patchValue(settings);
      });

    // Load AI models
    this.aiModelService.getAllModels()
      .pipe(takeUntil(this.destroy$))
      .subscribe(models => {
        this.aiModels = models;
      });

    // Load filter options
    this.logTypes = this.logsService.getLogTypes();
    this.logSeverities = this.logsService.getLogSeverities();

    this.isLoading = false;
  }

  private setupSubscriptions(): void {
    // Watch for log filter changes with debounce to prevent excessive calls
    this.logFilterForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(filter => {
        this.applyLogFilter(filter);
      });

    // Watch for AI settings changes with debounce
    this.aiSettingsForm.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(settings => {
        this.updateAISettings(settings);
      });

    // Watch for unread log count with throttling
    this.logsService.getUnreadLogCount()
      .pipe(
        throttleTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe(count => {
        this.unreadLogCount = count;
      });

    // Watch for overall accuracy with throttling
    this.aiModelService.getOverallAccuracy()
      .pipe(
        throttleTime(2000),
        takeUntil(this.destroy$)
      )
      .subscribe(accuracy => {
        this.overallAccuracy = accuracy;
      });
  }

  private applyLogFilter(filter: LogFilter): void {
    this.logsService.getFilteredLogs(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(logs => {
        // Limit logs to prevent performance issues
        this.logs = logs.slice(0, 50);
      });
  }

  private updateAISettings(settings: Partial<AISettings>): void {
    if (this.aiSettingsForm.valid) {
      // Update individual settings based on what changed
      if (settings.sprayThreshold !== undefined) {
        this.aiSettingsService.updateSprayThreshold(settings.sprayThreshold)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      }
      
      if (settings.autoUpdates !== undefined) {
        this.aiSettingsService.toggleAutoUpdates()
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      }
      
      if (settings.weatherIntegration !== undefined) {
        this.aiSettingsService.updateWeatherIntegration(settings.weatherIntegration)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      }
      
      if (settings.soilMoistureThreshold !== undefined) {
        this.aiSettingsService.updateSoilMoistureThreshold(settings.soilMoistureThreshold)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      }
      
      if (settings.pestDetectionSensitivity !== undefined) {
        this.aiSettingsService.updatePestDetectionSensitivity(settings.pestDetectionSensitivity)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      }
      
      if (settings.cropGrowthStage !== undefined) {
        this.aiSettingsService.updateCropGrowthStage(settings.cropGrowthStage)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      }
    }
  }

  // Device management methods
  toggleDeviceAutoMode(deviceId: string): void {
    this.deviceService.toggleAutoMode(deviceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (device) => {
          console.log(`Device ${device.name} auto mode toggled to ${device.autoMode}`);
        },
        error: (error) => {
          console.error('Error toggling device auto mode:', error);
        }
      });
  }

  updateDeviceSprayIntensity(deviceId: string, intensity: 'low' | 'medium' | 'high'): void {
    this.deviceService.updateSprayIntensity(deviceId, intensity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (device) => {
          console.log(`Device ${device.name} spray intensity updated to ${device.sprayIntensity}`);
        },
        error: (error) => {
          console.error('Error updating device spray intensity:', error);
        }
      });
  }

  viewDeviceSchedule(deviceId: string): void {
    this.deviceService.getDeviceSchedule(deviceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(schedule => {
        console.log('Device schedule:', schedule);
        // TODO: Implement schedule modal or navigation
        this.toast.show(`Schedule for device ${deviceId}: ${schedule.length} entries`, 'info');
      });
  }

  // AI Settings methods
  onSprayThresholdChange(value: number): void {
    this.aiSettingsService.updateSprayThreshold(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onAutoUpdatesToggle(): void {
    this.aiSettingsService.toggleAutoUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  calibrateAllDevices(): void {
    this.showCalibrationModal = true;
    this.isLoading = true;
    this.calibrationResult = null;
    
    // Add timeout fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      this.isLoading = false;
      this.calibrationResult = {
        success: false,
        message: 'Calibration timed out. Please try again.',
        devicesCalibrated: 0,
        errors: ['Operation timed out'],
        timestamp: new Date()
      };
    }, 10000); // 10 second timeout
    
    this.aiSettingsService.calibrateAllDevices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          clearTimeout(timeout);
          this.calibrationResult = result;
          this.isLoading = false;
        },
        error: (error) => {
          clearTimeout(timeout);
          console.error('Error calibrating devices:', error);
          this.calibrationResult = {
            success: false,
            message: 'Calibration failed: ' + error.message,
            devicesCalibrated: 0,
            errors: [error.message],
            timestamp: new Date()
          };
          this.isLoading = false;
        }
      });
  }

  runDiagnostics(): void {
    this.showDiagnosticsModal = true;
    this.isLoading = true;
    this.diagnosticsResult = null;
    
    // Add timeout fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      this.isLoading = false;
      this.diagnosticsResult = {
        success: false,
        message: 'Diagnostics timed out. Please try again.',
        overallHealth: 'poor',
        issues: { critical: 1, warning: 0, info: 0 },
        recommendations: ['System timeout occurred'],
        timestamp: new Date()
      };
    }, 15000); // 15 second timeout for diagnostics
    
    this.aiSettingsService.runDiagnostics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          clearTimeout(timeout);
          this.diagnosticsResult = result;
          this.isLoading = false;
        },
        error: (error) => {
          clearTimeout(timeout);
          console.error('Error running diagnostics:', error);
          this.diagnosticsResult = {
            success: false,
            message: 'Diagnostics failed: ' + error.message,
            overallHealth: 'poor',
            issues: { critical: 1, warning: 0, info: 0 },
            recommendations: ['System error occurred'],
            timestamp: new Date()
          };
          this.isLoading = false;
        }
      });
  }

  // AI Model Management methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadNewModel(): void {
    if (!this.selectedFile) {
      this.toast.show('Please select a file to upload', 'error');
      return;
    }

    this.showUploadModal = true;
    this.isLoading = true;

    const modelData = {
      name: this.selectedFile.name.replace(/\.[^/.]+$/, ''),
      type: 'crop_health' as const,
      description: 'New AI model uploaded via control panel'
    };

    this.aiModelService.uploadModel(this.selectedFile, modelData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.uploadResult = result;
          this.isLoading = false;
          this.selectedFile = null;
        },
        error: (error) => {
          console.error('Error uploading model:', error);
          this.isLoading = false;
        }
      });
  }

  // Log management methods
  markLogAsRead(logId: string): void {
    this.logsService.markLogAsRead(logId);
  }

  markAllLogsAsRead(): void {
    this.logsService.markAllLogsAsRead();
  }

  getLogIcon(type: SystemLog['type']): string {
    return this.logsService.getLogIcon(type);
  }

  getLogColor(type: SystemLog['type']): string {
    return this.logsService.getLogColor(type);
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // Modal methods
  closeCalibrationModal(): void {
    this.showCalibrationModal = false;
    this.calibrationResult = null;
    this.isLoading = false;
  }

  closeDiagnosticsModal(): void {
    this.showDiagnosticsModal = false;
    this.diagnosticsResult = null;
    this.isLoading = false;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.uploadResult = null;
    this.selectedFile = null;
    this.isLoading = false;
  }

  // Force close all modals and reset loading state
  forceCloseAllModals(): void {
    this.showCalibrationModal = false;
    this.showDiagnosticsModal = false;
    this.showUploadModal = false;
    this.isLoading = false;
    this.calibrationResult = null;
    this.diagnosticsResult = null;
    this.uploadResult = null;
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      // Press Escape to close any modal
      if (event.key === 'Escape') {
        this.forceCloseAllModals();
      }
      // Press Ctrl+Shift+R to force reset (for debugging)
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        this.forceCloseAllModals();
        console.log('Force reset applied');
      }
      // Press Ctrl+Shift+P to toggle performance mode
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        this.togglePerformanceMode();
      }
    });
  }

  togglePerformanceMode(): void {
    this.performanceMode = !this.performanceMode;
    if (this.performanceMode) {
      this.deviceService.destroy();
      this.logsService.destroy();
      console.log('Performance mode enabled - real-time updates disabled');
    } else {
      // Restart services
      this.loadData();
      console.log('Performance mode disabled - real-time updates enabled');
    }
  }

  // Utility methods
  getDeviceStatusColor(status: Device['status']): string {
    const colors = {
      active: 'bg-success',
      inactive: 'bg-secondary',
      needs_calibration: 'bg-danger',
      error: 'bg-danger'
    };
    return colors[status];
  }

  getDeviceStatusLabel(status: Device['status']): string {
    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      needs_calibration: 'Needs Calibration',
      error: 'Error'
    };
    return labels[status];
  }

  getSprayIntensityColor(intensity: Device['sprayIntensity']): string {
    const colors = {
      low: 'text-info',
      medium: 'text-warning',
      high: 'text-danger'
    };
    return colors[intensity];
  }

  getCropGrowthStages(): string[] {
    return this.aiSettingsService.getCropGrowthStages();
  }

  getCropGrowthStageLabel(stage: string): string {
    return this.aiSettingsService.getCropGrowthStageLabel(stage as any);
  }

  getCurrentUser(): any {
    return this.authService.getCurrentUser();
  }

  getActiveModelCount(): number {
    return this.aiModels.filter(m => m.status === 'active').length;
  }

  onDeviceSprayIntensityChange(deviceId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target?.value || 'low';
    this.updateDeviceSprayIntensity(deviceId, value as 'low' | 'medium' | 'high');
  }

  onSprayThresholdInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = Number(target?.value || 75);
    this.onSprayThresholdChange(value);
  }

  getLastCalibrationTime(): Date {
    return this.aiSettings?.lastCalibration ?? new Date();
  }

  // TrackBy functions for performance
  trackByLogId(index: number, log: SystemLog): string {
    return log.id;
  }

  trackByDeviceId(index: number, device: Device): string {
    return device.id;
  }

  trackByModelId(index: number, model: AIModel): string {
    return model.id;
  }

  // Health status methods for diagnostics modal
  getHealthStatusColor(health: DiagnosticResult['overallHealth']): string {
    const colors = {
      excellent: 'text-success',
      good: 'text-primary',
      fair: 'text-warning',
      poor: 'text-danger'
    };
    return colors[health];
  }
}