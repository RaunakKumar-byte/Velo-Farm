import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Device {
  id: string;
  name: string;
  type: 'sprayer' | 'drone' | 'sensor';
  status: 'active' | 'inactive' | 'needs_calibration' | 'error';
  autoMode: boolean;
  sprayIntensity: 'low' | 'medium' | 'high';
  batteryLevel?: number;
  lastSeen: Date;
  location?: {
    lat: number;
    lng: number;
  };
  schedule?: DeviceSchedule[];
  isOnline: boolean;
}

export interface DeviceSchedule {
  id: string;
  deviceId: string;
  startTime: string;
  endTime: string;
  intensity: 'low' | 'medium' | 'high';
  isActive: boolean;
  days: number[]; // 0-6 for Sunday-Saturday
}

export interface DeviceStatusUpdate {
  deviceId: string;
  status: Device['status'];
  autoMode: boolean;
  sprayIntensity: Device['sprayIntensity'];
  batteryLevel?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private apiUrl = environment.apiUrl;
  private devicesSubject = new BehaviorSubject<Device[]>([]);
  public devices$ = this.devicesSubject.asObservable();

  private updateInterval?: any;

  constructor(private http: HttpClient) {
    this.initializeDevices();
    // Simulate real-time updates every 30 seconds with proper cleanup
    this.updateInterval = setInterval(() => {
      this.updateDeviceStatuses();
    }, 30000);
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  private initializeDevices(): void {
    // Initialize with sample data matching the image
    const sampleDevices: Device[] = [
      {
        id: 'sprayer-1',
        name: 'Sprayer 1',
        type: 'sprayer',
        status: 'active',
        autoMode: true,
        sprayIntensity: 'medium',
        batteryLevel: 85,
        lastSeen: new Date(),
        isOnline: true,
        schedule: [
          {
            id: 'sched-1',
            deviceId: 'sprayer-1',
            startTime: '06:00',
            endTime: '08:00',
            intensity: 'medium',
            isActive: true,
            days: [1, 2, 3, 4, 5] // Monday to Friday
          }
        ]
      },
      {
        id: 'sprayer-2',
        name: 'Sprayer 2',
        type: 'sprayer',
        status: 'inactive',
        autoMode: false,
        sprayIntensity: 'low',
        batteryLevel: 60,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isOnline: false,
        schedule: []
      },
      {
        id: 'drone-1',
        name: 'Drone 1',
        type: 'drone',
        status: 'needs_calibration',
        autoMode: true,
        sprayIntensity: 'high',
        batteryLevel: 15,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isOnline: true,
        schedule: [
          {
            id: 'sched-2',
            deviceId: 'drone-1',
            startTime: '09:00',
            endTime: '11:00',
            intensity: 'high',
            isActive: true,
            days: [0, 6] // Sunday and Saturday
          }
        ]
      }
    ];
    this.devicesSubject.next(sampleDevices);
  }

  getAllDevices(): Observable<Device[]> {
    return this.devices$;
  }

  getDeviceById(id: string): Observable<Device | undefined> {
    return this.devices$.pipe(
      map(devices => devices.find(device => device.id === id))
    );
  }

  updateDeviceStatus(deviceId: string, updates: Partial<Device>): Observable<Device> {
    const currentDevices = this.devicesSubject.value;
    const deviceIndex = currentDevices.findIndex(device => device.id === deviceId);
    
    if (deviceIndex !== -1) {
      const updatedDevice = { ...currentDevices[deviceIndex], ...updates };
      currentDevices[deviceIndex] = updatedDevice;
      this.devicesSubject.next([...currentDevices]);
      
      // Simulate API call
      return new Observable(observer => {
        setTimeout(() => {
          observer.next(updatedDevice);
          observer.complete();
        }, 500);
      });
    }
    
    return new Observable(observer => {
      observer.error(new Error('Device not found'));
    });
  }

  toggleAutoMode(deviceId: string): Observable<Device> {
    const device = this.devicesSubject.value.find(d => d.id === deviceId);
    if (device) {
      return this.updateDeviceStatus(deviceId, { autoMode: !device.autoMode });
    }
    return new Observable(observer => {
      observer.error(new Error('Device not found'));
    });
  }

  updateSprayIntensity(deviceId: string, intensity: 'low' | 'medium' | 'high'): Observable<Device> {
    return this.updateDeviceStatus(deviceId, { sprayIntensity: intensity });
  }

  calibrateDevice(deviceId: string): Observable<Device> {
    return this.updateDeviceStatus(deviceId, { 
      status: 'active',
      lastSeen: new Date(),
      isOnline: true
    });
  }

  calibrateAllDevices(): Observable<Device[]> {
    const currentDevices = this.devicesSubject.value;
    const updatedDevices = currentDevices.map(device => ({
      ...device,
      status: 'active' as const,
      lastSeen: new Date(),
      isOnline: true
    }));
    
    this.devicesSubject.next(updatedDevices);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(updatedDevices);
        observer.complete();
      }, 1000);
    });
  }

  runDiagnostics(): Observable<{ success: boolean; results: any[] }> {
    const currentDevices = this.devicesSubject.value;
    const results = currentDevices.map(device => ({
      deviceId: device.id,
      deviceName: device.name,
      status: device.status,
      batteryLevel: device.batteryLevel,
      isOnline: device.isOnline,
      lastSeen: device.lastSeen,
      issues: this.getDeviceIssues(device)
    }));

    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          results
        });
        observer.complete();
      }, 2000);
    });
  }

  private getDeviceIssues(device: Device): string[] {
    const issues: string[] = [];
    
    if (device.batteryLevel && device.batteryLevel < 20) {
      issues.push('Low battery');
    }
    
    if (!device.isOnline) {
      issues.push('Device offline');
    }
    
    if (device.status === 'needs_calibration') {
      issues.push('Needs calibration');
    }
    
    if (device.status === 'error') {
      issues.push('Device error');
    }
    
    return issues;
  }

  private updateDeviceStatuses(): void {
    const currentDevices = this.devicesSubject.value;
    const updatedDevices = currentDevices.map(device => {
      // Create new object to avoid mutation
      const updatedDevice = { ...device };
      
      // Simulate battery drain
      if (updatedDevice.batteryLevel && updatedDevice.batteryLevel > 0) {
        updatedDevice.batteryLevel = Math.max(0, updatedDevice.batteryLevel - Math.random() * 2);
      }
      
      // Simulate status changes
      if (updatedDevice.batteryLevel && updatedDevice.batteryLevel < 10) {
        updatedDevice.status = 'error';
        updatedDevice.isOnline = false;
      }
      
      return updatedDevice;
    });
    
    this.devicesSubject.next(updatedDevices);
  }

  // Cleanup method to stop updates
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  getDeviceSchedule(deviceId: string): Observable<DeviceSchedule[]> {
    return this.getDeviceById(deviceId).pipe(
      map(device => device?.schedule || [])
    );
  }

  updateDeviceSchedule(deviceId: string, schedule: DeviceSchedule[]): Observable<Device> {
    return this.updateDeviceStatus(deviceId, { schedule });
  }
}
