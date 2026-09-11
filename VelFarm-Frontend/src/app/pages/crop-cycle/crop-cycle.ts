import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CropCycle {
  id: string;
  name: string;
  scientificName: string;
  field: string;
  icon: string;
  plantingDate: Date;
  currentStage: GrowthStage;
  progress: number;
  estimatedHarvest: Date;
  growingDays: number;
  remainingDays: number;
  confidenceLevel: number;
  stages: GrowthStageInfo[];
}

export interface GrowthStageInfo {
  name: string;
  date: Date;
  status: 'completed' | 'current' | 'upcoming';
  icon: string;
  description: string;
}

export type GrowthStage = 'Planting' | 'Germination' | 'Vegetative' | 'Flowering' | 'Maturing' | 'Harvest';

@Component({
  selector: 'app-crop-cycle',
  standalone: false,
  templateUrl: './crop-cycle.html',
  styleUrls: ['./crop-cycle.scss']
})
export class CropCycleComponent implements OnInit {
  selectedCrop: CropCycle | null = null;
  showNewCycleModal = false;
  newCycleForm: any = {};

  cropCycles: CropCycle[] = [
    {
      id: '1',
      name: 'Corn',
      scientificName: 'Zea mays',
      field: 'Field A',
      icon: '🌽',
      plantingDate: new Date('2024-04-15'),
      currentStage: 'Vegetative',
      progress: 40,
      estimatedHarvest: new Date('2024-09-20'),
      growingDays: 158,
      remainingDays: 85,
      confidenceLevel: 92,
      stages: [
        { name: 'Planting', date: new Date('2024-04-15'), status: 'completed', icon: '✓', description: 'Seeds planted' },
        { name: 'Germination', date: new Date('2024-04-25'), status: 'completed', icon: '✓', description: 'Seeds sprouted' },
        { name: 'Vegetative', date: new Date('2024-05-15'), status: 'current', icon: '⏳', description: 'Current Stage' },
        { name: 'Flowering', date: new Date('2024-07-10'), status: 'upcoming', icon: '⋯', description: 'Est: July 10, 2024' },
        { name: 'Maturing', date: new Date('2024-08-20'), status: 'upcoming', icon: '⋯', description: 'Est: August 20, 2024' },
        { name: 'Harvest', date: new Date('2024-09-20'), status: 'upcoming', icon: '⋯', description: 'Est: September 20, 2024' }
      ]
    },
    {
      id: '2',
      name: 'Soybean',
      scientificName: 'Glycine max',
      field: 'Field B',
      icon: '🫘',
      plantingDate: new Date('2024-05-01'),
      currentStage: 'Flowering',
      progress: 60,
      estimatedHarvest: new Date('2024-10-05'),
      growingDays: 157,
      remainingDays: 63,
      confidenceLevel: 88,
      stages: [
        { name: 'Planting', date: new Date('2024-05-01'), status: 'completed', icon: '✓', description: 'Seeds planted' },
        { name: 'Germination', date: new Date('2024-05-10'), status: 'completed', icon: '✓', description: 'Seeds sprouted' },
        { name: 'Vegetative', date: new Date('2024-05-20'), status: 'completed', icon: '✓', description: 'Completed' },
        { name: 'Flowering', date: new Date('2024-06-15'), status: 'current', icon: '⏳', description: 'Current Stage' },
        { name: 'Maturing', date: new Date('2024-08-15'), status: 'upcoming', icon: '⋯', description: 'Est: August 15, 2024' },
        { name: 'Harvest', date: new Date('2024-10-05'), status: 'upcoming', icon: '⋯', description: 'Est: October 5, 2024' }
      ]
    },
    {
      id: '3',
      name: 'Wheat',
      scientificName: 'Triticum aestivum',
      field: 'Field C',
      icon: '🌾',
      plantingDate: new Date('2023-10-20'),
      currentStage: 'Maturing',
      progress: 80,
      estimatedHarvest: new Date('2024-06-15'),
      growingDays: 238,
      remainingDays: 48,
      confidenceLevel: 95,
      stages: [
        { name: 'Planting', date: new Date('2023-10-20'), status: 'completed', icon: '✓', description: 'Seeds planted' },
        { name: 'Germination', date: new Date('2023-10-30'), status: 'completed', icon: '✓', description: 'Seeds sprouted' },
        { name: 'Vegetative', date: new Date('2023-11-15'), status: 'completed', icon: '✓', description: 'Completed' },
        { name: 'Flowering', date: new Date('2024-03-01'), status: 'completed', icon: '✓', description: 'Completed' },
        { name: 'Maturing', date: new Date('2024-04-15'), status: 'current', icon: '⏳', description: 'Current Stage' },
        { name: 'Harvest', date: new Date('2024-06-15'), status: 'upcoming', icon: '⋯', description: 'Est: June 15, 2024' }
      ]
    }
  ];

  ngOnInit() {
    this.selectedCrop = this.cropCycles[0]; // Default to first crop
  }

  selectCrop(crop: CropCycle) {
    this.selectedCrop = crop;
  }

  openNewCycleModal() {
    this.showNewCycleModal = true;
    this.newCycleForm = {
      name: '',
      scientificName: '',
      field: '',
      plantingDate: new Date().toISOString().split('T')[0],
      estimatedHarvest: ''
    };
  }

  closeNewCycleModal() {
    this.showNewCycleModal = false;
    this.newCycleForm = {};
  }

  createNewCycle() {
    if (this.newCycleForm.name && this.newCycleForm.scientificName && this.newCycleForm.field) {
      const newCrop: CropCycle = {
        id: (this.cropCycles.length + 1).toString(),
        name: this.newCycleForm.name,
        scientificName: this.newCycleForm.scientificName,
        field: this.newCycleForm.field,
        icon: this.getCropIcon(this.newCycleForm.name),
        plantingDate: new Date(this.newCycleForm.plantingDate),
        currentStage: 'Planting',
        progress: 5,
        estimatedHarvest: new Date(this.newCycleForm.estimatedHarvest),
        growingDays: 0,
        remainingDays: this.calculateDaysBetween(new Date(this.newCycleForm.plantingDate), new Date(this.newCycleForm.estimatedHarvest)),
        confidenceLevel: 75,
        stages: this.generateStages(new Date(this.newCycleForm.plantingDate), new Date(this.newCycleForm.estimatedHarvest))
      };
      
      this.cropCycles.push(newCrop);
      this.selectedCrop = newCrop;
      this.closeNewCycleModal();
    }
  }

  viewDetails(crop: CropCycle) {
    this.selectedCrop = crop;
    // Scroll to timeline section
    setTimeout(() => {
      const timelineElement = document.querySelector('.timeline-section');
      if (timelineElement) {
        timelineElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  getStageClass(stage: GrowthStageInfo): string {
    switch (stage.status) {
      case 'completed': return 'stage-completed';
      case 'current': return 'stage-current';
      case 'upcoming': return 'stage-upcoming';
      default: return '';
    }
  }

  getProgressBarClass(progress: number): string {
    if (progress >= 80) return 'progress-high';
    if (progress >= 60) return 'progress-medium';
    return 'progress-low';
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 90) return 'confidence-high';
    if (confidence >= 80) return 'confidence-medium';
    return 'confidence-low';
  }

  private getCropIcon(name: string): string {
    const iconMap: { [key: string]: string } = {
      'corn': '🌽',
      'soybean': '🫘',
      'wheat': '🌾',
      'rice': '🌾',
      'tomato': '🍅',
      'potato': '🥔',
      'carrot': '🥕',
      'lettuce': '🥬',
      'spinach': '🥬'
    };
    return iconMap[name.toLowerCase()] || '🌱';
  }

  private calculateDaysBetween(start: Date, end: Date): number {
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  private generateStages(plantingDate: Date, harvestDate: Date): GrowthStageInfo[] {
    const totalDays = this.calculateDaysBetween(plantingDate, harvestDate);
    const stageDays = Math.floor(totalDays / 6);
    
    return [
      { name: 'Planting', date: new Date(plantingDate), status: 'completed', icon: '✓', description: 'Seeds planted' },
      { name: 'Germination', date: new Date(plantingDate.getTime() + stageDays * 24 * 60 * 60 * 1000), status: 'completed', icon: '✓', description: 'Seeds sprouted' },
      { name: 'Vegetative', date: new Date(plantingDate.getTime() + stageDays * 2 * 24 * 60 * 60 * 1000), status: 'current', icon: '⏳', description: 'Current Stage' },
      { name: 'Flowering', date: new Date(plantingDate.getTime() + stageDays * 3 * 24 * 60 * 60 * 1000), status: 'upcoming', icon: '⋯', description: `Est: ${new Date(plantingDate.getTime() + stageDays * 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}` },
      { name: 'Maturing', date: new Date(plantingDate.getTime() + stageDays * 4 * 24 * 60 * 60 * 1000), status: 'upcoming', icon: '⋯', description: `Est: ${new Date(plantingDate.getTime() + stageDays * 4 * 24 * 60 * 60 * 1000).toLocaleDateString()}` },
      { name: 'Harvest', date: new Date(harvestDate), status: 'upcoming', icon: '⋯', description: `Est: ${harvestDate.toLocaleDateString()}` }
    ];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }

  getStageColor(stage: GrowthStage): string {
    const colors: { [key: string]: string } = {
      'Planting': '#28a745',
      'Germination': '#17a2b8',
      'Vegetative': '#007bff',
      'Flowering': '#6f42c1',
      'Maturing': '#ffc107',
      'Harvest': '#fd7e14'
    };
    return colors[stage] || '#6c757d';
  }
}
