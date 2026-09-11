import { Component, Input, OnChanges, SimpleChanges, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

export interface Plant {
  plantId: string;
  x: number;
  y: number;
  status?: 'healthy' | 'defected';
}

@Component({
  selector: 'app-field-layout',
  standalone: false,
  templateUrl: './field-layout.component.html',
  styleUrl: './field-layout.component.scss'
})
export class FieldLayoutComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() plants: Plant[] = [];

  gridRows: (Plant | null)[][] = [];

  private map?: L.Map;
  private markersLayer?: L.LayerGroup;

  ngOnInit(): void {
    this.generateGrid();
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.syncMarkersWithPlants();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['plants']) {
      this.generateGrid();
      this.syncMarkersWithPlants();
    }
  }

  private generateGrid(): void {
    if (!this.plants || this.plants.length === 0) {
      this.gridRows = [];
      return;
    }

    // Find max coordinates to determine grid size
    const maxX = Math.max(...this.plants.map(p => p.x));
    const maxY = Math.max(...this.plants.map(p => p.y));

    // Create grid matrix
    const grid: (Plant | null)[][] = [];

    // Initialize empty grid
    for (let y = 1; y <= maxY; y++) {
      const row: (Plant | null)[] = [];
      for (let x = 1; x <= maxX; x++) {
        row.push(null);
      }
      grid.push(row);
    }

    // Fill grid with plants
    this.plants.forEach(plant => {
      if (plant.y >= 1 && plant.y <= maxY && plant.x >= 1 && plant.x <= maxX) {
        grid[plant.y - 1][plant.x - 1] = plant;
      }
    });

    this.gridRows = grid;
  }

  private initMap(): void {
    if (this.map) return;

    // Wait for DOM to be ready
    setTimeout(() => {
      this.map = L.map('fieldMap', {
        center: [28.6139, 77.2090], // Delhi coordinates
        zoom: 13, // Better zoom level for field view
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        dragging: true,
        keyboard: true,
        touchZoom: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5
      });

      // Use a more suitable tile layer for agricultural/field mapping
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 3,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        noWrap: true,
        bounds: [[-90, -180], [90, 180]],
        tileSize: 256,
        zoomOffset: 0
      }).addTo(this.map);

      this.markersLayer = L.layerGroup().addTo(this.map);
      
      // Invalidate size to ensure proper rendering
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          // Fit to show a reasonable area around the field
          this.map.setView([28.6139, 77.2090], 13);
        }
      }, 200);
    }, 200);
  }

  private syncMarkersWithPlants(): void {
    if (!this.map) return;
    if (!this.markersLayer) this.markersLayer = L.layerGroup().addTo(this.map);
    this.markersLayer.clearLayers();

    // Map grid coordinates to lat/lng for demo purposes
    const originLat = 28.6139; // Delhi coordinates
    const originLng = 77.2090;
    const delta = 0.001; // Smaller spacing for better field view

    this.plants.forEach(p => {
      const lat = originLat + (p.y - 1) * delta;
      const lng = originLng + (p.x - 1) * delta;
      
      // Create custom icon based on plant status
      const iconColor = p.status === 'defected' ? '#dc3545' : '#28a745';
      const borderColor = p.status === 'defected' ? '#bd2130' : '#1e7e34';
      
      const marker = L.circleMarker([lat, lng], {
        radius: 12,
        color: borderColor,
        fillColor: iconColor,
        fillOpacity: 0.8,
        weight: 3,
        opacity: 0.9
      }).bindPopup(`
        <div style="text-align: center; min-width: 120px;">
          <h6 style="margin: 0; color: ${iconColor}; font-weight: bold;">${p.plantId}</h6>
          <small style="color: #6c757d;">Coordinates: (${p.x}, ${p.y})</small><br>
          <span style="color: ${iconColor}; font-weight: 500;">
            ${p.status === 'defected' ? '⚠️ Defected' : '✅ Healthy'}
          </span>
        </div>
      `, {
        closeButton: true,
        autoClose: false,
        closeOnClick: false,
        className: 'custom-popup'
      });
      
      this.markersLayer!.addLayer(marker);
    });

    // Fit bounds to show all plants with padding
    if (this.plants.length > 0) {
      const bounds = L.latLngBounds(
        this.plants.map(p => [
          originLat + (p.y - 1) * delta,
          originLng + (p.x - 1) * delta
        ]) as [number, number][]
      );
      this.map.fitBounds(bounds.pad(0.1));
    } else {
      // If no plants, show default view
      this.map.setView([originLat, originLng], 13);
    }
  }

  // Sample data for demonstration
  samplePlants: Plant[] = [
    { plantId: 'P-1-1', x: 1, y: 1, status: 'healthy' },
    { plantId: 'P-1-2', x: 2, y: 1, status: 'defected' },
    { plantId: 'P-2-1', x: 1, y: 2, status: 'healthy' }
  ];

  get healthyCount(): number {
    return this.plants.filter(p => p.status === 'healthy').length;
  }

  get defectedCount(): number {
    return this.plants.filter(p => p.status === 'defected').length;
  }

  get totalPlants(): number {
    return this.plants.length;
  }

  // Method to load sample data
  loadSampleData(): void {
    this.plants = [...this.samplePlants];
    this.generateGrid();
  }

  // Example JSON format
  jsonExample = `[
  { "plantId": "P-1-1", "x": 1, "y": 1, "status": "healthy" },
  { "plantId": "P-1-2", "x": 2, "y": 1, "status": "defected" },
  { "plantId": "P-2-1", "x": 1, "y": 2, "status": "healthy" }
]`;
}
