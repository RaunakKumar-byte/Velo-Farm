import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private readonly url = environment.backendUrl;

  constructor() {
    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
  }

  // Listen for bot status updates
  onBotStatusUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('bot_status_update', (data) => {
        observer.next(data);
      });
    });
  }

  // Listen for plant updates
  onPlantsUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('plants_update', (data) => {
        observer.next(data);
      });
    });
  }

  // Listen for new alerts
  onNewAlert(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('new_alert', (data) => {
        observer.next(data);
      });
    });
  }

  // Listen for task execution updates
  onTaskUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('task_update', (data) => {
        observer.next(data);
      });
    });
  }

  // Emit events
  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}