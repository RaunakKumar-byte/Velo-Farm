import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
    description: string;
    feelsLike: number;
    visibility: number;
    uvIndex: number;
    pressure: number;
    windDirection: number;
  };
  forecast: {
    day: string;
    temperature: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    minTemp: number;
    maxTemp: number;
  }[];
  location: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export interface FarmLocation {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  city: string;
  state: string;
  country: string;
}

export interface OpenWeatherResponse {
  current: any;
  daily: any[];
  hourly: any[];
}

export interface WeatherAlert {
  id: string;
  type: 'storm' | 'frost' | 'drought' | 'flood' | 'heat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  affectedFields: string[];
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly weatherSubject = new BehaviorSubject<WeatherData | null>(null);
  public weather$ = this.weatherSubject.asObservable();

  private readonly alertsSubject = new BehaviorSubject<WeatherAlert[]>([]);
  public alerts$ = this.alertsSubject.asObservable();

  private currentLocation: FarmLocation | null = null;

  // Farm locations data
  private readonly farmLocations: FarmLocation[] = [
    {
      id: 'farm-1',
      name: 'Iowa Farm - Field A',
      coordinates: { lat: 41.8781, lng: -93.0977 },
      city: 'Des Moines',
      state: 'Iowa',
      country: 'USA'
    },
    {
      id: 'farm-2',
      name: 'California Farm - Central Valley',
      coordinates: { lat: 36.7783, lng: -119.4179 },
      city: 'Fresno',
      state: 'California',
      country: 'USA'
    },
    {
      id: 'farm-3',
      name: 'Texas Farm - Panhandle',
      coordinates: { lat: 35.2220, lng: -101.8313 },
      city: 'Amarillo',
      state: 'Texas',
      country: 'USA'
    },
    {
      id: 'farm-4',
      name: 'Florida Farm - Everglades',
      coordinates: { lat: 25.7617, lng: -80.1918 },
      city: 'Miami',
      state: 'Florida',
      country: 'USA'
    },
    {
      id: 'farm-5',
      name: 'Nebraska Farm - Corn Belt',
      coordinates: { lat: 41.1254, lng: -98.2681 },
      city: 'Grand Island',
      state: 'Nebraska',
      country: 'USA'
    }
  ];

  constructor(private readonly http: HttpClient) {
    // Set default location
    this.currentLocation = this.farmLocations[0];
    this.loadWeatherData();
  }

  // Get all available farm locations
  getFarmLocations(): FarmLocation[] {
    return [...this.farmLocations];
  }

  // Get current farm location
  getCurrentLocation(): FarmLocation | null {
    return this.currentLocation;
  }

  // Set current farm location
  setCurrentLocation(location: FarmLocation): void {
    this.currentLocation = location;
    this.loadWeatherData();
  }

  // Load weather data for current location
  private loadWeatherData(): void {
    if (!this.currentLocation) return;

    this.getCurrentWeather().subscribe({
      next: (weather) => {
        this.weatherSubject.next(weather);
        this.generateWeatherAlerts(weather);
      },
      error: (error) => {
        console.error('Error loading weather data:', error);
        // Fallback to default data if API fails
        const defaultWeather = this.getDefaultWeatherData();
        this.weatherSubject.next(defaultWeather);
        this.generateWeatherAlerts(defaultWeather);
      }
    });
  }

  private getDefaultAlerts(): WeatherAlert[] {
    return [
      {
        id: 'alert-1',
        type: 'storm',
        severity: 'medium',
        title: 'Thunderstorm Warning',
        description: 'Severe thunderstorms expected in the next 6 hours',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
        affectedFields: ['Field A', 'Field B'],
        icon: 'storm'
      },
      {
        id: 'alert-2',
        type: 'frost',
        severity: 'high',
        title: 'Frost Warning',
        description: 'Temperatures expected to drop below freezing tonight',
        startTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        endTime: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
        affectedFields: ['Field C', 'Field D'],
        icon: 'frost'
      }
    ];
  }

  private startWeatherUpdates(): void {
    // Simulate weather updates every 30 seconds
    setInterval(() => {
      const currentWeather = this.weatherSubject.value;
      if (!currentWeather) return;

      const updatedWeather: WeatherData = {
        ...currentWeather,
        current: {
          ...currentWeather.current,
          temperature: currentWeather.current.temperature + (Math.random() - 0.5) * 2,
          humidity: Math.max(30, Math.min(90, currentWeather.current.humidity + (Math.random() - 0.5) * 5)),
          windSpeed: Math.max(0, currentWeather.current.windSpeed + (Math.random() - 0.5) * 2)
        },
        forecast: currentWeather.forecast,
        location: currentWeather.location
      };
      this.weatherSubject.next(updatedWeather);
    }, 30000);
  }

  getCurrentWeather(): Observable<WeatherData> {
    if (!this.currentLocation) {
      return throwError(() => new Error('No location selected'));
    }

    // Check if API key is valid
    if (!environment.weatherApiKey || environment.weatherApiKey === 'your_openweathermap_api_key_here') {
      console.warn('Weather API key not configured, using default data');
      return of(this.getDefaultWeatherData());
    }

    const params = new HttpParams()
      .set('lat', this.currentLocation.coordinates.lat.toString())
      .set('lon', this.currentLocation.coordinates.lng.toString())
      .set('appid', environment.weatherApiKey)
      .set('units', 'imperial')
      .set('exclude', 'minutely,alerts');

    return this.http.get(`${environment.weatherApiUrl}/onecall`, { params })
      .pipe(
        map((response: any) => this.transformWeatherData(response)),
        catchError(error => {
          console.error('Weather API Error:', error);
          console.log('Falling back to default weather data');
          return of(this.getDefaultWeatherData());
        })
      );
  }

  // Transform OpenWeatherMap API response to our WeatherData format
  private transformWeatherData(apiResponse: any): WeatherData {
    const current = apiResponse.current;
    const daily = apiResponse.daily;

    return {
      current: {
        temperature: Math.round(current.temp),
        condition: this.getConditionFromCode(current.weather[0].id),
        humidity: current.humidity,
        windSpeed: Math.round(current.wind_speed),
        icon: this.getWeatherIconFromCode(current.weather[0].icon),
        description: current.weather[0].description,
        feelsLike: Math.round(current.feels_like),
        visibility: Math.round(current.visibility / 1609.34), // Convert meters to miles
        uvIndex: current.uvi,
        pressure: current.pressure,
        windDirection: current.wind_deg
      },
      forecast: daily.slice(0, 7).map((day: any, index: number) => ({
        day: index === 0 ? 'Today' : new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temperature: Math.round(day.temp.day),
        condition: this.getConditionFromCode(day.weather[0].id),
        icon: this.getWeatherIconFromCode(day.weather[0].icon),
        humidity: day.humidity,
        windSpeed: Math.round(day.wind_speed),
        minTemp: Math.round(day.temp.min),
        maxTemp: Math.round(day.temp.max)
      })),
      location: {
        name: this.currentLocation!.name,
        coordinates: this.currentLocation!.coordinates
      }
    };
  }

  // Get weather condition from OpenWeatherMap weather code
  private getConditionFromCode(code: number): string {
    if (code >= 200 && code < 300) return 'Thunderstorm';
    if (code >= 300 && code < 400) return 'Drizzle';
    if (code >= 500 && code < 600) return 'Rain';
    if (code >= 600 && code < 700) return 'Snow';
    if (code >= 700 && code < 800) return 'Fog';
    if (code === 800) return 'Clear';
    if (code > 800) return 'Clouds';
    return 'Unknown';
  }

  // Get weather icon from OpenWeatherMap icon code
  private getWeatherIconFromCode(iconCode: string): string {
    const iconMap: { [key: string]: string } = {
      '01d': 'bi-sun-fill',
      '01n': 'bi-moon-fill',
      '02d': 'bi-cloud-sun-fill',
      '02n': 'bi-cloud-moon-fill',
      '03d': 'bi-cloud-fill',
      '03n': 'bi-cloud-fill',
      '04d': 'bi-clouds-fill',
      '04n': 'bi-clouds-fill',
      '09d': 'bi-cloud-rain-fill',
      '09n': 'bi-cloud-rain-fill',
      '10d': 'bi-cloud-rain-fill',
      '10n': 'bi-cloud-rain-fill',
      '11d': 'bi-cloud-lightning-fill',
      '11n': 'bi-cloud-lightning-fill',
      '13d': 'bi-snow',
      '13n': 'bi-snow',
      '50d': 'bi-cloud-fog-fill',
      '50n': 'bi-cloud-fog-fill'
    };
    return iconMap[iconCode] || 'bi-cloud-sun-fill';
  }

  // Generate weather alerts based on current conditions
  private generateWeatherAlerts(weather: WeatherData): void {
    const alerts: WeatherAlert[] = [];
    const current = weather.current;

    // Temperature alerts
    if (current.temperature < 32) {
      alerts.push({
        id: 'frost-alert',
        type: 'frost',
        severity: 'high',
        title: 'Frost Warning',
        description: `Temperatures are below freezing (${current.temperature}°F). Protect sensitive crops.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        affectedFields: ['All Fields'],
        icon: 'frost'
      });
    }

    if (current.temperature > 95) {
      alerts.push({
        id: 'heat-alert',
        type: 'heat',
        severity: 'high',
        title: 'Heat Warning',
        description: `Extreme heat (${current.temperature}°F). Increase irrigation and monitor crop stress.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
        affectedFields: ['All Fields'],
        icon: 'heat'
      });
    }

    // Wind alerts
    if (current.windSpeed > 25) {
      alerts.push({
        id: 'wind-alert',
        type: 'storm',
        severity: 'medium',
        title: 'High Wind Warning',
        description: `Strong winds (${current.windSpeed} mph). Avoid spraying and secure equipment.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        affectedFields: ['All Fields'],
        icon: 'storm'
      });
    }

    // Humidity alerts
    if (current.humidity > 85) {
      alerts.push({
        id: 'humidity-alert',
        type: 'drought',
        severity: 'low',
        title: 'High Humidity Alert',
        description: `High humidity (${current.humidity}%). Monitor for fungal diseases.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        affectedFields: ['All Fields'],
        icon: 'drought'
      });
    }

    this.alertsSubject.next(alerts);
  }

  // Fallback default weather data
  private getDefaultWeatherData(): WeatherData {
    return {
      current: {
        temperature: 72,
        condition: 'Sunny',
        humidity: 65,
        windSpeed: 10,
        icon: 'bi-sun-fill',
        description: 'Clear skies with bright sunshine',
        feelsLike: 75,
        visibility: 10,
        uvIndex: 6,
        pressure: 1013,
        windDirection: 180
      },
      forecast: [
        { day: 'Today', temperature: 75, condition: 'Sunny', icon: 'bi-sun-fill', humidity: 60, windSpeed: 8, minTemp: 65, maxTemp: 80 },
        { day: 'Tue', temperature: 70, condition: 'Cloudy', icon: 'bi-cloud-fill', humidity: 70, windSpeed: 12, minTemp: 60, maxTemp: 75 },
        { day: 'Wed', temperature: 68, condition: 'Rain', icon: 'bi-cloud-rain-fill', humidity: 85, windSpeed: 15, minTemp: 55, maxTemp: 70 },
        { day: 'Thu', temperature: 73, condition: 'Sunny', icon: 'bi-sun-fill', humidity: 55, windSpeed: 6, minTemp: 65, maxTemp: 78 },
        { day: 'Fri', temperature: 78, condition: 'Sunny', icon: 'bi-sun-fill', humidity: 50, windSpeed: 9, minTemp: 68, maxTemp: 82 },
        { day: 'Sat', temperature: 80, condition: 'Sunny', icon: 'bi-sun-fill', humidity: 45, windSpeed: 7, minTemp: 70, maxTemp: 85 },
        { day: 'Sun', temperature: 76, condition: 'Cloudy', icon: 'bi-cloud-fill', humidity: 65, windSpeed: 11, minTemp: 68, maxTemp: 80 }
      ],
      location: {
        name: this.currentLocation?.name || 'Iowa Farm - Field A',
        coordinates: this.currentLocation?.coordinates || { lat: 41.8781, lng: -93.0977 }
      }
    };
  }

  getWeatherForecast(): Observable<WeatherData['forecast']> {
    return this.weather$.pipe(
      map(weather => weather?.forecast || []),
      delay(300)
    );
  }

  getWeatherAlerts(): Observable<WeatherAlert[]> {
    return this.alerts$.pipe(delay(200));
  }

  getActiveAlerts(): Observable<WeatherAlert[]> {
    return this.alerts$.pipe(
      map(alerts => alerts.filter(alert => 
        alert.startTime <= new Date() && alert.endTime >= new Date()
      )),
      delay(200)
    );
  }

  getWeatherIcon(condition: string): string {
    const iconMap: { [key: string]: string } = {
      'sunny': 'bi-sun-fill',
      'sun': 'bi-sun-fill',
      'cloudy': 'bi-cloud-fill',
      'cloud': 'bi-cloud-fill',
      'rainy': 'bi-cloud-rain-fill',
      'rain': 'bi-cloud-rain-fill',
      'storm': 'bi-cloud-lightning-fill',
      'snow': 'bi-snow',
      'fog': 'bi-cloud-fog-fill'
    };
    return iconMap[condition.toLowerCase()] || 'bi-cloud-sun-fill';
  }

  getAlertIcon(type: WeatherAlert['type']): string {
    const iconMap: { [key: string]: string } = {
      'storm': 'bi-cloud-lightning-fill',
      'frost': 'bi-snow',
      'drought': 'bi-sun-fill',
      'flood': 'bi-droplet-fill',
      'heat': 'bi-thermometer-sun-fill'
    };
    return iconMap[type] || 'bi-exclamation-triangle-fill';
  }

  getSeverityColor(severity: WeatherAlert['severity']): string {
    const colorMap: { [key: string]: string } = {
      'low': 'text-info',
      'medium': 'text-warning',
      'high': 'text-danger',
      'critical': 'text-danger'
    };
    return colorMap[severity] || 'text-secondary';
  }

  getSeverityBadgeClass(severity: WeatherAlert['severity']): string {
    const badgeMap: { [key: string]: string } = {
      'low': 'badge bg-info',
      'medium': 'badge bg-warning',
      'high': 'badge bg-danger',
      'critical': 'badge bg-danger'
    };
    return badgeMap[severity] || 'badge bg-secondary';
  }

  // Simulate weather data refresh
  refreshWeatherData(): Observable<WeatherData> {
    const newWeather = this.getDefaultWeatherData();
    // Add some random variation
    newWeather.current.temperature += (Math.random() - 0.5) * 10;
    newWeather.current.humidity = Math.max(30, Math.min(90, newWeather.current.humidity + (Math.random() - 0.5) * 20));
    newWeather.current.windSpeed = Math.max(0, newWeather.current.windSpeed + (Math.random() - 0.5) * 5);
    
    this.weatherSubject.next(newWeather);
    return of(newWeather).pipe(delay(1000));
  }

  // Get weather recommendations based on current conditions
  getWeatherRecommendations(): Observable<string[]> {
    return this.weather$.pipe(
      map(weather => {
        if (!weather) return [];
        
        const recommendations: string[] = [];
        const temp = weather.current.temperature;
        const humidity = weather.current.humidity;
        const windSpeed = weather.current.windSpeed;

        if (temp < 50) {
          recommendations.push('Consider protecting sensitive crops from cold temperatures');
        }
        if (temp > 85) {
          recommendations.push('Increase irrigation frequency due to high temperatures');
        }
        if (humidity > 80) {
          recommendations.push('Monitor for fungal diseases due to high humidity');
        }
        if (windSpeed > 15) {
          recommendations.push('Avoid spraying pesticides in high wind conditions');
        }
        if (weather.current.condition.toLowerCase().includes('rain')) {
          recommendations.push('Postpone field work until conditions improve');
        }

        return recommendations;
      })
    );
  }
}
