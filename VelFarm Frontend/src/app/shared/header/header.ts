import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  isMenuOpen = false;
  isLoggedIn: boolean = false;
  isDark = false;

  constructor(private authService: AuthService, private router: Router, private theme: ThemeService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
    this.theme.dark$.subscribe(v => this.isDark = v);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    if (confirm('Are you sure you want to log out?')) {
      this.authService.logout();
    }
  }

  demoLogin(): void {
    this.authService.demoLogin();
  }

  toggleGlobalDark(): void {
    this.theme.toggle();
  }
}
