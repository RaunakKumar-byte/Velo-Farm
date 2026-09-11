import { Component, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoaderService } from './services/loader.service';
import { Observable } from 'rxjs';
import { ToastComponent } from './components/toast/toast';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('Dashboard');
  loading$: Observable<boolean>;

  constructor(private readonly router: Router, private readonly loaderService: LoaderService) {
    this.loading$ = this.loaderService.loading$;
  }

  ngOnInit(): void {
    // Show loader on app initialization
    this.loaderService.show();
    
    // Simulate app loading time (you can replace this with actual loading logic)
    setTimeout(() => {
      this.loaderService.hide();
    }, 2000);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      document.body.style.overflow = 'auto';
    });
  }
}
