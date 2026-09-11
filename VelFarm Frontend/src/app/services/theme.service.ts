import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'khetloom:darkTheme';
  private darkSubject = new BehaviorSubject<boolean>(false);
  dark$ = this.darkSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem(this.storageKey);
    const isDark = saved === '1';
    this.setDark(isDark);
  }

  toggle(): void {
    this.setDark(!this.darkSubject.value);
  }

  setDark(isDark: boolean): void {
    this.darkSubject.next(isDark);
    if (isDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem(this.storageKey, '1');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem(this.storageKey, '0');
    }
  }

  isDark(): boolean {
    return this.darkSubject.value;
  }
}


