import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AISettings {
  sprayThreshold: number; // 0-100
  autoUpdates: boolean;
  modelAccuracy: number; // 0-100
  lastCalibration: Date;
  diagnosticsLastRun: Date;
  weatherIntegration: boolean;
  soilMoistureThreshold: number; // 0-100
  pestDetectionSensitivity: number; // 0-100
  cropGrowthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  irrigationSchedule: {
    enabled: boolean;
    frequency: number; // hours
    duration: number; // minutes
  };
  spraySchedule: {
    enabled: boolean;
    frequency: number; // days
    timeOfDay: string; // HH:MM format
  };
}

export interface CalibrationResult {
  success: boolean;
  message: string;
  devicesCalibrated: number;
  errors: string[];
  timestamp: Date;
}

export interface DiagnosticResult {
  success: boolean;
  message: string;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  issues: {
    critical: number;
    warning: number;
    info: number;
  };
  recommendations: string[];
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AISettingsService {
  private settingsSubject = new BehaviorSubject<AISettings>({
    sprayThreshold: 75,
    autoUpdates: true,
    modelAccuracy: 94.2,
    lastCalibration: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    diagnosticsLastRun: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    weatherIntegration: true,
    soilMoistureThreshold: 60,
    pestDetectionSensitivity: 80,
    cropGrowthStage: 'vegetative',
    irrigationSchedule: {
      enabled: true,
      frequency: 12,
      duration: 30
    },
    spraySchedule: {
      enabled: true,
      frequency: 3,
      timeOfDay: '06:00'
    }
  });

  public settings$ = this.settingsSubject.asObservable();

  constructor() {}

  getSettings(): Observable<AISettings> {
    return this.settings$;
  }

  updateSprayThreshold(threshold: number): Observable<AISettings> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { ...currentSettings, sprayThreshold: Math.max(0, Math.min(100, threshold)) };
    this.settingsSubject.next(updatedSettings);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(updatedSettings);
        observer.complete();
      }, 300);
    });
  }

  toggleAutoUpdates(): Observable<AISettings> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { ...currentSettings, autoUpdates: !currentSettings.autoUpdates };
    this.settingsSubject.next(updatedSettings);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(updatedSettings);
        observer.complete();
      }, 300);
    });
  }

  updateWeatherIntegration(enabled: boolean): Observable<AISettings> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { ...currentSettings, weatherIntegration: enabled };
    this.settingsSubject.next(updatedSettings);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(updatedSettings);
        observer.complete();
      }, 300);
    });
  }

  updateSoilMoistureThreshold(threshold: number): Observable<AISettings> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { ...currentSettings, soilMoistureThreshold: Math.max(0, Math.min(100, threshold)) };
    this.settingsSubject.next(updatedSettings);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(updatedSettings);
        observer.complete();
      }, 300);
    });
  }

  updatePestDetectionSensitivity(sensitivity: number): Observable<AISettings> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { ...currentSettings, pestDetectionSensitivity: Math.max(0, Math.min(100, sensitivity)) };
    this.settingsSubject.next(updatedSettings);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(updatedSettings);
        observer.complete();
      }, 300);
    });
  }

  updateCropGrowthStage(stage: AISettings['cropGrowthStage']): Observable<AISettings> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { ...currentSettings, cropGrowthStage: stage };
    this.settingsSubject.next(updatedSettings);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(updatedSettings);
        observer.complete();
      }, 300);
    });
  }

  updateIrrigationSchedule(schedule: Partial<AISettings['irrigationSchedule']>): Observable<AISettings> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { 
      ...currentSettings, 
      irrigationSchedule: { ...currentSettings.irrigationSchedule, ...schedule }
    };
    this.settingsSubject.next(updatedSettings);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(updatedSettings);
        observer.complete();
      }, 300);
    });
  }

  updateSpraySchedule(schedule: Partial<AISettings['spraySchedule']>): Observable<AISettings> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { 
      ...currentSettings, 
      spraySchedule: { ...currentSettings.spraySchedule, ...schedule }
    };
    this.settingsSubject.next(updatedSettings);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(updatedSettings);
        observer.complete();
      }, 300);
    });
  }

  calibrateAllDevices(): Observable<CalibrationResult> {
    return new Observable(observer => {
      // Simulate calibration process
      setTimeout(() => {
        const result: CalibrationResult = {
          success: true,
          message: 'All devices calibrated successfully',
          devicesCalibrated: 3,
          errors: [],
          timestamp: new Date()
        };
        
        // Update last calibration time
        const currentSettings = this.settingsSubject.value;
        const updatedSettings = { ...currentSettings, lastCalibration: new Date() };
        this.settingsSubject.next(updatedSettings);
        
        observer.next(result);
        observer.complete();
      }, 3000);
    });
  }

  runDiagnostics(): Observable<DiagnosticResult> {
    return new Observable(observer => {
      // Simulate diagnostics process
      setTimeout(() => {
        const result: DiagnosticResult = {
          success: true,
          message: 'System diagnostics completed successfully',
          overallHealth: 'good',
          issues: {
            critical: 0,
            warning: 2,
            info: 5
          },
          recommendations: [
            'Consider updating firmware on Drone 1',
            'Schedule maintenance for Sprayer 2',
            'Monitor battery levels more closely',
            'Weather integration is working optimally',
            'AI model accuracy is within acceptable range'
          ],
          timestamp: new Date()
        };
        
        // Update last diagnostics time
        const currentSettings = this.settingsSubject.value;
        const updatedSettings = { ...currentSettings, diagnosticsLastRun: new Date() };
        this.settingsSubject.next(updatedSettings);
        
        observer.next(result);
        observer.complete();
      }, 5000);
    });
  }

  getCropGrowthStages(): AISettings['cropGrowthStage'][] {
    return ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest'];
  }

  getCropGrowthStageLabel(stage: AISettings['cropGrowthStage']): string {
    const labels = {
      seedling: 'Seedling',
      vegetative: 'Vegetative',
      flowering: 'Flowering',
      fruiting: 'Fruiting',
      harvest: 'Harvest'
    };
    return labels[stage];
  }

  getHealthStatusColor(health: DiagnosticResult['overallHealth']): string {
    const colors = {
      excellent: 'text-success',
      good: 'text-primary',
      fair: 'text-warning',
      poor: 'text-danger'
    };
    return colors[health];
  }

  getHealthStatusIcon(health: DiagnosticResult['overallHealth']): string {
    const icons = {
      excellent: 'bi-check-circle-fill',
      good: 'bi-check-circle',
      fair: 'bi-exclamation-triangle',
      poor: 'bi-x-circle'
    };
    return icons[health];
  }
}
