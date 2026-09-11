import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-health',
  standalone: false,
  templateUrl: './health.html',
  styleUrl: './health.scss'
})
export class Health implements OnInit {
  isLoading = false;
  errorMessage = '';
  health: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadHealth();
  }

  loadHealth(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getHealth().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.health = res;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Failed to load health status';
      }
    });
  }
}
