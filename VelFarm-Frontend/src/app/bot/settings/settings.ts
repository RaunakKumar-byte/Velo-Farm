import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotService, Analytic, Plant, LogEntry } from '../../services/bot.services';
import { BotStatus } from '../../models/bot.models';
@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings implements OnInit{
 botStatus: BotStatus = { 
   x: 0, 
   y: 0, 
   battery: 100, 
   fertilizer_level: 100, 
   status: 'idle',
   isMoving: false,
   lastUpdate: new Date().toISOString()
 };

  settings = {
    // Bot Settings
    pollingInterval: 2,
    movementSpeed: 1.0,
    batteryWarningLevel: 20,
    fertilizerWarningLevel: 20,
    autoReturn: false,

    // Farm Settings
    fieldWidth: 5,
    fieldHeight: 5,
    healthDegradation: 'normal',
    initialHealthMin: 60,
    initialHealthMax: 100,

    // Notification Settings
    enableBatteryAlerts: true,
    enableHealthAlerts: true,
    enableCompletionAlerts: true,
    enableSoundAlerts: false
  };

  systemStats = {
    totalActions: 0,
    uptime: '0h 0m',
    lastUpdate: 'Now',
    dbSize: '2.4 MB',
    responseTime: 45,
    successRate: 98.5,
    errorCount: 3,
    memoryUsage: 67
  };

  statusMessage: string = '';
  statusMessageClass: string = '';
  statusMessageIcon: string = '';

  constructor(private farmingApi: BotService) {}

  ngOnInit() {
    // Subscribe to bot status
    this.farmingApi.botStatus$.subscribe(status => this.botStatus = status);

    // Load settings from localStorage
    this.loadSettings();

    // Update system stats
    this.updateSystemStats();

    // Update stats every 30 seconds
    // setInterval(() => this.updateSystemStats(), 30000);
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('farmingBotSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }

  saveSettings() {
    localStorage.setItem('farmingBotSettings', JSON.stringify(this.settings));
  }

  updateSystemStats() {
    this.farmingApi.getAnalytics().subscribe(
      analytics => {
        this.systemStats.totalActions = analytics.totalActions;
        this.systemStats.lastUpdate = new Date().toLocaleTimeString();
        // Simulate other stats
        this.systemStats.responseTime = Math.floor(Math.random() * 50) + 30;
        this.systemStats.successRate = 98 + Math.random() * 2;
        this.systemStats.memoryUsage = 60 + Math.floor(Math.random() * 20);
      },
      error => console.error('Failed to load system stats:', error)
    );
  }

  showStatusMessage(message: string, type: 'success' | 'warning' | 'danger' | 'info' = 'info') {
    this.statusMessage = message;
    this.statusMessageClass = `alert-${type}`;

    switch (type) {
      case 'success':
        this.statusMessageIcon = 'bi bi-check-circle';
        break;
      case 'warning':
        this.statusMessageIcon = 'bi bi-exclamation-triangle';
        break;
      case 'danger':
        this.statusMessageIcon = 'bi bi-x-circle';
        break;
      default:
        this.statusMessageIcon = 'bi bi-info-circle';
    }

    setTimeout(() => {
      this.statusMessage = '';
    }, 5000);
  }

  // Settings save methods
  saveBotSettings() {
    this.saveSettings();
    this.showStatusMessage('Bot settings saved successfully!', 'success');
  }

  saveFarmSettings() {
    this.saveSettings();
    this.showStatusMessage('Farm settings saved successfully! Note: Some changes may require system restart.', 'success');
  }

  saveNotificationSettings() {
    this.saveSettings();
    this.showStatusMessage('Notification settings saved successfully!', 'success');
  }

  // Quick actions
  emergencyStop() {
    this.farmingApi.emergencyStop().subscribe(
      response => {
        this.showStatusMessage('Emergency stop executed! All commands cancelled.', 'warning');
      },
      error => {
        this.showStatusMessage('Failed to execute emergency stop.', 'danger');
      }
    );
  }

  clearAllCommands() {
    this.emergencyStop(); // Same as emergency stop
  }

  refillAllResources() {
    this.farmingApi.refillResources(true, true).subscribe(
      response => {
        this.showStatusMessage('All resources refilled successfully!', 'success');
      },
      error => {
        this.showStatusMessage('Failed to refill resources.', 'danger');
      }
    );
  }

  resetBotPosition() {
    this.farmingApi.moveBot(0, 0).subscribe(
      response => {
        this.showStatusMessage('Bot is returning to home position (0,0).', 'info');
      },
      error => {
        this.showStatusMessage('Failed to move bot to home position.', 'danger');
      }
    );
  }

  // Data management
  exportData() {
    // Simulate data export
    Promise.all([
      this.farmingApi.getPlants().toPromise(),
      this.farmingApi.getLogs().toPromise(),
      this.farmingApi.getAnalytics().toPromise()
    ]).then(([plants, logs, analytics]) => {
      const exportData = {
        timestamp: new Date().toISOString(),
        plants,
        logs,
        analytics,
        settings: this.settings
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `farming-bot-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.showStatusMessage('Data exported successfully!', 'success');
    }).catch(error => {
      this.showStatusMessage('Failed to export data.', 'danger');
    });
  }

  exportSettings() {
    const blob = new Blob([JSON.stringify(this.settings, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `farming-bot-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.showStatusMessage('Settings exported successfully!', 'success');
  }

  resetPlantData() {
    if (confirm('This will reset all plant data to default values. Are you sure?')) {
      this.showStatusMessage('Plant data reset functionality would be implemented here.', 'warning');
      // In a real implementation, this would make an API call to reset plant data
    }
  }

  resetAllData() {
    if (confirm('This will permanently delete all data including logs, plants, and analytics. This action cannot be undone. Are you sure?')) {
      this.showStatusMessage('Full data reset functionality would be implemented here.', 'danger');
      // In a real implementation, this would make an API call to reset all data
    }
  }
}
