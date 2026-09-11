import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotService, Analytic, Plant, LogEntry } from '../../services/bot.services';
import { BotStatus } from '../../services/bot.services';
@Component({
  selector: 'app-bot-control',
  standalone: false,
  templateUrl: './bot-control.html',
  styleUrl: './bot-control.scss'
})
export class BotControl implements OnInit{
 botStatus: BotStatus = { 
   x: 0, 
   y: 0, 
   battery: 100, 
   fertilizer_level: 100, 
   status: 'idle',
   isMoving: false,
   lastUpdate: new Date().toISOString()
 };
  commands: any[] = [];
  targetX: number = 0;
  targetY: number = 0;
  gridPositions: any[] = [];
  isCommandPending: boolean = false;
  statusMessage: string = '';

  constructor(private farmingApi: BotService) {
    // Initialize grid positions
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        this.gridPositions.push({ x, y });
      }
    }
  }

  ngOnInit() {
    // Subscribe to real-time data
    this.farmingApi.botStatus$.subscribe(status => {
      this.botStatus = status;
      // Update target position to current position initially
      if (this.targetX === 0 && this.targetY === 0) {
        this.targetX = status.x;
        this.targetY = status.y;
      }
    });

    // Load commands periodically
    this.loadCommands();
    // setInterval(() => this.loadCommands(), 3000);
  }

  loadCommands() {
    this.farmingApi.getCommands().subscribe(
      commands => this.commands = commands,
      error => console.error('Failed to load commands:', error)
    );
  }

  // Movement Methods
  selectPosition(x: number, y: number) {
    if (!this.isCommandPending) {
      this.targetX = x;
      this.targetY = y;
    }
  }

  moveBot() {
    if (!this.isValidPosition(this.targetX, this.targetY) || this.isCurrentPosition()) {
      return;
    }

    this.isCommandPending = true;
    this.statusMessage = `Sending move command to (${this.targetX}, ${this.targetY})...`;

    this.farmingApi.moveBot(this.targetX, this.targetY).subscribe(
      response => {
        this.statusMessage = response.message;
        this.loadCommands();
        setTimeout(() => {
          this.statusMessage = '';
          this.isCommandPending = false;
        }, 2000);
      },
      error => {
        this.statusMessage = 'Failed to send move command: ' + error.error?.error;
        this.isCommandPending = false;
        setTimeout(() => this.statusMessage = '', 3000);
      }
    );
  }

  // Quick Actions
  quickDropFertilizer() {
    if (this.botStatus.fertilizer_level <= 0) {
      this.statusMessage = 'No fertilizer available!';
      setTimeout(() => this.statusMessage = '', 3000);
      return;
    }

    this.isCommandPending = true;
    this.statusMessage = 'Dropping fertilizer at current position...';

    this.farmingApi.dropFertilizer().subscribe(
      response => {
        this.statusMessage = response.message;
        this.loadCommands();
        setTimeout(() => {
          this.statusMessage = '';
          this.isCommandPending = false;
        }, 2000);
      },
      error => {
        this.statusMessage = 'Failed to drop fertilizer: ' + error.error?.error;
        this.isCommandPending = false;
        setTimeout(() => this.statusMessage = '', 3000);
      }
    );
  }

  emergencyStop() {
    this.farmingApi.emergencyStop().subscribe(
      response => {
        this.statusMessage = 'Emergency stop executed! All pending commands cancelled.';
        this.loadCommands();
        setTimeout(() => this.statusMessage = '', 3000);
      },
      error => {
        this.statusMessage = 'Failed to execute emergency stop: ' + error.error?.error;
        setTimeout(() => this.statusMessage = '', 3000);
      }
    );
  }

  refillResources() {
    this.isCommandPending = true;
    this.statusMessage = 'Refilling bot resources...';

    this.farmingApi.refillResources(true, true).subscribe(
      response => {
        this.statusMessage = 'Resources refilled successfully!';
        setTimeout(() => {
          this.statusMessage = '';
          this.isCommandPending = false;
        }, 2000);
      },
      error => {
        this.statusMessage = 'Failed to refill resources: ' + error.error?.error;
        this.isCommandPending = false;
        setTimeout(() => this.statusMessage = '', 3000);
      }
    );
  }

  returnToHome() {
    this.targetX = 0;
    this.targetY = 0;
    this.moveBot();
  }

  clearQueue() {
    this.emergencyStop();
  }

  // Utility Methods
  isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x <= 4 && y >= 0 && y <= 4;
  }

  isCurrentPosition(): boolean {
    return this.targetX === this.botStatus.x && this.targetY === this.botStatus.y;
  }

  isBotPosition(x: number, y: number): boolean {
    return this.botStatus.x === x && this.botStatus.y === y;
  }

  isTargetPosition(x: number, y: number): boolean {
    return this.targetX === x && this.targetY === y && !this.isBotPosition(x, y);
  }

  getDistance(): number {
    return Math.abs(this.targetX - this.botStatus.x) + Math.abs(this.targetY - this.botStatus.y);
  }

  getEstimatedTime(): number {
    return this.getDistance() * 1; // 1 second per grid cell
  }

  getGridCellClass(x: number, y: number): string {
    let classes = ['grid-cell'];

    if (this.isBotPosition(x, y)) {
      classes.push('current-position');
    } else if (this.isTargetPosition(x, y)) {
      classes.push('target-position');
    }

    return classes.join(' ');
  }

  getBatteryIcon(battery: number): string {
    return this.farmingApi.getBatteryIcon(battery);
  }

  getBatteryColor(battery: number): string {
    if (battery > 60) return 'text-success';
    if (battery > 30) return 'text-warning';
    return 'text-danger';
  }

  getCommandIcon(type: string): string {
    switch (type) {
      case 'move': return 'bi bi-arrow-right text-primary';
      case 'drop': return 'bi bi-droplet-fill text-success';
      default: return 'bi bi-gear text-secondary';
    }
  }

  getCommandStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'processing': return 'bg-primary';
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString();
  }
}
