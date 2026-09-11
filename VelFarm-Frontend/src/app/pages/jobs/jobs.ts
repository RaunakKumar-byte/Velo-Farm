import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
declare var bootstrap: any;

@Component({
  selector: 'app-jobs',
  standalone: false,
  templateUrl: './jobs.html',
  styleUrls: ['./jobs.scss']
})
export class Jobs implements OnInit {
  jobs: any[] = [];
  fields: any[] = []; // for dropdown
  isLoading = false;
  errorMessage = '';
  Math = Math;

  // pagination and filters
  page = 1;
  pageSize = 20;
  total = 0;
  selectedFieldId = '';
  selectedStatus = '';

  form: any = {
    type: '',
    status: 'scheduled',
    scheduledAt: '',
    fieldId: '',
    notes: ''
  };
  isEditing = false;
  currentId: string | null = null;

  modal: any;

  constructor(private api: ApiService, private toast: ToastService, private router: Router) {}

  ngOnInit(): void {
    this.loadJobs();
    this.loadFields();

    // Initialize Bootstrap modal
    const modalEl = document.getElementById('jobModal');
    if (modalEl) this.modal = new bootstrap.Modal(modalEl);
  }

  // Load jobs
loadJobs(): void {
  this.isLoading = true;
  this.errorMessage = '';

  const params: any = { page: String(this.page), pageSize: String(this.pageSize) };
  if (this.selectedFieldId) params.fieldId = this.selectedFieldId;
  if (this.selectedStatus) params.status = this.selectedStatus;

  this.api.getJobs(params).subscribe({
    next: (res: any) => {
      // Map jobs to include fieldName from fields array
      this.jobs = (res.jobs || []).map((job: any) => {
        const field = this.fields.find(f => f._id === job.fieldId);
        return { ...job, fieldName: field ? field.name : 'Select field' };
      });
      this.total = res.total || this.jobs.length;
      this.isLoading = false;
    },
    error: (err) => {
      this.errorMessage = err.message || 'Failed to load jobs';
      this.isLoading = false;
    }
  });
}



  // Load fields for dropdown
  loadFields(): void {
    this.api.getFields().subscribe({
      next: (res: any) => { this.fields = res.fields || []; },
      error: (err) => { console.error('Failed to load fields'); }
    });
  }

  openCreateJob(): void {
    this.isEditing = false;
    this.currentId = null;
    this.form = { type: '', status: 'scheduled', scheduledAt: '', fieldId: '', notes: '' };
    this.modal.show();
  }

  openEditJob(item: any): void {
    this.isEditing = true;
    this.currentId = item._id || item.id || null;
    this.form = {
      type: item.type || '',
      status: item.status || 'scheduled',
      scheduledAt: item.scheduledAt ? new Date(item.scheduledAt).toISOString().substring(0,16) : '',
      fieldId: item.fieldId || '',
      notes: item.notes || ''
    };
    this.modal.show();
  }

  saveJob(): void {
    const payload = { ...this.form };
    if (this.isEditing && this.currentId) {
      this.api.updateJob(this.currentId, payload).subscribe({
        next: () => { this.modal.hide(); this.loadJobs(); },
        error: (err) => { this.toast.show(err.message || 'Update failed', 'error'); }
      });
    } else {
      this.api.createJob(payload).subscribe({
        next: () => { this.modal.hide(); this.loadJobs(); },
        error: (err) => { this.toast.show(err.message || 'Create failed', 'error'); }
      });
    }
  }

  removeJob(item: any): void {
    const id = item._id || item.id;
    if (!id) return;
    if (!confirm('Delete this job?')) return;

    this.api.deleteJob(id).subscribe({
      next: () => this.loadJobs(),
      error: (err) => { this.toast.show(err.message || 'Delete failed', 'error'); }
    });
  }

  cancel(): void {
    this.modal.hide();
    this.isEditing = false;
    this.currentId = null;
    this.form = { type: '', status: 'scheduled', scheduledAt: '', fieldId: '', notes: '' };
  }

  viewJobDetail(job: any): void {
    const jobId = job._id || job.id;
    if (jobId) {
      this.router.navigate(['/job-detail', jobId]);
    }
  }

  // Quick status update from list
  setStatus(item: any, status: string) {
    if (!item?._id) return;
    this.api.updateJobStatus(item._id, status).subscribe({
      next: () => { item.status = status; this.toast.show('Status updated', 'success'); },
      error: (err) => this.toast.show(err.message || 'Failed to update status', 'error')
    });
  }
}
