import { Component, OnInit } from '@angular/core';
import { NgxSwapyComponent } from '@omnedia/ngx-swapy';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.html',
  styleUrls: ['./about.scss']
})
export class About implements OnInit {

  aboutUsImage: string = 'https://tse1.mm.bing.net/th/id/OIP.G5qt9KVK3Oh9i1KXq5sVBQAAAA?pid=Api&P=0&h=180';
  aboutUsText: string = 'Welcome to our innovative platform dedicated to revolutionizing agriculture through technology. We believe in empowering farmers with smart solutions to enhance productivity, optimize resource utilization, and ensure sustainable farming practices. Our commitment extends to fostering a global community of empowered and successful farmers, driving forward a future where technology and agriculture work hand-in-hand for greater yields and a healthier planet.';

  missionTitle: string = 'Our Mission';
  missionText: string = 'Our mission is to bridge the gap between traditional farming and modern technology, providing tools that are easy to use, effective, and accessible to everyone. From real-time crop monitoring to intelligent irrigation systems, we are committed to helping farmers achieve greater yields and a healthier planet.';

  whatWeOfferTitle: string = 'What We Offer';
  features = [
    {
      title: 'AI-powered Plant Health Detection',
      description: 'Farmers can upload leaf images or scan fields using a live camera feed. The system analyzes infection type and severity using AI (or mock for demo).'
    },
    {
      title: 'Smart Sprayer Control (Auto & Manual)',
      description: 'Automatic spraying when infection level crosses a threshold. Manual override for dosage and spray duration with safety checks.'
    },
    {
      title: 'IoT Device Management & Monitoring',
      description: 'Dashboard to view sprayer, sensors, and camera status. Device health: battery %, connectivity, last active time.'
    },
    {
      title: 'Alerts & Notifications System',
      description: 'Real-time alerts for infections, device issues, or unsafe weather conditions. Notifications via dashboard pop-ups and configurable farmer settings.'
    },
    {
      title: 'Analytics & Reports',
      description: 'Charts showing pesticide usage, infection trends, and farm health. Historical logs exportable in CSV/PDF for record-keeping.'
    },
    {
      title: 'Weather-aware Spraying Optimization',
      description: 'Integration of weather data (rain, wind, humidity) to recommend or block spraying. Helps avoid chemical waste and ensures efficient application.'
    }
  ];

  ourCommitmentTitle: string = 'Our Commitment';
  ourCommitmentText: string = 'Join us on this journey towards a smarter, more sustainable future in agriculture! We are constantly evolving, integrating new technologies, and listening to the needs of our farming community to deliver solutions that truly make a difference. Together, we can cultivate a more prosperous and sustainable world.';

  ourVisionTitle: string = 'Our Vision';
  ourVisionText: string = 'To be the leading provider of agricultural technology solutions, fostering a global community of empowered and successful farmers.';

  teamMembers :any = [];


  teamids = ["princeraj07m", "rohit-irl", "Shankkz", "smalok", "RaunakKumar-byte"]
  constructor(private http: HttpClient) {
    this.getuserdata();
  } 

getuserdata() {
  this.teamMembers = []; 
  this.teamids.forEach(id => {
    this.http.get(`https://api.github.com/users/${id}`).subscribe((result: any) => {
      this.teamMembers.push(result); 
    });
  });
}
  ngOnInit(): void {
  }

}
