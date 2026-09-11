import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-features',
  standalone: false,
  templateUrl: './features.html',
  styleUrls: ['./features.scss']
})
export class Features implements OnInit {
  pageTitle: string = 'Our Features';
  featuresList = [
    {
      icon: 'fas fa-seedling',
      title: 'AI-powered Plant Health Detection',
      description: 'Farmers can upload leaf images or scan fields using a live camera feed. The system analyzes infection type and severity using AI (or mock for demo).'
    },
    {
      icon: 'fas fa-spray-can',
      title: 'Smart Sprayer Control (Auto & Manual)',
      description: 'Automatic spraying when infection level crosses a threshold. Manual override for dosage and spray duration with safety checks.'
    },
    {
      icon: 'fas fa-wifi',
      title: 'IoT Device Management & Monitoring',
      description: 'Dashboard to view sprayer, sensors, and camera status. Device health: battery %, connectivity, last active time.'
    },
    {
      icon: 'fas fa-bell',
      title: 'Alerts & Notifications System',
      description: 'Real-time alerts for infections, device issues, or unsafe weather conditions. Notifications via dashboard pop-ups and configurable farmer settings.'
    },
    {
      icon: 'fas fa-chart-bar',
      title: 'Analytics & Reports',
      description: 'Charts showing pesticide usage, infection trends, and farm health. Historical logs exportable in CSV/PDF for record-keeping.'
    },
    {
      icon: 'fas fa-cloud-showers-heavy',
      title: 'Weather-aware Spraying Optimization',
      description: 'Integration of weather data (rain, wind, humidity) to recommend or block spraying. Helps avoid chemical waste and ensures efficient application.'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}