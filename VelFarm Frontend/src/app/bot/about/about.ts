import { Component } from '@angular/core';
interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin?: string;
}
@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {
 // Team Members
  team: TeamMember[] = [
    { name: 'Aarav Sharma', role: 'Lead Engineer', image: 'assets/team/aarav.jpg', linkedin: 'https://linkedin.com/in/aarav' },
    { name: 'Meera Iyer', role: 'UI/UX Designer', image: 'assets/team/meera.jpg', linkedin: 'https://linkedin.com/in/meera' },
    { name: 'Rohan Patel', role: 'AI Specialist', image: 'assets/team/rohan.jpg', linkedin: 'https://linkedin.com/in/rohan' }
  ];

  // Achievements
  achievements: string[] = [
    '🏆 Best AgriTech Startup 2023',
    '🌱 10,000+ plants monitored successfully',
    '🤝 Partnered with 50+ eco-farms',
    '🚀 Expanded to 3 countries'
  ];

  // Future Goals
  goals: string[] = [
    'Integrate solar-powered automation',
    'AI-driven crop health prediction',
    'Global community for eco-farmers',
    '100% carbon-neutral operations by 2030'
  ];

  constructor() {}
}
