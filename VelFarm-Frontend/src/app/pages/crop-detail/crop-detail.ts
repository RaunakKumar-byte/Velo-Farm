import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-crop-detail',
  standalone: false,
  templateUrl: './crop-detail.html',
  styleUrls: ['./crop-detail.scss']
})
export class CropDetail implements OnInit {
  crop: any = null;
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
    this.loadCropDetail();
  }

  loadCropDetail(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const cropId = this.route.snapshot.paramMap.get('id');
    if (!cropId) {
      this.errorMessage = 'Crop ID not provided';
      this.isLoading = false;
      return;
    }

    this.api.getCrop(cropId).subscribe({
      next: (res: any) => {
        this.crop = res.crop || res;
        if (this.crop.fieldId) {
          this.loadFieldDetails(this.crop.fieldId);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load crop details';
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
    this.router.navigate(['/crops']);
  }

  editCrop(): void {
    this.router.navigate(['/crops'], { queryParams: { edit: this.crop._id } });
  }

  deleteCrop(): void {
    if (!confirm('Are you sure you want to delete this crop?')) return;

    this.api.deleteCrop(this.crop._id).subscribe({
      next: () => {
        this.toast.show('Crop deleted successfully', 'success');
        this.router.navigate(['/crops']);
      },
      error: (err) => {
        this.toast.show(err.message || 'Failed to delete crop', 'error');
      }
    });
  }

  updateCropStatus(newStatus: string): void {
    if (!this.crop?._id) return;
    const payload = { ...this.crop, status: newStatus };
    this.api.updateCrop(this.crop._id, payload).subscribe({
      next: () => {
        this.crop.status = newStatus;
        this.toast.show(`Crop status updated to ${newStatus}`, 'success');
      },
      error: (err) => {
        this.toast.show(err.message || 'Failed to update crop status', 'error');
      }
    });
  }
}
