import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/services/api.service';
import { SocketService } from '../../services/services/socket.service';
import { BotStatus } from '../../models/bot.models';

@Component({
  selector: 'app-bot',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bot.html',
  styleUrl: './bot.scss'
})
export class Bot implements OnInit, OnDestroy {
  botStatus: BotStatus = {
    x: 0,
    y: 0,
    battery: 100,
    fertilizer_level: 100,
    status: 'idle',
    isMoving: false,
    lastUpdate: new Date().toISOString()
  };
  currentTime = new Date();
  private statusSubscription?: Subscription;
  private timeInterval?: any;

  constructor(
    private apiService: ApiService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.loadInitialStatus();
    this.statusSubscription = this.socketService.onBotStatusUpdate().subscribe(status => {
      this.botStatus = status;
    });
    this.timeInterval = setInterval(() => this.currentTime = new Date(), 1000);
  }

  ngOnDestroy() {
    this.statusSubscription?.unsubscribe();
    clearInterval(this.timeInterval);
  }

  loadInitialStatus() {
    this.apiService.getBotStatus().subscribe(response => {
      if (response.success && response['bot']) {
        this.botStatus = { ...this.botStatus, ...response['bot'] };
      }
    });
  }

  getBatteryColor(level: number): string {
    if (level > 70) return 'bg-success';
    if (level > 30) return 'bg-warning';
    return 'bg-danger';
  }

  getFertilizerColor(level: number): string {
    if (level > 50) return 'bg-success';
    if (level > 20) return 'bg-warning';
    return 'bg-danger';
  }
}
