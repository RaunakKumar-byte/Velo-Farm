import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-field-detail',
  standalone: false,
  templateUrl: './field-detail.html',
  styleUrls: ['./field-detail.scss']
})
export class FieldDetail implements OnInit {
  field: any = null;
  crops: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadFieldDetail();
  }

  loadFieldDetail(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const fieldId = this.route.snapshot.paramMap.get('id');
    if (!fieldId) {
      this.errorMessage = 'Field ID not provided';
      this.isLoading = false;
      return;
    }

    this.api.getField(fieldId).subscribe({
      next: (res: any) => {
        this.field = res.field || res;
        this.loadCropsForField(fieldId);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load field details';
        this.isLoading = false;
      }
    });
  }

  loadCropsForField(fieldId: string): void {
    this.api.getCrops().subscribe({
      next: (res: any) => {
        this.crops = (res.crops || []).filter((crop: any) => crop.fieldId === fieldId);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load crops for field:', err);
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/fields']);
  }

  editField(): void {
    this.router.navigate(['/fields'], { queryParams: { edit: this.field._id } });
  }

  deleteField(): void {
    if (!confirm('Are you sure you want to delete this field?')) return;

    this.api.deleteField(this.field._id).subscribe({
      next: () => {
        this.toast.show('Field deleted successfully', 'success');
        this.router.navigate(['/fields']);
      },
      error: (err) => {
        this.toast.show(err.message || 'Failed to delete field', 'error');
      }
    });
  }

  viewCrop(cropId: string): void {
    this.router.navigate(['/crop-detail', cropId]);
  }
}
