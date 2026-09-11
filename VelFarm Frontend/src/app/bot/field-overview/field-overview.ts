import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotService, Analytic, Plant, LogEntry } from '../../services/bot.services';
import { BotStatus } from '../../services/bot.services';
@Component({
  selector: 'app-field-overview',
  standalone: false,
  templateUrl: './field-overview.html',
  styleUrl: './field-overview.scss'
})
export class FieldOverview implements OnInit{
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
  selectedPlant: Plant | null = null;

  constructor(public farmingApi: BotService) {}

  ngOnInit() {
    // Subscribe to real-time data
    this.farmingApi.botStatus$.subscribe(status => this.botStatus = status);
    this.farmingApi.plants$.subscribe(plants => {
      // Sort plants by position for consistent grid display
      this.plants = plants.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
    });
  }

  getPlantCellClass(plant: Plant): string {
    const healthClass = this.farmingApi.getPlantHealthColor(plant.health);
    return `plant-${healthClass} ${this.isBotPosition(plant.x, plant.y) ? 'bot-present' : ''}`;
  }

  getPlantIcon(stage: string): string {
    return this.farmingApi.getGrowthStageIcon(stage);
  }

  getPlantTooltip(plant: Plant): string {
    return `Plant (${plant.x}, ${plant.y})\nHealth: ${plant.health}%\nStage: ${plant.growth_stage}\nFertilized: ${plant.fertilizer_count} times\nLast fertilized: ${plant.last_fertilized ? this.formatDate(plant.last_fertilized) : 'Never'}`;
  }

  isBotPosition(x: number, y: number): boolean {
    return this.botStatus.x === x && this.botStatus.y === y;
  }

  selectPlant(plant: Plant) {
    this.selectedPlant = plant;
  }

  // Statistics methods
  getHealthyPlantsCount(): number {
    if (!Array.isArray(this.plants)) return 0;
    return this.plants.filter(p => p.health >= 80).length;
  }

  getWarningPlantsCount(): number {
    if (!Array.isArray(this.plants)) return 0;
    return this.plants.filter(p => p.health >= 60 && p.health < 80).length;
  }

  getCriticalPlantsCount(): number {
    if (!Array.isArray(this.plants)) return 0;
    return this.plants.filter(p => p.health < 60).length;
  }

  getAverageHealth(): number {
    if (!Array.isArray(this.plants) || this.plants.length === 0) return 0;
    const total = this.plants.reduce((sum, plant) => sum + plant.health, 0);
    return Math.round(total / this.plants.length);
  }

  getGrowthStageStats() {
    const stages = ['seedling', 'growing', 'mature', 'flowering'];
    return stages.map(stage => ({
      name: stage,
      count: Array.isArray(this.plants) ? this.plants.filter(p => p.growth_stage === stage).length : 0
    }));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  getDaysSinceLastFertilized(plant: Plant): number {
    if (!plant.last_fertilized) return Infinity;
    const lastFertilized = new Date(plant.last_fertilized);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastFertilized.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
