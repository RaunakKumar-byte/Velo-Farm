import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = !!localStorage.getItem('token'); // or check from AuthService

    if (isLoggedIn) {
      return true; // allow access
    } else {
      this.router.navigate(['auth/login']); // redirect to login
      return false;
    }
  }
}
