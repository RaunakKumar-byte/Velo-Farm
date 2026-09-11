import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-weather-cache',
  standalone: false,
  templateUrl: './weather-cache.html',
  styleUrls: ['./weather-cache.scss']
})
export class WeatherCache {
  location = '';
  cached: any = null;
  isLoading = false;
  errorMessage = '';

  payload: any = { location: '', data: {}, ttlMinutes: 60 };

  constructor(private api: ApiService, private toast: ToastService) {}

  get(): void {
    if (!this.location) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getCachedWeather(this.location).subscribe({
      next: (res) => { this.cached = res; this.isLoading = false; },
      error: (err) => { this.isLoading = false; this.errorMessage = err.message || 'Failed to get cache'; }
    });
  }

  set(): void {
    const body = { ...this.payload, location: this.payload.location || this.location };
    if (!body.location) return;
    this.api.setCachedWeather(body).subscribe({
      next: () => { this.get(); },
      error: (err) => { this.toast.show(err.message || 'Failed to set cache', 'error'); }
    });
  }
}



