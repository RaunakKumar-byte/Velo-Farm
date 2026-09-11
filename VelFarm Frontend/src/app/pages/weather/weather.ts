import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WeatherService, WeatherData, WeatherAlert, FarmLocation } from '../../services/weather.service';

@Component({
  selector: 'app-weather',
  standalone: false,
  templateUrl: './weather.html',
  styleUrl: './weather.scss'
})
export class Weather implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Weather data
  weatherData: WeatherData | null = null;
  weatherAlerts: WeatherAlert[] = [];
  weatherRecommendations: string[] = [];

  // UI state
  isLoading = true;
  selectedLocation: FarmLocation | null = null;
  farmLocations: FarmLocation[] = [];
  errorMessage: string | null = null;

  // Weather details
  currentWeather: any = null;
  forecast: any[] = [];
  hourlyForecast: any[] = [];

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.farmLocations = this.weatherService.getFarmLocations();
    this.selectedLocation = this.weatherService.getCurrentLocation();
    this.loadWeatherData();
    this.loadWeatherRecommendations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWeatherData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Load current weather
    this.weatherService.getCurrentWeather()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (weather) => {
          this.weatherData = weather;
          this.currentWeather = weather.current;
          this.forecast = weather.forecast;
          this.generateHourlyForecast();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading weather data:', error);
          this.errorMessage = 'Failed to load weather data. Using fallback data.';
          this.isLoading = false;
        }
      });

    // Load weather alerts
    this.weatherService.getWeatherAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(alerts => {
        this.weatherAlerts = alerts;
      });
  }

  private loadWeatherRecommendations(): void {
    this.weatherService.getWeatherRecommendations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(recommendations => {
        this.weatherRecommendations = recommendations;
      });
  }

  private generateHourlyForecast(): void {
    if (!this.currentWeather) return;

    const baseTemp = this.currentWeather.temperature;
    const baseHumidity = this.currentWeather.humidity;
    const baseWindSpeed = this.currentWeather.windSpeed;

    this.hourlyForecast = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() + i);

      // Simulate hourly variations
      const tempVariation = (Math.sin(i * Math.PI / 12) * 10) + (Math.random() - 0.5) * 4;
      const humidityVariation = (Math.random() - 0.5) * 10;
      const windVariation = (Math.random() - 0.5) * 5;

      return {
        time: hour,
        temperature: Math.round(baseTemp + tempVariation),
        humidity: Math.max(20, Math.min(95, Math.round(baseHumidity + humidityVariation))),
        windSpeed: Math.max(0, Math.round(baseWindSpeed + windVariation)),
        condition: this.getConditionForHour(i),
        icon: this.getWeatherIcon(this.getConditionForHour(i))
      };
    });
  }

  private getConditionForHour(hour: number): string {
    const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Clear'];
    const hourOfDay = hour % 24;

    if (hourOfDay >= 6 && hourOfDay < 18) {
      return conditions[Math.floor(Math.random() * 3)]; // Day conditions
    } else {
      return conditions[Math.floor(Math.random() * 2) + 3]; // Night conditions
    }
  }

  // Utility methods
  getWeatherIcon(condition: string): string {
    return this.weatherService.getWeatherIcon(condition);
  }

  getAlertIcon(type: string): string {
    return this.weatherService.getAlertIcon(type as any);
  }

  getSeverityColor(severity: string): string {
    return this.weatherService.getSeverityColor(severity as any);
  }

  getSeverityBadgeClass(severity: string): string {
    return this.weatherService.getSeverityBadgeClass(severity as any);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatHour(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    });
  }

  getTemperatureColor(temp: number): string {
    if (temp < 32) return 'text-info'; // Freezing
    if (temp < 50) return 'text-primary'; // Cold
    if (temp < 70) return 'text-success'; // Mild
    if (temp < 85) return 'text-warning'; // Warm
    return 'text-danger'; // Hot
  }

  getWindDirection(degree: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degree / 22.5) % 16];
  }

  getUVIndexLevel(uvIndex: number): { level: string; color: string; description: string } {
    if (uvIndex <= 2) return { level: 'Low', color: 'text-success', description: 'Minimal sun protection required' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-warning', description: 'Some sun protection required' };
    if (uvIndex <= 7) return { level: 'High', color: 'text-warning', description: 'Sun protection required' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'text-danger', description: 'Extra sun protection required' };
    return { level: 'Extreme', color: 'text-danger', description: 'Avoid sun exposure' };
  }

  onLocationChange(locationId: string): void {
    const selectedFarm = this.farmLocations.find(farm => farm.id === locationId);
    if (selectedFarm) {
      this.selectedLocation = selectedFarm;
      this.weatherService.setCurrentLocation(selectedFarm);
      this.isLoading = true;
      this.loadWeatherData();
    }
  }

  refreshWeather(): void {
    this.isLoading = true;
    this.weatherService.refreshWeatherData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(weather => {
        this.weatherData = weather;
        this.currentWeather = weather.current;
        this.forecast = weather.forecast;
        this.generateHourlyForecast();
        this.isLoading = false;
      });
  }

  getActiveAlerts(): WeatherAlert[] {
    const now = new Date();
    return this.weatherAlerts.filter(alert =>
      alert.startTime <= now && alert.endTime >= now
    );
  }

  getUpcomingAlerts(): WeatherAlert[] {
    const now = new Date();
    return this.weatherAlerts.filter(alert =>
      alert.startTime > now && alert.startTime <= new Date(now.getTime() + 24 * 60 * 60 * 1000)
    );
  }

  getCurrentDate(): Date {
    return new Date();
  }
}
