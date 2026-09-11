import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

export interface Notification {
  id: string;
  type: 'critical' | 'normal' | 'system' | 'warning' | 'info';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  iconColor: string;
  isRead: boolean;
  isArchived: boolean;
  category: string;
  source: string;
  actions?: NotificationAction[];
  metadata?: any;
}

export interface NotificationAction {
  label: string;
  type: 'primary' | 'secondary' | 'danger' | 'success';
  action: () => void;
  icon?: string;
}

export interface NotificationPreferences {
  criticalAlerts: boolean;
  normalAlerts: boolean;
  systemUpdates: boolean;
  warningAlerts: boolean;
  infoAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  critical: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.scss'],
  standalone: false
})
export class NotificationsComponent implements OnInit, OnDestroy {
  activeTab: string = 'current';
  activeFilter: string = 'all';
  searchQuery: string = '';
  markAllAsRead: boolean = false;
  showPreferences: boolean = false;
  showStats: boolean = false;
  isGeneratingReport: boolean = false;
  reportGenerated: boolean = false;
  notificationSound: HTMLAudioElement | null = null;
  private updateInterval: any;
  // Dashboard-like contextual data
  isLoadingExtras: boolean = false;
  publicStats: { totalUsers: number; avgFarmSize: number; avgMonthlyExpenditure: number } | null = null;
  recentUsers: any[] = [];
  recentActivities: any[] = [];
  recentLogs: any[] = [];
  publicConfig: { environment: string; version: string; time: string } | null = null;
  weatherTip: string = '';
  // Quick create notification form
  newNotification: {
    title: string;
    description: string;
    type: 'critical' | 'warning' | 'normal' | 'info' | 'system';
    priority: 'high' | 'medium' | 'low';
    category: string;
  } = {
    title: '',
    description: '',
    type: 'info',
    priority: 'low',
    category: 'General'
  };
  
  notifications: Notification[] = [
    {
      id: '1',
      type: 'critical',
      priority: 'high',
      title: 'Low Water Level Alert',
      description: 'Water level in the south field irrigation system is critically low at 15%. Immediate action required to prevent crop damage.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: '💧',
      iconColor: '#dc3545',
      isRead: false,
      isArchived: false,
      category: 'Irrigation',
      source: 'Sensor Network',
      metadata: { field: 'South Field', level: 15, threshold: 20 },
      actions: [
        { label: 'Dismiss', type: 'secondary', action: () => this.dismissNotification('1'), icon: '✕' },
        { label: 'Resolve', type: 'primary', action: () => this.resolveNotification('1'), icon: '✓' },
        { label: 'View Details', type: 'success', action: () => this.viewDetails('1'), icon: '👁️' }
      ]
    },
    {
      id: '2',
      type: 'critical',
      priority: 'high',
      title: 'Livestock Location Alert',
      description: 'Cow "Betsy" (ID: 001) has wandered outside the designated grazing area. GPS shows location 200m from boundary.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      icon: '🐄',
      iconColor: '#dc3545',
      isRead: false,
      isArchived: false,
      category: 'Livestock',
      source: 'GPS Tracker',
      metadata: { animalId: '001', distance: 200, boundary: 'North Pasture' },
      actions: [
        { label: 'Dismiss', type: 'secondary', action: () => this.dismissNotification('2'), icon: '✕' },
        { label: 'Check Location', type: 'primary', action: () => this.checkLocation('2'), icon: '📍' },
        { label: 'Send Alert', type: 'danger', action: () => this.sendAlert('2'), icon: '📢' }
      ]
    },
    {
      id: '3',
      type: 'warning',
      priority: 'medium',
      title: 'Greenhouse Temperature High',
      description: 'Temperature in Greenhouse A is 32°C, exceeding optimal range (18-28°C) for tomato plants. Adjust ventilation immediately.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      icon: '🌡️',
      iconColor: '#ffc107',
      isRead: false,
      isArchived: false,
      category: 'Environment',
      source: 'Climate Control',
      metadata: { temperature: 32, optimalMin: 18, optimalMax: 28, greenhouse: 'A' },
      actions: [
        { label: 'Dismiss', type: 'secondary', action: () => this.dismissNotification('3'), icon: '✕' },
        { label: 'Adjust Settings', type: 'primary', action: () => this.adjustSettings('3'), icon: '⚙️' }
      ]
    },
    {
      id: '4',
      type: 'info',
      priority: 'low',
      title: 'Weather Forecast Update',
      description: 'Heavy rainfall (40mm) predicted for next 48 hours. Consider implementing flood prevention measures for low-lying fields.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      icon: '🌧️',
      iconColor: '#17a2b8',
      isRead: true,
      isArchived: false,
      category: 'Weather',
      source: 'Weather Service',
      metadata: { rainfall: 40, duration: 48, affectedFields: ['Field C', 'Field D'] },
      actions: [
        { label: 'Dismiss', type: 'secondary', action: () => this.dismissNotification('4'), icon: '✕' },
        { label: 'View Forecast', type: 'success', action: () => this.viewForecast('4'), icon: '📊' }
      ]
    },
    {
      id: '5',
      type: 'system',
      priority: 'medium',
      title: 'System Update Available',
      description: 'AgriTrack v2.1.3 is available with new features: enhanced analytics, improved mobile app, and bug fixes.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      icon: '⬇️',
      iconColor: '#007bff',
      isRead: true,
      isArchived: false,
      category: 'System',
      source: 'Update Service',
      metadata: { version: '2.1.3', size: '45MB', features: ['Analytics', 'Mobile App', 'Bug Fixes'] },
      actions: [
        { label: 'Dismiss', type: 'secondary', action: () => this.dismissNotification('5'), icon: '✕' },
        { label: 'Update Now', type: 'primary', action: () => this.updateSoftware('5'), icon: '⬇️' },
        { label: 'Schedule', type: 'success', action: () => this.scheduleUpdate('5'), icon: '⏰' }
      ]
    },
    {
      id: '6',
      type: 'normal',
      priority: 'medium',
      title: 'Harvest Window Opening',
      description: 'Wheat crop in Field A is ready for harvest. Optimal window: 3-5 days. Moisture content: 18% (target: 14-16%).',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      icon: '🌾',
      iconColor: '#28a745',
      isRead: true,
      isArchived: false,
      category: 'Crop Management',
      source: 'Crop Monitoring',
      metadata: { crop: 'Wheat', field: 'A', moisture: 18, targetMin: 14, targetMax: 16 },
      actions: [
        { label: 'Dismiss', type: 'secondary', action: () => this.dismissNotification('6'), icon: '✕' },
        { label: 'Schedule Harvest', type: 'primary', action: () => this.scheduleHarvest('6'), icon: '📅' }
      ]
    },
    {
      id: '7',
      type: 'system',
      priority: 'low',
      title: 'Backup Completed Successfully',
      description: 'Daily backup completed at 02:00 AM. 2.3GB of data backed up to cloud storage. All systems secure.',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      icon: '💾',
      iconColor: '#6c757d',
      isRead: true,
      isArchived: false,
      category: 'System',
      source: 'Backup Service',
      metadata: { size: '2.3GB', time: '02:00', location: 'Cloud Storage' },
      actions: [
        { label: 'Dismiss', type: 'secondary', action: () => this.dismissNotification('7'), icon: '✕' }
      ]
    },
    {
      id: '8',
      type: 'critical',
      priority: 'high',
      title: 'Pest Infestation Detected',
      description: 'Aphid infestation detected in Field B (Tomato section). Population density: 15 insects/leaf. Immediate treatment required.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      icon: '🐛',
      iconColor: '#dc3545',
      isRead: true,
      isArchived: false,
      category: 'Pest Control',
      source: 'Pest Monitoring',
      metadata: { pest: 'Aphids', field: 'B', section: 'Tomato', density: 15, threshold: 5 },
      actions: [
        { label: 'Dismiss', type: 'secondary', action: () => this.dismissNotification('8'), icon: '✕' },
        { label: 'Inspect Field', type: 'primary', action: () => this.inspectField('8'), icon: '🔍' },
        { label: 'Order Treatment', type: 'danger', action: () => this.orderTreatment('8'), icon: '🛒' }
      ]
    },
    {
      id: '9',
      type: 'info',
      priority: 'low',
      title: 'Soil Moisture Optimal',
      description: 'Soil moisture levels in all fields are within optimal range (60-80%). No irrigation needed for next 24 hours.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      icon: '🌱',
      iconColor: '#28a745',
      isRead: false,
      isArchived: false,
      category: 'Soil Monitoring',
      source: 'Soil Sensors',
      metadata: { moisture: 70, range: '60-80%', fields: 'All' },
      actions: [
        { label: 'Dismiss', type: 'secondary', action: () => this.dismissNotification('9'), icon: '✕' }
      ]
    },
    {
      id: '10',
      type: 'warning',
      priority: 'medium',
      title: 'Equipment Maintenance Due',
      description: 'Tractor #3 is due for scheduled maintenance. Next service: 50 hours or 2 weeks. Book appointment now.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      icon: '🚜',
      iconColor: '#ffc107',
      isRead: true,
      isArchived: false,
      category: 'Equipment',
      source: 'Maintenance System',
      metadata: { equipment: 'Tractor #3', hoursRemaining: 50, daysRemaining: 14 },
      actions: [
        { label: 'Dismiss', type: 'secondary', action: () => this.dismissNotification('10'), icon: '✕' },
        { label: 'Book Service', type: 'primary', action: () => this.bookService('10'), icon: '📅' }
      ]
    }
  ];

  filteredNotifications: Notification[] = [];
  criticalCount: number = 0;
  reportPeriod: string = 'last7days';
  preferences: NotificationPreferences = {
    criticalAlerts: true,
    normalAlerts: true,
    systemUpdates: true,
    warningAlerts: true,
    infoAlerts: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true
  };
  stats: NotificationStats = {
    total: 0,
    unread: 0,
    critical: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  };
  selectedNotifications: string[] = [];
  showBulkActions: boolean = false;
  
  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.loadPreferences();
    this.updateFilteredNotifications();
    this.updateStats();
    this.initializeSound();
    this.startRealTimeUpdates();
    this.fetchNotificationsFromApi();
    this.loadExtras();
  }
  // API integration
  fetchNotificationsFromApi() {
    // Load list
    try {
      (window as any).requestIdleCallback?.(() => {})
    } catch {}
    (async () => {})();
    // Subscribe via service
    this.api.getNotifications().subscribe({
      next: (items: any[]) => {
        // Map backend format to local Notification interface if needed
        const mapped: Notification[] = (items || []).map((n: any) => ({
          id: n._id || n.id,
          type: (n.type || 'info') as any,
          priority: (n.priority || 'low') as any,
          title: n.title || 'Notification',
          description: n.description || n.message || '',
          timestamp: n.createdAt ? new Date(n.createdAt) : new Date(),
          icon: '🔔',
          iconColor: '#007bff',
          isRead: !!n.isRead,
          isArchived: !!n.isArchived,
          category: n.category || 'General',
          source: n.source || 'System'
        }));
        // Prepend API items to existing demo list (or replace)
        this.notifications = [...mapped, ...this.notifications.filter(d => !mapped.find(m => m.id === d.id))];
        this.updateFilteredNotifications();
        this.updateStats();
      },
      error: () => {}
    });
  }

  // Load public/dashboard-adjacent data to enrich the page
  loadExtras() {
    this.isLoadingExtras = true;
    // public stats
    this.api.getPublicStats().subscribe({
      next: (stats) => (this.publicStats = stats),
      error: () => {},
    });

    // recent users (limited fields)
    this.api.getRecentUsers(6).subscribe({
      next: (users) => (this.recentUsers = users || []),
      error: () => {},
    });

    // recent activities
    this.api.getRecentActivities().subscribe({
      next: (items) => (this.recentActivities = (items || []).slice(0, 6)),
      error: () => {},
    });

    // app logs (auth required)
    this.api.getRecentLogs().subscribe({
      next: (items) => (this.recentLogs = (items || []).slice(0, 6)),
      error: () => {},
    });

    // public config
    this.api.getPublicConfig().subscribe({
      next: (cfg) => (this.publicConfig = cfg),
      error: () => {},
    });

    // quick weather-based advisory using cached weather for user's farm location if available
    const userFarm = localStorage.getItem('farmLocation') || 'Farm';
    this.api.getCachedWeather(userFarm).subscribe({
      next: (wx) => {
        if (wx?.data?.forecast?.length) {
          const rainDay = wx.data.forecast.find((d: any) => /rain|storm/i.test(d.condition));
          if (rainDay) {
            this.weatherTip = `Rain expected soon in ${userFarm}. Consider adjusting irrigation schedules and securing equipment.`;
          } else {
            this.weatherTip = `No heavy rain expected. Ideal time for field inspections and scheduled maintenance.`;
          }
        }
      },
      error: () => {},
      complete: () => (this.isLoadingExtras = false)
    });
  }

  // Quick create notification
  submitNewNotification() {
    const payload = {
      title: this.newNotification.title,
      description: this.newNotification.description,
      type: this.newNotification.type,
      priority: this.newNotification.priority,
      category: this.newNotification.category,
      source: 'Farmer Action'
    };
    this.api.createNotification(payload).subscribe({
      next: (created) => {
        const createdMapped = {
          id: created?._id || created?.id || String(Date.now()),
          type: (created?.type || payload.type) as any,
          priority: (created?.priority || payload.priority) as any,
          title: created?.title || payload.title,
          description: created?.description || payload.description,
          timestamp: created?.createdAt ? new Date(created.createdAt) : new Date(),
          icon: '🔔',
          iconColor: '#28a745',
          isRead: false,
          isArchived: false,
          category: created?.category || payload.category,
          source: created?.source || payload.source
        } as Notification;
        this.notifications = [createdMapped, ...this.notifications];
        this.updateFilteredNotifications();
        this.updateStats();
        this.newNotification = { title: '', description: '', type: 'info', priority: 'low', category: 'General' };
        this.showSuccessMessage('Notification created');
      },
      error: (e) => {
        this.showSuccessMessage('Failed to create notification');
      }
    });
  }

  markAsReadViaApi(id: string) {
    this.api.markNotificationRead(id).subscribe({
      next: () => {
        const n = this.notifications.find(x => x.id === id);
        if (n) n.isRead = true;
        this.updateFilteredNotifications();
        this.updateStats();
      },
      error: () => {}
    });
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.updateFilteredNotifications();
  }

  setActiveFilter(filter: string) {
    this.activeFilter = filter;
    this.updateFilteredNotifications();
  }

  updateFilteredNotifications() {
    let filtered = [...this.notifications];

    // Filter by tab
    if (this.activeTab === 'current') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (this.activeTab === 'archive') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Filter by type
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === this.activeFilter);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query) ||
        n.type.toLowerCase().includes(query)
      );
    }

    this.filteredNotifications = filtered;
  }

  updateStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.stats = {
      total: this.notifications.length,
      unread: this.notifications.filter(n => !n.isRead).length,
      critical: this.notifications.filter(n => n.type === 'critical' && !n.isRead).length,
      today: this.notifications.filter(n => n.timestamp >= today).length,
      thisWeek: this.notifications.filter(n => n.timestamp >= weekAgo).length,
      thisMonth: this.notifications.filter(n => n.timestamp >= monthAgo).length
    };
    this.criticalCount = this.stats.critical;
  }

  onSearchChange() {
    this.updateFilteredNotifications();
  }

  toggleMarkAllAsRead() {
    this.markAllAsRead = !this.markAllAsRead;
    if (this.markAllAsRead) {
      this.notifications.forEach(n => n.isRead = true);
      this.updateFilteredNotifications();
      this.updateStats();
    }
  }

  dismissNotification(id: string) {
    this.markAsReadViaApi(id);
  }

  resolveNotification(id: string) {
    console.log('Resolving notification:', id);
    this.dismissNotification(id);
    // Add actual resolution logic here
  }

  checkLocation(id: string) {
    console.log('Checking location for notification:', id);
    this.dismissNotification(id);
    // Add location check logic here
  }

  adjustSettings(id: string) {
    console.log('Adjusting settings for notification:', id);
    this.dismissNotification(id);
    // Add settings adjustment logic here
  }

  updateSoftware(id: string) {
    console.log('Updating software for notification:', id);
    this.dismissNotification(id);
    // Add software update logic here
  }

  scheduleHarvest(id: string) {
    console.log('Scheduling harvest for notification:', id);
    this.dismissNotification(id);
    // Add harvest scheduling logic here
  }

  inspectField(id: string) {
    console.log('Inspecting field for notification:', id);
    this.dismissNotification(id);
    // Add field inspection logic here
  }

  generateReport() {
    this.isGeneratingReport = true;
    setTimeout(() => {
      this.isGeneratingReport = false;
      this.reportGenerated = true;
      this.showSuccessMessage('Report generated successfully!');
    }, 2000);
  }

  // Action methods for notifications
  viewDetails(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      console.log('Viewing details for notification:', notification);
      this.showSuccessMessage(`Viewing details for: ${notification.title}`);
    }
  }

  sendAlert(id: string) {
    console.log('Sending alert for notification:', id);
    this.showSuccessMessage('Alert sent to field team!');
    this.dismissNotification(id);
  }

  viewForecast(id: string) {
    console.log('Viewing weather forecast for notification:', id);
    this.showSuccessMessage('Opening weather forecast...');
    this.dismissNotification(id);
  }

  scheduleUpdate(id: string) {
    console.log('Scheduling update for notification:', id);
    this.showSuccessMessage('Update scheduled for tonight at 2 AM');
    this.dismissNotification(id);
  }

  orderTreatment(id: string) {
    console.log('Ordering treatment for notification:', id);
    this.showSuccessMessage('Treatment order placed! Expected delivery: 2-3 days');
    this.dismissNotification(id);
  }

  bookService(id: string) {
    console.log('Booking service for notification:', id);
    this.showSuccessMessage('Service appointment booked for next week');
    this.dismissNotification(id);
  }

  getNotificationTypeClass(type: string): string {
    switch (type) {
      case 'critical': return 'notification-critical';
      case 'normal': return 'notification-normal';
      case 'system': return 'notification-system';
      default: return '';
    }
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  }

  // New functionality methods
  loadPreferences() {
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      this.preferences = { ...this.preferences, ...JSON.parse(saved) };
    }
  }

  savePreferences() {
    localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
    this.showPreferences = false;
    this.showSuccessMessage('Preferences saved successfully!');
  }

  initializeSound() {
    if (this.preferences.soundEnabled) {
      this.notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    }
  }

  startRealTimeUpdates() {
    this.updateInterval = setInterval(() => {
      this.updateStats();
      this.updateFilteredNotifications();
    }, 30000); // Update every 30 seconds
  }

  showSuccessMessage(message: string) {
    // Simple alert for now, could be enhanced with toast notifications
    this.toast.show(message, 'success');
  }

  toggleNotificationSelection(id: string) {
    const index = this.selectedNotifications.indexOf(id);
    if (index > -1) {
      this.selectedNotifications.splice(index, 1);
    } else {
      this.selectedNotifications.push(id);
    }
    this.showBulkActions = this.selectedNotifications.length > 0;
  }

  selectAllNotifications() {
    this.selectedNotifications = this.filteredNotifications.map(n => n.id);
    this.showBulkActions = this.selectedNotifications.length > 0;
  }

  clearSelection() {
    this.selectedNotifications = [];
    this.showBulkActions = false;
  }

  bulkMarkAsRead() {
    this.selectedNotifications.forEach(id => {
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.isRead = true;
      }
    });
    this.updateStats();
    this.updateFilteredNotifications();
    this.clearSelection();
    this.showSuccessMessage(`${this.selectedNotifications.length} notifications marked as read`);
  }

  bulkDelete() {
    this.notifications = this.notifications.filter(n => !this.selectedNotifications.includes(n.id));
    this.updateStats();
    this.updateFilteredNotifications();
    this.clearSelection();
    this.showSuccessMessage(`${this.selectedNotifications.length} notifications deleted`);
  }

  bulkArchive() {
    this.selectedNotifications.forEach(id => {
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.isArchived = true;
        notification.isRead = true;
      }
    });
    this.updateStats();
    this.updateFilteredNotifications();
    this.clearSelection();
    this.showSuccessMessage(`${this.selectedNotifications.length} notifications archived`);
  }
}
