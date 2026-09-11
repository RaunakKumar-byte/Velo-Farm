export class DashboardComponent {
  userName = 'Ethan';
  farmInfo = { name: 'Green Acres', crop: 'Corn', location: 'Iowa' };

  stats = [
    { label: 'Total Plants Monitored', value: '12,500', change: '+10%', icon: 'fa-seedling', bg: 'linear-gradient(135deg,#ecfccb,#bbf7d0)', color: '#065f46' },
    { label: 'Infection Rate', value: '2.5%', change: '-0.5%', icon: 'fa-virus-covid', bg: 'linear-gradient(135deg,#fee2e2,#fecaca)', color: '#7f1d1d' },
    { label: 'Pesticide Saved', value: '150 Liters', change: '+20%', icon: 'fa-flask', bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', color: '#1e3a8a' },
    { label: 'Estimated Cost Savings', value: '$3,200', change: '+15%', icon: 'fa-dollar-sign', bg: 'linear-gradient(135deg,#fff7ed,#ffedd5)', color: '#92400e' }
  ];

  equipment = [
    {
      name: 'Tractor JD 5075E',
      lastMaintenance: '2023-10-15',
      nextMaintenance: '2024-04-15',
      status: 'Active',
      statusClass: 'status-active',
      statusIcon: 'fa-check-circle',
      nextIcon: 'fa-calendar-check muted-small text-success',
      style: { background: '#fbfff7', border: '1px solid rgba(16,185,129,0.08)' }
    },
    {
      name: 'Combine Harvester S780',
      lastMaintenance: '2023-11-01',
      nextMaintenance: '2024-09-01',
      status: 'Idle',
      statusClass: 'status-idle',
      statusIcon: 'fa-pause',
      nextIcon: 'fa-calendar muted-small text-warning',
      style: { background: '#f8fafc', border: '1px solid rgba(99,102,241,0.03)' }
    },
    {
      name: 'Sprayer R4045',
      lastMaintenance: '2023-09-20',
      nextMaintenance: 'Overdue by 25 days',
      status: 'Maintenance Due',
      statusClass: 'status-due',
      statusIcon: 'fa-triangle-exclamation',
      nextIcon: 'fa-triangle-exclamation muted-small text-danger',
      style: { background: '#fff7f6', border: '1px solid rgba(239,68,68,0.06)' }
    }
  ];

  weatherLocation = 'Iowa, US';
  weatherData = {
    current: { temp: 29, desc: 'Sunny', rain: '10%', wind: '5 km/h' },
    forecast: [
      { day: 'Mon', temp: 28, rain: 20, icon: 'fa-cloud-sun' },
      { day: 'Tue', temp: 27, rain: 30, icon: 'fa-cloud-showers-heavy' },
      { day: 'Wed', temp: 26, rain: 15, icon: 'fa-cloud' }
    ]
  };

  fields = [
    { name: 'Field A - Corn', status: 'Healthy', statusClass: 'text-success', lastUpdated: '2 hours ago', image: 'Nitro_Wallpaper_01_3840x2400.jpg' },
    { name: 'Field B - Wheat', status: 'Needs Attention', statusClass: 'text-warning', lastUpdated: '30 mins ago', image: 'Nitro_Wallpaper_01_3840x2400.jpg' },
    { name: 'Field C - Soybean', status: 'Diseased', statusClass: 'text-danger', lastUpdated: '10 mins ago', image: 'Nitro_Wallpaper_01_3840x2400.jpg' }
  ];

  alerts = [
    { title: 'Potential Pest Infestation', description: 'Field B - Soybean | Severity: Medium', icon: 'fa-triangle-exclamation', iconColor: 'text-warning' },
    { title: 'Irrigation System Malfunction', description: 'Field C - Wheat | Severity: Low', icon: 'fa-droplet', iconColor: 'text-danger' }
  ];

  refreshWeather() {
    // Yaha API call karke weather update kar sakte ho
    console.log('Weather refreshed!');
  }
}
