import { Component, OnInit } from '@angular/core';
import { ApiService, User, UsersResponse } from '../../services/api.service';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {
  users: User[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.apiService.getAllUsers().subscribe({
      next: (response: UsersResponse) => {
        this.isLoading = false;
        if (response.success && response.users) {
          this.users = response.users;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to load users';
        console.error('Error loading users:', error);
      }
    });
  }

  refreshUsers() {
    this.loadUsers();
  }
}
