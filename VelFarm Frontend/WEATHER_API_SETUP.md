# Weather API Setup Instructions

## OpenWeatherMap API Setup

To use real weather data, you need to set up an OpenWeatherMap API key:

### 1. Get API Key
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to "API Keys" section
4. Copy your API key

### 2. Configure Environment
1. Open `src/environments/environment.ts`
2. Replace `your_openweathermap_api_key_here` with your actual API key:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5001/api',
  backendUrl: 'http://localhost:5001',
  weatherApiKey: 'YOUR_ACTUAL_API_KEY_HERE', // Replace this
  weatherApiUrl: 'https://api.openweathermap.org/data/2.5'
};
```

### 3. Farm Locations
The weather service includes 5 demo farm locations:
- **Iowa Farm - Field A** (Des Moines, IA)
- **California Farm - Central Valley** (Fresno, CA)
- **Texas Farm - Panhandle** (Amarillo, TX)
- **Florida Farm - Everglades** (Miami, FL)
- **Nebraska Farm - Corn Belt** (Grand Island, NE)

### 4. Features
- Real-time weather data for each farm location
- 7-day weather forecast
- Weather alerts based on conditions
- Farm-specific recommendations
- Fallback data if API fails

### 5. API Limits
- Free tier: 1,000 calls/day
- 60 calls/minute rate limit
- Data updates every 10 minutes

## Troubleshooting

If you see "Failed to load weather data" message:
1. Check your API key is correct
2. Verify internet connection
3. Check browser console for errors
4. The app will use fallback data if API fails
