import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
declare var bootstrap: any;

@Component({
  selector: 'app-crops',
  standalone: false,
  templateUrl: './crops.html',
  styleUrls: ['./crops.scss']
})
export class Crops implements OnInit {
  crops: any[] = [];
  fields: any[] = [];
  isLoading = false;
  errorMessage = '';

  // pagination and filters
  page = 1;
  pageSize = 20;
  total = 0;
  selectedFieldId = '';

  form: any = {
    name: '',
    season: '',
    area: null,
    expectedYield: null,
    field: ''
  };
  isEditing = false;
  currentId: string | null = null;

  modal: any; // Bootstrap modal instance

  constructor(private api: ApiService, private toast: ToastService, private router: Router) {}

  ngOnInit(): void {
    this.loadFieldsAndCrops();

    // Initialize Bootstrap modal
    const modalEl = document.getElementById('cropModal');
    if (modalEl) this.modal = new bootstrap.Modal(modalEl);
  }

  // Load fields first, then crops with filters/pagination
  loadFieldsAndCrops(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.getFields().subscribe({
      next: (res: any) => {
        this.fields = res.fields || [];

        // Now load crops
        const params: any = { page: String(this.page), pageSize: String(this.pageSize) };
        if (this.selectedFieldId) params.fieldId = this.selectedFieldId;
        this.api.getCrops(params).subscribe({
          next: (res: any) => {
            this.crops = (res.crops || []).map((crop: any) => {
              const field = this.fields.find(f => f._id === crop.fieldId);
              return { ...crop, fieldName: field ? field.name : 'Select field' };
            });
            this.total = res.total || this.crops.length;
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = err.message || 'Failed to load crops';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load fields';
        this.isLoading = false;
      }
    });
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page -= 1;
      this.loadFieldsAndCrops();
    }
  }

  nextPage(): void {
    this.page += 1;
    this.loadFieldsAndCrops();
  }

  openCreate(): void {
    this.currentId = null;
    this.form = { name: '', season: '', area: null, expectedYield: null, field: '' };
    this.isEditing = false;
    this.modal.show();
  }

  openEdit(item: any): void {
    this.currentId = item._id || item.id || null;
    this.form = {
      name: item.name || '',
      season: item.season || '',
      area: item.area || null,
      expectedYield: item.expectedYield || null,
      field: item.fieldId || ''
    };
    this.isEditing = true;
    this.modal.show();
  }

  save(): void {
    const payload = {
      name: this.form.name,
      season: this.form.season,
      area: this.form.area,
      expectedYield: this.form.expectedYield,
      fieldId: this.form.field
    };

    if (this.isEditing && this.currentId) {
      this.api.updateCrop(this.currentId, payload).subscribe({
        next: () => {
          this.modal.hide();
          this.loadFieldsAndCrops(); // reload crops with mapped field names
        },
        error: (err) => { this.toast.show(err.message || 'Update failed', 'error'); }
      });
    } else {
      this.api.createCrop(payload).subscribe({
        next: () => {
          this.modal.hide();
          this.loadFieldsAndCrops(); // reload crops with mapped field names
        },
        error: (err) => { this.toast.show(err.message || 'Create failed', 'error'); }
      });
    }
  }

  remove(item: any): void {
    const id = item._id || item.id;
    if (!id) return;
    if (!confirm('Delete this crop?')) return;

    this.api.deleteCrop(id).subscribe({
      next: () => this.loadFieldsAndCrops(),
      error: (err) => { this.toast.show(err.message || 'Delete failed', 'error'); }
    });
  }

  cancel(): void {
    this.modal.hide();
    this.isEditing = false;
    this.currentId = null;
    this.form = { name: '', season: '', area: null, expectedYield: null, field: '' };
  }

  viewCropDetail(crop: any): void {
    const cropId = crop._id || crop.id;
    if (cropId) {
      this.router.navigate(['/crop-detail', cropId]);
    }
  }
}
