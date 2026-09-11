import { Component, OnInit } from '@angular/core';
import { Plant } from '../field-layout.component/field-layout.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-field-layout-demo',
  standalone: false,
  templateUrl: './field-layout-demo.html',
  styleUrls: ['./field-layout-demo.scss']
})
export class FieldLayoutDemoComponent implements OnInit {
  plants: Plant[] = [];

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    // Load sample data by default
    this.loadSampleData();
  }

  loadSampleData(): void {
    this.plants = [
      { plantId: 'P-1-1', x: 1, y: 1, status: 'healthy' },
      { plantId: 'P-1-2', x: 2, y: 1, status: 'defected' },
      { plantId: 'P-2-1', x: 1, y: 2, status: 'healthy' }
    ];
  }

  loadLargeField(): void {
    this.plants = [
      { plantId: 'P-1-1', x: 1, y: 1, status: 'healthy' },
      { plantId: 'P-1-2', x: 2, y: 1, status: 'defected' },
      { plantId: 'P-1-3', x: 3, y: 1, status: 'healthy' },
      { plantId: 'P-2-1', x: 1, y: 2, status: 'healthy' },
      { plantId: 'P-2-2', x: 2, y: 2, status: 'healthy' },
      { plantId: 'P-2-3', x: 3, y: 2, status: 'defected' },
      { plantId: 'P-3-1', x: 1, y: 3, status: 'defected' },
      { plantId: 'P-3-2', x: 2, y: 3, status: 'healthy' },
      { plantId: 'P-3-3', x: 3, y: 3, status: 'healthy' }
    ];
  }

  clearField(): void {
    this.plants = [];
  }

  // Example of how to load from JSON string
  loadFromJson(jsonString: string): void {
    try {
      this.plants = JSON.parse(jsonString);
    } catch (error) {
      console.error('Invalid JSON:', error);
      this.toast.show('Invalid JSON format', 'error');
    }
  }
}
