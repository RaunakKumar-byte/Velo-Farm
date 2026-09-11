import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotService, BotStatus, Plant, Analytic } from '../../services/bot.services';
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
 botStatus: BotStatus = { 
   x: 0, 
   y: 0, 
   battery: 100, 
   fertilizer_level: 100, 
   status: 'idle',
   isMoving: false,
   lastUpdate: new Date().toISOString()
 };
  plants: Plant[] = [];
  analytics: Analytic = {
    totalActions: 0, movements: 0, fertilizations: 0, avgPlantHealth: 0,
    healthyPlants: 0, plantsNeedingCare: 0, totalPlants: 0, efficiency: 0
  };
  recentLogs: any[] = [];

  constructor(private farmingApi: BotService) {}

  ngOnInit() {
    // Subscribe to real-time data
    this.farmingApi.botStatus$.subscribe(status => this.botStatus = status);
    this.farmingApi.plants$.subscribe(plants => this.plants = plants);
    this.farmingApi.logs$.subscribe(logs => {
      if (Array.isArray(logs)) {
        this.recentLogs = logs.slice(0, 10);
      } else {
        this.recentLogs = [];
      }
    });

    // Load analytics
    this.loadAnalytics();

    // Refresh analytics every 10 seconds
    // setInterval(() => this.loadAnalytics(), 10000);
  }

  loadAnalytics() {
    this.farmingApi.getAnalytics().subscribe(
      analytics => this.analytics = analytics,
      error => console.error('Failed to load analytics:', error)
    );
  }

  getBatteryCardClass(battery: number): string {
    if (battery > 60) return 'bg-success';
    if (battery > 30) return 'bg-warning';
    return 'bg-danger';
  }

  getBatteryIcon(battery: number): string {
    return this.farmingApi.getBatteryIcon(battery);
  }

  getPlantCellClass(plant: Plant): string {
    const healthClass = this.farmingApi.getPlantHealthColor(plant.health);
    return `plant-${healthClass} ${this.isBotPosition(plant.x, plant.y) ? 'bot-present' : ''}`;
  }

  getPlantIcon(stage: string): string {
    return this.farmingApi.getGrowthStageIcon(stage);
  }

  getPlantTooltip(plant: Plant): string {
    return `Plant (${plant.x}, ${plant.y})\nHealth: ${plant.health}%\nStage: ${plant.growth_stage}\nFertilized: ${plant.fertilizer_count} times`;
  }

  isBotPosition(x: number, y: number): boolean {
    return this.botStatus.x === x && this.botStatus.y === y;
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'movement': return 'bi bi-arrow-right-circle';
      case 'fertilization': return 'bi bi-droplet-fill';
      default: return 'bi bi-info-circle';
    }
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'movement': return 'text-primary';
      case 'fertilization': return 'text-success';
      default: return 'text-info';
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }

  hasAlerts(): boolean {
    return this.botStatus.battery < 20 ||
           this.botStatus.fertilizer_level < 20 ||
           this.analytics.plantsNeedingCare > 0;
  }

  // Quick Actions
  emergencyStop() {
    this.farmingApi.emergencyStop().subscribe(
      response => console.log('Emergency stop executed:', response),
      error => console.error('Emergency stop failed:', error)
    );
  }

  refillBattery() {
    this.farmingApi.refillResources(true, false).subscribe(
      response => console.log('Battery refilled:', response),
      error => console.error('Battery refill failed:', error)
    );
  }

  refillFertilizer() {
    this.farmingApi.refillResources(false, true).subscribe(
      response => console.log('Fertilizer refilled:', response),
      error => console.error('Fertilizer refill failed:', error)
    );
  }
}
