import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-activities',
  standalone: false,
  templateUrl: './activities.html',
  styleUrls: ['./activities.scss']
})
export class Activities implements OnInit {
  activities: any[] = [];
  isLoading = false;
  errorMessage = '';

  formVisible = false;
  form: any = { type: '', description: '' };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void { this.loadActivities(); }

  loadActivities(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getRecentActivities().subscribe({
      next: (list) => { this.activities = list || []; this.isLoading = false; },
      error: (err) => { this.isLoading = false; this.errorMessage = err.message || 'Failed to load activities'; }
    });
  }

  openCreate(): void { this.formVisible = true; this.form = { type: '', description: '' }; }
  cancel(): void { this.formVisible = false; }

  create(): void {
    const payload = { ...this.form };
    this.api.createActivity(payload).subscribe({
      next: () => { this.formVisible = false; this.loadActivities(); },
      error: (err) => { this.toast.show(err.message || 'Create failed', 'error'); }
    });
  }
}


