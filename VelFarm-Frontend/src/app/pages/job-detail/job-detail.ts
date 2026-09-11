import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-job-detail',
  standalone: false,
  templateUrl: './job-detail.html',
  styleUrls: ['./job-detail.scss']
})
export class JobDetail implements OnInit {
  job: any = null;
  field: any = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadJobDetail();
  }

  loadJobDetail(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const jobId = this.route.snapshot.paramMap.get('id');
    if (!jobId) {
      this.errorMessage = 'Job ID not provided';
      this.isLoading = false;
      return;
    }

    this.api.getJob(jobId).subscribe({
      next: (res: any) => {
        this.job = res.job || res;
        if (this.job.fieldId) {
          this.loadFieldDetails(this.job.fieldId);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load job details';
        this.isLoading = false;
      }
    });
  }

  loadFieldDetails(fieldId: string): void {
    this.api.getField(fieldId).subscribe({
      next: (res: any) => {
        this.field = res.field || res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load field details:', err);
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }

  editJob(): void {
    this.router.navigate(['/jobs'], { queryParams: { edit: this.job._id } });
  }

  deleteJob(): void {
    if (!confirm('Are you sure you want to delete this job?')) return;

    this.api.deleteJob(this.job._id).subscribe({
      next: () => {
        this.toast.show('Job deleted successfully', 'success');
        this.router.navigate(['/jobs']);
      },
      error: (err) => {
        this.toast.show(err.message || 'Failed to delete job', 'error');
      }
    });
  }

  updateStatus(newStatus: string): void {
    const payload = { ...this.job, status: newStatus };
    
    this.api.updateJob(this.job._id, payload).subscribe({
      next: () => {
        this.job.status = newStatus;
        this.toast.show(`Job status updated to ${newStatus}`, 'success');
      },
      error: (err) => {
        this.toast.show(err.message || 'Failed to update job status', 'error');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'in-progress':
        return 'bg-warning';
      case 'scheduled':
        return 'bg-info';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
