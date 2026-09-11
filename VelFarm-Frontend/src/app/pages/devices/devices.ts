import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-devices',
  standalone: false,
  templateUrl: './devices.html',
  styleUrls: ['./devices.scss']
})
export class Devices implements OnInit {
  devices: any[] = [];
  isLoading = false;
  errorMessage = '';

  // Simple form model
  formVisible = false;
  isEditing = false;
  currentId: string | null = null;
  form: any = {
    name: '',
    type: '',
    location: '',
    status: 'active'
  };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getDevices().subscribe({
      next: (list) => { this.devices = list || []; this.isLoading = false; },
      error: (err) => { this.isLoading = false; this.errorMessage = err.message || 'Failed to load devices'; }
    });
  }

  openCreate(): void {
    this.formVisible = true;
    this.isEditing = false;
    this.currentId = null;
    this.form = { name: '', type: '', location: '', status: 'active' };
  }

  openEdit(item: any): void {
    this.formVisible = true;
    this.isEditing = true;
    this.currentId = item._id || item.id;
    this.form = {
      name: item.name || '',
      type: item.type || '',
      location: item.location || '',
      status: item.status || 'active'
    };
  }

  cancel(): void {
    this.formVisible = false;
    this.isEditing = false;
    this.currentId = null;
  }

  save(): void {
    const payload = { ...this.form };
    if (this.isEditing && this.currentId) {
      this.api.updateDevice(this.currentId, payload).subscribe({
        next: () => { this.formVisible = false; this.loadDevices(); },
        error: (err) => { this.toast.show(err.message || 'Update failed', 'error'); }
      });
    } else {
      this.api.createDevice(payload).subscribe({
        next: () => { this.formVisible = false; this.loadDevices(); },
        error: (err) => { this.toast.show(err.message || 'Create failed', 'error'); }
      });
    }
  }

  remove(item: any): void {
    const id = item._id || item.id;
    if (!id) return;
    if (!confirm('Delete this device?')) return;
    this.api.deleteDevice(id).subscribe({
      next: () => this.loadDevices(),
      error: (err) => { this.toast.show(err.message || 'Delete failed', 'error'); }
    });
  }
}


