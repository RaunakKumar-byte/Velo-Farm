import { Component } from '@angular/core';
interface FAQ {
  question: string;
  answer: string;
}
interface Issue {
  title: string;
  steps: string[];
}
@Component({
  selector: 'app-help-support',
  standalone: false,
  templateUrl: './help-support.html',
  styleUrl: './help-support.scss'
})
export class HelpSupport {
 // FAQs
  faqs: FAQ[] = [
    { question: 'How do I reset my bot?', answer: 'Go to System Settings > Quick Actions > Reset Bot to Home.' },
    { question: 'How can I export my farm data?', answer: 'Navigate to Data Management and click "Export All Data".' },
    { question: 'What is the default battery warning level?', answer: 'The default warning level is 20%, but you can change it under Bot Configuration.' },
    { question: 'Can I change the grid size of the farm?', answer: 'Yes, adjust Field Width/Height in Farm Config. Note: it resets all plant data.' }
  ];

  // Common Issues & Fixes
  issues: Issue[] = [
    {
      title: 'Bot Not Moving',
      steps: [
        'Check if battery is above 10%.',
        'Ensure command queue is not empty.',
        'Try pressing "Reset Bot to Home".'
      ]
    },
    {
      title: 'Data Not Exporting',
      steps: [
        'Check if browser allows downloads.',
        'Verify database size under System Info.',
        'Try again after refreshing the page.'
      ]
    }
  ];

  // Contact form fields
  name: string = '';
  email: string = '';
  message: string = '';

  constructor() {}

  // Actions
  emailSupport() {
    window.location.href = 'mailto:support@smartfarm.com?subject=Need Help with Smart Farm';
  }

  openLiveChat() {
    alert('Live chat coming soon! Meanwhile, email support@smartfarm.com.');
  }

  openUserGuide() {
    window.open('assets/docs/user-guide.pdf', '_blank');
  }

  openTutorials() {
    window.open('https://www.youtube.com/@SmartFarmTutorials', '_blank');
  }

  openCommunity() {
    window.open('https://community.smartfarm.com', '_blank');
  }

  submitContactForm() {
    if (this.name && this.email && this.message) {
      alert(`Thanks ${this.name}, your request has been sent! We'll reply at ${this.email}.`);
      this.name = '';
      this.email = '';
      this.message = '';
    } else {
      alert('Please fill in all fields before submitting.');
    }
  }
}
