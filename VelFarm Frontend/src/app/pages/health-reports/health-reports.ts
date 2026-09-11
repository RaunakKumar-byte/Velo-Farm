import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-health-reports',
  standalone: false,
  templateUrl: './health-reports.html',
  styleUrls: ['./health-reports.scss']
})
export class HealthReports implements OnInit {
  reports: any[] = [];
  isLoading = false;
  errorMessage = '';

  formVisible = false;
  form: any = {
    title: '',
    details: ''
  };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void { this.loadReports(); }

  loadReports(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getHealthReports().subscribe({
      next: (list) => { this.reports = list || []; this.isLoading = false; },
      error: (err) => { this.isLoading = false; this.errorMessage = err.message || 'Failed to load reports'; }
    });
  }

  openCreate(): void { this.formVisible = true; this.form = { title: '', details: '' }; }
  cancel(): void { this.formVisible = false; }

  create(): void {
    const payload = { ...this.form };
    this.api.createHealthReport(payload).subscribe({
      next: () => { this.formVisible = false; this.loadReports(); },
      error: (err) => { this.toast.show(err.message || 'Create failed', 'error'); }
    });
  }
}


