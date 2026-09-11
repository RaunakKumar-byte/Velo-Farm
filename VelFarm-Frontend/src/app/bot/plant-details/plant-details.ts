import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotService, Analytic, Plant, LogEntry } from '../../services/bot.services';
@Component({
  selector: 'app-plant-details',
  standalone: false,
  templateUrl: './plant-details.html',
  styleUrl: './plant-details.scss'
})
export class PlantDetails implements OnInit{
 plants: Plant[] = [];
  selectedPlant: Plant | null = null;
  botStatus: any = { x: 0, y: 0 };

  constructor(public farmingApi: BotService) {}

  ngOnInit() {
    // Subscribe to real-time data
    this.farmingApi.plants$.subscribe(plants => {
      this.plants = plants.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
    });

    this.farmingApi.botStatus$.subscribe(status => {
      this.botStatus = status;
    });
  }

  selectPlant(plant: Plant) {
    this.selectedPlant = plant;
  }

  clearSelection() {
    this.selectedPlant = null;
  }

  sendBotToPlant() {
    if (!this.selectedPlant) return;

    this.farmingApi.moveBot(this.selectedPlant.x, this.selectedPlant.y).subscribe(
      response => console.log('Bot sent to plant:', response),
      error => console.error('Failed to send bot:', error)
    );
  }

  fertilizePlant() {
    if (!this.selectedPlant || !this.isBotAtPlant()) return;

    this.farmingApi.dropFertilizer().subscribe(
      response => console.log('Fertilizer dropped:', response),
      error => console.error('Failed to drop fertilizer:', error)
    );
  }

  isBotAtPlant(): boolean {
    if (!this.selectedPlant) return false;
    return this.botStatus.x === this.selectedPlant.x && this.botStatus.y === this.selectedPlant.y;
  }

  // Styling and utility methods
  getPlantCellClass(plant: Plant): string {
    const healthClass = this.farmingApi.getPlantHealthColor(plant.health);
    return `plant-${healthClass} ${this.selectedPlant?.id === plant.id ? 'selected' : ''}`;
  }

  getPlantIcon(stage: string): string {
    return this.farmingApi.getGrowthStageIcon(stage);
  }

  getPlantTooltip(plant: Plant): string {
    return `Plant (${plant.x}, ${plant.y})\nHealth: ${plant.health}%\nStage: ${plant.growth_stage}\nFertilized: ${plant.fertilizer_count} times`;
  }

  getHealthDescription(health: number): string {
    if (health >= 80) return 'Excellent';
    if (health >= 60) return 'Good';
    if (health >= 40) return 'Fair';
    return 'Critical';
  }

  needsFertilization(plant: Plant): boolean {
    if (!plant.last_fertilized) return this.getDaysAgo(plant.created_at) > 3;
    return this.getDaysAgo(plant.last_fertilized) > 5;
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

  getPlantsNeedingCare(): Plant[] {
    if (!Array.isArray(this.plants)) return [];
    return this.plants.filter(p => p.health < 60 || this.needsFertilization(p)).slice(0, 6);
  }

  // Date formatting methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getDaysAgo(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
