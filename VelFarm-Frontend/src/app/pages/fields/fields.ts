import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
declare var bootstrap: any;

@Component({
  selector: 'app-fields',
  standalone: false,
  templateUrl: './fields.html',
  styleUrls: ['./fields.scss']
})
export class Fields implements OnInit {
  fields: any[] = [];
  isLoading = false;
  errorMessage = '';

  form: any = {
    name: '',
    crop: '',
    location: '',
    area: null,
    notes: ''
  };
  isEditing = false;
  currentId: string | null = null;

  modal: any; // Bootstrap modal instance

  constructor(private api: ApiService, private toast: ToastService, private router: Router) {}

  ngOnInit(): void {
    this.loadFields();

    // Initialize Bootstrap modal
    const modalEl = document.getElementById('fieldModal');
    if (modalEl) this.modal = new bootstrap.Modal(modalEl);
  }

  loadFields(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getFields().subscribe({
      next: (res: any) => {
        this.fields = res.fields || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load fields';
        this.isLoading = false;
      }
    });
  }

  openCreateField(): void {
    this.isEditing = false;
    this.currentId = null;
    this.form = { name: '', crop: '', location: '', area: null, notes: '' };
    this.modal.show();
  }

  openEditField(item: any): void {
    this.isEditing = true;
    this.currentId = item._id || item.id || null;
    this.form = {
      name: item.name || '',
      crop: item.crop || '',
      location: item.location || '',
      area: item.area || null,
      notes: item.notes || ''
    };
    this.modal.show();
  }

  saveField(): void {
    const payload = { ...this.form };
    if (this.isEditing && this.currentId) {
      this.api.updateField(this.currentId, payload).subscribe({
        next: () => {
          this.modal.hide();
          this.loadFields();
        },
        error: (err) => { this.toast.show(err.message || 'Update failed', 'error'); }
      });
    } else {
      this.api.createField(payload).subscribe({
        next: () => {
          this.modal.hide();
          this.loadFields();
        },
        error: (err) => { this.toast.show(err.message || 'Create failed', 'error'); }
      });
    }
  }

  removeField(item: any): void {
    const id = item._id || item.id;
    if (!id) return;
    if (!confirm('Delete this field?')) return;

    this.api.deleteField(id).subscribe({
      next: () => this.loadFields(),
      error: (err) => { this.toast.show(err.message || 'Delete failed', 'error'); }
    });
  }

  cancel(): void {
    this.modal.hide();
    this.isEditing = false;
    this.currentId = null;
    this.form = { name: '', crop: '', location: '', area: null, notes: '' };
  }

  viewFieldDetail(field: any): void {
    const fieldId = field._id || field.id;
    if (fieldId) {
      this.router.navigate(['/field-detail', fieldId]);
    }
  }
}
