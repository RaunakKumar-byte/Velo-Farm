import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotService, Analytic, Plant, LogEntry } from '../../services/bot.services';
@Component({
  selector: 'app-analytics',
  standalone: false,
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss'
})
export class Analytics implements OnInit{
 analytics: Analytic = {
    totalActions: 0, movements: 0, fertilizations: 0, avgPlantHealth: 0,
    healthyPlants: 0, plantsNeedingCare: 0, totalPlants: 0, efficiency: 0
  };
  plants: Plant[] = [];
  recentLogs: LogEntry[] = [];

  constructor(private farmingApi: BotService) {}

  ngOnInit() {
    this.loadAnalytics();
    this.farmingApi.plants$.subscribe(plants => this.plants = plants);
    this.farmingApi.logs$.subscribe(logs => this.recentLogs = logs);

    // Refresh analytics every 10 seconds
    // setInterval(() => this.loadAnalytics(), 10000);
  }

  loadAnalytics() {
    this.farmingApi.getAnalytics().subscribe(
      analytics => this.analytics = analytics,
      error => console.error('Failed to load analytics:', error)
    );
  }

  // Calculation methods
  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getHealthGrade(health: number): string {
    if (health >= 90) return 'Excellent';
    if (health >= 80) return 'Very Good';
    if (health >= 70) return 'Good';
    if (health >= 60) return 'Fair';
    return 'Poor';
  }

  getHealthColor(health: number): string {
    if (health >= 80) return 'success';
    if (health >= 60) return 'warning';
    return 'danger';
  }

  getHealthGradeClass(health: number): string {
    return `health-${this.getHealthColor(health)}`;
  }

  getEfficiencyDescription(efficiency: number): string {
    if (efficiency >= 80) return 'Outstanding farm management!';
    if (efficiency >= 60) return 'Good operational efficiency';
    if (efficiency >= 40) return 'Room for improvement';
    return 'Consider optimizing operations';
  }

  // Growth stage analysis
  getGrowthStageStats() {
    const stages = [
      { name: 'seedling', description: 'Young plants starting growth', count: 0 },
      { name: 'growing', description: 'Actively developing plants', count: 0 },
      { name: 'mature', description: 'Fully developed plants', count: 0 },
      { name: 'flowering', description: 'Plants in bloom phase', count: 0 }
    ];

    stages.forEach(stage => {
      stage.count = Array.isArray(this.plants) ? this.plants.filter(p => p.growth_stage === stage.name).length : 0;
    });

    return stages;
  }

  getStageIcon(stage: string): string {
    switch (stage) {
      case 'seedling': return 'bi bi-seed';
      case 'growing': return 'bi bi-tree';
      case 'mature': return 'bi bi-tree-fill';
      case 'flowering': return 'bi bi-flower1';
      default: return 'bi bi-circle';
    }
  }

  getStageColor(stage: string): string {
    switch (stage) {
      case 'seedling': return 'text-info';
      case 'growing': return 'text-success';
      case 'mature': return 'text-primary';
      case 'flowering': return 'text-warning';
      default: return 'text-secondary';
    }
  }

  getStageProgressClass(stage: string): string {
    switch (stage) {
      case 'seedling': return 'bg-info';
      case 'growing': return 'bg-success';
      case 'mature': return 'bg-primary';
      case 'flowering': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  // Recent performance
  getTodayActions(): number {
    const today = new Date().toDateString();
    if (!Array.isArray(this.recentLogs)) {
      return 0;
    }
    return this.recentLogs.filter(log =>
      new Date(log.timestamp).toDateString() === today
    ).length;
  }

  getTodayFertilizations(): number {
    const today = new Date().toDateString();
    if (!Array.isArray(this.recentLogs)) {
      return 0;
    }
    return this.recentLogs.filter(log =>
      new Date(log.timestamp).toDateString() === today && log.action === 'fertilization'
    ).length;
  }

  getTodayMovements(): number {
    const today = new Date().toDateString();
    if (!Array.isArray(this.recentLogs)) {
      return 0;
    }
    return this.recentLogs.filter(log =>
      new Date(log.timestamp).toDateString() === today && log.action === 'movement'
    ).length;
  }

  // Performance rating
  getPerformanceStars(): string[] {
    const rating = Math.ceil((this.analytics.efficiency / 100) * 5);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted');
    }
    return stars;
  }

  getPerformanceRating(): string {
    if (this.analytics.efficiency >= 80) return 'Excellent';
    if (this.analytics.efficiency >= 60) return 'Good';
    if (this.analytics.efficiency >= 40) return 'Average';
    return 'Needs Improvement';
  }

  getPerformanceBadgeClass(): string {
    if (this.analytics.efficiency >= 80) return 'bg-success';
    if (this.analytics.efficiency >= 60) return 'bg-warning';
    return 'bg-danger';
  }

  // Smart recommendations
  getRecommendations() {
    const recommendations = [];

    // Health-based recommendations
    if (this.analytics.plantsNeedingCare > 5) {
      recommendations.push({
        title: 'Plant Health Alert',
        description: `${this.analytics.plantsNeedingCare} plants need immediate attention. Consider scheduling fertilization rounds.`,
        icon: 'bi bi-exclamation-triangle',
        color: 'text-danger',
        priority: 'High Priority',
        badgeClass: 'bg-danger'
      });
    }

    // Efficiency recommendations
    if (this.analytics.efficiency < 60) {
      recommendations.push({
        title: 'Optimize Operations',
        description: 'Current efficiency is below optimal. Consider automating routine fertilization schedules.',
        icon: 'bi bi-gear',
        color: 'text-warning',
        priority: 'Medium Priority',
        badgeClass: 'bg-warning'
      });
    }

    // Growth stage recommendations
    const seedlings = Array.isArray(this.plants) ? this.plants.filter(p => p.growth_stage === 'seedling').length : 0;
    if (seedlings > 10) {
      recommendations.push({
        title: 'Seedling Care',
        description: `${seedlings} seedlings detected. Ensure consistent watering and light fertilization for optimal growth.`,
        icon: 'bi bi-seed',
        color: 'text-info',
        priority: 'Medium Priority',
        badgeClass: 'bg-info'
      });
    }

    // Default recommendation if all is well
    if (recommendations.length === 0) {
      recommendations.push({
        title: 'System Running Well',
        description: 'All systems are operating efficiently. Continue current maintenance schedule.',
        icon: 'bi bi-check-circle',
        color: 'text-success',
        priority: 'Maintenance',
        badgeClass: 'bg-success'
      });
    }

    // Always add maintenance reminder
    if (recommendations.length < 3) {
      recommendations.push({
        title: 'Regular Maintenance',
        description: 'Schedule regular bot maintenance and resource refills to maintain optimal performance.',
        icon: 'bi bi-tools',
        color: 'text-secondary',
        priority: 'Routine',
        badgeClass: 'bg-secondary'
      });
    }

    return recommendations.slice(0, 3); // Limit to 3 recommendations
  }

}
