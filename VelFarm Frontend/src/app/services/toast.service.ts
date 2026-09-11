import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    const toast: Toast = { 
      message, 
      type, 
      id: Math.random().toString(36).substr(2, 9) 
    };
    this.toastSubject.next(toast);
  }

  hide() {
    this.toastSubject.next(null);
  }
}