import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { ApiService } from '../../services/services/api.service';
import { SocketService } from '../../services/services/socket.service';
import { Waypoint, SavedPath, Position } from '../../models/bot.models';
@Component({
  selector: 'app-path-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-route text-primary me-2"></i>
                Path Planning Grid
              </h5>
            </div>
            <div class="card-body">
              <!-- Live Execution Status -->
              <div *ngIf="isExecuting || executionMessage" class="execution-banner mb-3"
                   [class.executing]="isExecuting"
                   [class.completed]="executionComplete">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <strong>
                      <i class="fas fa-robot me-2"></i>
                      {{ executionMessage || 'Ready to execute' }}
                    </strong>
                    <div *ngIf="isExecuting" class="small text-muted mt-1">
                      Bot at ({{ botStatus.x }}, {{ botStatus.y }})
                      <span *ngIf="botAction !== 'idle'"> · {{ botAction | titlecase }}</span>
                    </div>
                  </div>
                  <span *ngIf="isExecuting" class="badge bg-warning text-dark">
                    <i class="fas fa-spinner fa-spin me-1"></i> Live
                  </span>
                  <span *ngIf="executionComplete" class="badge bg-success">
                    <i class="fas fa-check me-1"></i> Done
                  </span>
                </div>
                <div *ngIf="isExecuting && waypoints.length > 0" class="progress mt-2" style="height: 6px;">
                  <div class="progress-bar progress-bar-striped progress-bar-animated bg-success"
                       [style.width.%]="executionProgress"></div>
                </div>
              </div>

              <!-- Grid Controls -->
              <div class="row mb-4">
                <div class="col-md-4">
                  <label class="form-label">Action for Next Waypoint</label>
                  <select class="form-select" [(ngModel)]="selectedAction">
                    <option value="move">Move Only</option>
                    <option value="water">Water Plant</option>
                    <option value="fertilize">Fertilize Plant</option>
                    <option value="wait">Wait/Pause</option>
                    <option value="scan">Scan Area</option>
                  </select>
                </div>
                <div class="col-md-4" *ngIf="selectedAction === 'wait'">
                  <label class="form-label">Wait Duration (seconds)</label>
                  <input type="number" class="form-control" [(ngModel)]="waitDuration" min="1" max="300">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Path Name</label>
                  <input type="text" class="form-control" [(ngModel)]="pathName" placeholder="Enter path name">
                </div>
              </div>

              <!-- Interactive Grid -->
              <div class="path-grid-container">
                <div class="path-grid">
                  <div *ngFor="let row of grid; let y = index" class="grid-row">
                    <div *ngFor="let cell of row; let x = index"
                         class="grid-cell"
                         [class.bot-position]="isBotPosition(x, y)"
                         [class.bot-moving]="isBotPosition(x, y) && botAction === 'moving'"
                         [class.bot-action-cell]="isBotPosition(x, y) && isPerformingAction()"
                         [class.has-plant]="hasPlant(x, y)"
                         [class.waypoint]="isWaypoint(x, y)"
                         [class.waypoint-active]="isActiveWaypoint(x, y)"
                         [class.waypoint-done]="isCompletedWaypoint(x, y)"
                         [class.selected]="selectedCell?.x === x && selectedCell?.y === y"
                         (click)="selectCell(x, y)">

                      <!-- Bot Icon -->
                      <div *ngIf="isBotPosition(x, y)" class="position-icon bot">
                        <i class="fas fa-robot text-warning"
                           [class.bot-animate]="botAction === 'moving'"></i>
                        <span *ngIf="isPerformingAction()" class="action-badge"
                              [class.water]="botAction === 'watering'"
                              [class.fertilize]="botAction === 'fertilizing'"
                              [class.scan]="botAction === 'scanning'">
                          <i class="fas"
                             [class.fa-tint]="botAction === 'watering'"
                             [class.fa-leaf]="botAction === 'fertilizing'"
                             [class.fa-search]="botAction === 'scanning'"></i>
                        </span>
                      </div>

                      <!-- Plant Icon -->
                      <div *ngIf="hasPlant(x, y)" class="position-icon plant">
                        <i class="fas fa-seedling text-success"></i>
                      </div>

                      <!-- Waypoint Icon -->
                      <div *ngIf="isWaypoint(x, y)" class="position-icon waypoint">
                        <div class="waypoint-number">{{ getWaypointOrder(x, y) }}</div>
                        <i class="fas fa-map-marker-alt text-primary"></i>
                      </div>

                      <!-- Coordinates -->
                      <div class="coordinates">{{ x }},{{ y }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Path Actions -->
              <div class="row mt-4">
                <div class="col-md-6">
                  <button class="btn btn-success me-2"
                          (click)="executePath()"
                          [disabled]="waypoints.length === 0 || isExecuting">
                    <i class="fas fa-play me-2"></i>
                    {{ isExecuting ? 'Executing...' : 'Execute Path' }}
                  </button>
                  <button class="btn btn-warning me-2" (click)="clearPath()">
                    <i class="fas fa-trash me-2"></i>Clear Path
                  </button>
                  <button class="btn btn-info" (click)="savePath()" [disabled]="waypoints.length === 0">
                    <i class="fas fa-save me-2"></i>Save Path
                  </button>
                </div>
                <div class="col-md-6 text-end">
                  <span class="badge bg-primary me-2">{{ waypoints.length }} Waypoints</span>
                  <span class="badge bg-info">Estimated Time: {{ estimatedTime }}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Waypoint List Sidebar -->
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="fas fa-list text-success me-2"></i>
                Waypoint Sequence
              </h6>
            </div>
            <div class="card-body">
              <div *ngIf="waypoints.length === 0" class="text-center text-muted py-4">
                <i class="fas fa-map-marked-alt fa-3x mb-3"></i>
                <h6>No Waypoints</h6>
                <p class="mb-0">Click on grid cells to add waypoints</p>
              </div>

              <div *ngFor="let waypoint of waypoints; let i = index"
                   class="waypoint-item mb-3 p-3 border rounded"
                   [class.active]="selectedWaypoint === waypoint"
                   [class.executing]="activeWaypointIndex === i && isExecuting"
                   [class.completed]="isWaypointCompleted(waypoint)">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-2">
                      <span class="badge bg-primary me-2">{{ waypoint.order }}</span>
                      <strong>Position ({{ waypoint.x }}, {{ waypoint.y }})</strong>
                    </div>

                    <div class="mb-2">
                      <span class="badge"
                            [class.bg-secondary]="waypoint.action === 'move'"
                            [class.bg-info]="waypoint.action === 'water'"
                            [class.bg-success]="waypoint.action === 'fertilize'"
                            [class.bg-warning]="waypoint.action === 'wait'"
                            [class.bg-dark]="waypoint.action === 'scan'">
                        <i class="fas"
                           [class.fa-arrows-alt]="waypoint.action === 'move'"
                           [class.fa-tint]="waypoint.action === 'water'"
                           [class.fa-leaf]="waypoint.action === 'fertilize'"
                           [class.fa-clock]="waypoint.action === 'wait'"
                           [class.fa-search]="waypoint.action === 'scan'"></i>
                        {{ waypoint.action | titlecase }}
                      </span>
                      <span *ngIf="waypoint.duration" class="badge bg-light text-dark ms-1">
                        {{ waypoint.duration }}s
                      </span>
                    </div>

                    <div *ngIf="waypoint.notes" class="text-muted small">
                      {{ waypoint.notes }}
                    </div>
                  </div>

                  <div class="btn-group-vertical btn-group-sm">
                    <button class="btn btn-outline-primary btn-sm"
                            (click)="moveWaypointUp(i)"
                            [disabled]="i === 0">
                      <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-sm"
                            (click)="moveWaypointDown(i)"
                            [disabled]="i === waypoints.length - 1">
                      <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" (click)="removeWaypoint(i)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Saved Paths -->
          <div class="card mt-4">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="fas fa-folder text-warning me-2"></i>
                Saved Paths
              </h6>
            </div>
            <div class="card-body">
              <div *ngIf="savedPaths.length === 0" class="text-center text-muted py-3">
                <i class="fas fa-folder-open fa-2x mb-2"></i>
                <p class="mb-0">No saved paths</p>
              </div>

              <div *ngFor="let path of savedPaths" class="saved-path-item mb-2 p-2 border rounded">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ path.name }}</strong>
                    <br>
                    <small class="text-muted">{{ path.waypoints.length || 0 }} waypoints</small>
                  </div>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" (click)="loadPath(path)">
                      <i class="fas fa-upload"></i>
                    </button>
                    <button class="btn btn-outline-danger" (click)="deleteSavedPath(path._id!)" [disabled]="!path._id">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .path-grid-container {
      display: flex;
      justify-content: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .path-grid {
      display: inline-block;
      border: 3px solid #28a745;
      border-radius: 10px;
      background: white;
      padding: 10px;
    }

    .grid-row {
      display: flex;
    }

    .grid-cell {
      width: 80px;
      height: 80px;
      border: 2px solid #dee2e6;
      margin: 2px;
      border-radius: 8px;
      background: #f8f9fa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .grid-cell:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10;
    }

    .grid-cell.selected {
      border-color: #007bff;
      background: #e3f2fd;
      box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
    }

    .execution-banner {
      padding: 12px 16px;
      border-radius: 8px;
      background: #e8f5e9;
      border: 1px solid #c8e6c9;
    }

    .execution-banner.executing {
      background: #fff8e1;
      border-color: #ffecb3;
    }

    .execution-banner.completed {
      background: #e8f5e9;
      border-color: #a5d6a7;
    }

    .grid-cell.bot-position {
      background: linear-gradient(45deg, #fff3cd, #ffffff);
      border-color: #ffc107;
      animation: pulse 2s infinite;
    }

    .grid-cell.bot-moving {
      background: linear-gradient(45deg, #ffe082, #fff8e1);
      border-color: #ff9800;
      z-index: 5;
    }

    .grid-cell.bot-action-cell {
      animation: actionPulse 1s infinite;
    }

    .grid-cell.waypoint-active {
      box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.5);
      border-color: #ff9800;
    }

    .grid-cell.waypoint-done {
      opacity: 0.75;
      border-color: #28a745;
    }

    .bot-animate {
      animation: botMove 0.7s ease-in-out infinite;
    }

    .action-badge {
      position: absolute;
      top: -10px;
      left: -10px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: white;
    }

    .action-badge.water { background: #17a2b8; }
    .action-badge.fertilize { background: #28a745; }
    .action-badge.scan { background: #343a40; }

    @keyframes botMove {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    @keyframes actionPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(23, 162, 184, 0.4); }
      50% { box-shadow: 0 0 0 8px rgba(23, 162, 184, 0); }
    }

    .waypoint-item.executing {
      background: #fff8e1;
      border-color: #ff9800 !important;
    }

    .waypoint-item.completed {
      background: #e8f5e9;
      border-color: #28a745 !important;
      opacity: 0.85;
    }

    .grid-cell.has-plant {
      background: linear-gradient(45deg, #d4edda, #ffffff);
    }

    .grid-cell.waypoint {
      background: linear-gradient(45deg, #cce5ff, #ffffff);
      border-color: #007bff;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
    }

    .position-icon {
      font-size: 1.8rem;
      margin-bottom: 5px;
    }

    .waypoint-number {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }

    .coordinates {
      position: absolute;
      bottom: 2px;
      right: 4px;
      font-size: 10px;
      color: #6c757d;
      font-weight: bold;
    }

    .waypoint-item {
      transition: all 0.2s ease;
    }

    .waypoint-item:hover {
      background: #f8f9fa;
    }

    .waypoint-item.active {
      background: #e3f2fd;
      border-color: #007bff;
    }

    .saved-path-item {
      transition: all 0.2s ease;
    }

    .saved-path-item:hover {
      background: #f8f9fa;
    }

    @media (max-width: 768px) {
      .grid-cell {
        width: 60px;
        height: 60px;
      }

      .position-icon {
        font-size: 1.4rem;
      }
    }
  `]
})
export class PathPlanningComponent implements OnInit, OnDestroy {
  grid: any[][] = [];
  waypoints: Waypoint[] = [];
  selectedCell: { x: number, y: number } | null = null;
  selectedWaypoint: Waypoint | null = null;
  selectedAction: 'move' | 'water' | 'fertilize' | 'wait' | 'scan' = 'move';
  waitDuration: number = 5;
  pathName = '';

  botStatus: Position = { x: 0, y: 0 };
  botAction: string = 'idle';
  plants: any[] = [];
  savedPaths: SavedPath[] = [];

  isExecuting = false;
  executionComplete = false;
  executionMessage = '';
  executionProgress = 0;
  activeWaypointIndex = -1;
  completedWaypointOrders = new Set<number>();
  estimatedTime = 0;

  private subscriptions = new Subscription();
  private statusPollSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.initializeGrid();
    this.loadBotStatus();
    this.loadPlants();
    this.loadSavedPaths();
    this.subscribeToUpdates();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.stopStatusPolling();
  }

  initializeGrid() {
    this.grid = Array(5).fill(null).map(() => Array(5).fill(null));
  }

  loadBotStatus() {
    this.apiService.getBotStatus().subscribe(response => {
      if (response.success) {
        // Assuming response.bot has x and y properties
        this.botStatus.x = response['bot'].x;
        this.botStatus.y = response['bot'].y;
      }
    });
  }

  loadPlants() {
    this.apiService.getPlants().subscribe(response => {
      if (response.success) {
        this.plants = response['plants'];
      }
    });
  }

  loadSavedPaths() {
    this.apiService.getSavedPaths().subscribe({
      next: (response) => {
        if (response.success) {
          this.savedPaths = response['paths'];
        }
      },
      error: () => this.loadPathsFromLocalStorage() // Fallback to localStorage
    });
  }

  subscribeToUpdates() {
    this.subscriptions.add(
      this.socketService.onBotStatusUpdate().subscribe(status => {
        this.handleBotStatusUpdate(status);
      })
    );

    this.subscriptions.add(
      this.socketService.onPlantsUpdate().subscribe(plants => {
        this.plants = plants;
      })
    );

    this.subscriptions.add(
      this.socketService.onPathExecutionComplete().subscribe(() => {
        this.finishExecution(true);
      })
    );
  }

  handleBotStatusUpdate(status: any) {
    if (status?.x !== undefined) this.botStatus.x = status.x;
    if (status?.y !== undefined) this.botStatus.y = status.y;
    this.botAction = status?.status || (status?.isMoving ? 'moving' : 'idle');

    if (this.isExecuting) {
      this.updateExecutionUI();
    }
  }

  startStatusPolling() {
    this.stopStatusPolling();
    this.statusPollSubscription = interval(1000).subscribe(() => {
      this.apiService.getBotStatus().subscribe(response => {
        if (response.success && response['bot']) {
          this.handleBotStatusUpdate(response['bot']);
        }
      });
    });
  }

  stopStatusPolling() {
    this.statusPollSubscription?.unsubscribe();
    this.statusPollSubscription = undefined;
  }

  updateExecutionUI() {
    const actionLabels: Record<string, string> = {
      moving: 'Moving',
      watering: 'Watering plant',
      fertilizing: 'Fertilizing plant',
      scanning: 'Scanning area',
      idle: 'At waypoint',
      error: 'Error occurred'
    };

    const label = actionLabels[this.botAction] || 'Working';
    this.executionMessage = `${label} at (${this.botStatus.x}, ${this.botStatus.y})...`;

    const currentIndex = this.waypoints.findIndex(
      wp => wp.x === this.botStatus.x && wp.y === this.botStatus.y
    );

    if (currentIndex >= 0) {
      this.activeWaypointIndex = currentIndex;
      for (let i = 0; i < currentIndex; i++) {
        this.completedWaypointOrders.add(this.waypoints[i].order);
      }
    }

    if (this.botAction === 'idle' && currentIndex >= 0) {
      this.completedWaypointOrders.add(this.waypoints[currentIndex].order);
    }

    this.executionProgress = this.waypoints.length
      ? (this.completedWaypointOrders.size / this.waypoints.length) * 100
      : 0;
  }

  finishExecution(success: boolean) {
    this.isExecuting = false;
    this.executionComplete = success;
    this.stopStatusPolling();
    this.activeWaypointIndex = -1;
    this.waypoints.forEach(wp => this.completedWaypointOrders.add(wp.order));
    this.executionProgress = 100;
    this.executionMessage = success
      ? 'Path execution completed successfully!'
      : 'Path execution failed.';
    this.botAction = 'idle';

    if (success) {
      setTimeout(() => {
        this.executionComplete = false;
        this.executionMessage = '';
        this.completedWaypointOrders.clear();
        this.executionProgress = 0;
      }, 4000);
    }
  }

  selectCell(x: number, y: number) {
    if (this.isExecuting) return;

    this.selectedCell = { x, y };

    if (!this.isWaypoint(x, y)) {
      this.addWaypoint(x, y);
    }
  }

  addWaypoint(x: number, y: number) {
    const waypoint: Waypoint = {
      x,
      y,
      action: this.selectedAction,
      order: this.waypoints.length + 1,
      duration: this.selectedAction === 'wait' ? this.waitDuration : undefined,
      notes: undefined
    };

    this.waypoints.push(waypoint);
    this.calculateEstimatedTime();
  }

  removeWaypoint(index: number) {
    if (this.isExecuting) return;
    this.waypoints.splice(index, 1);
    this.reorderWaypoints();
    this.calculateEstimatedTime();
  }

  moveWaypointUp(index: number) {
    if (index > 0) {
      [this.waypoints[index], this.waypoints[index - 1]] =
      [this.waypoints[index - 1], this.waypoints[index]];
      this.reorderWaypoints();
    }
  }

  moveWaypointDown(index: number) {
    if (index < this.waypoints.length - 1) {
      [this.waypoints[index], this.waypoints[index + 1]] =
      [this.waypoints[index + 1], this.waypoints[index]];
      this.reorderWaypoints();
    }
  }

  reorderWaypoints() {
    this.waypoints.forEach((waypoint, index) => {
      waypoint.order = index + 1;
    });
  }

  calculateEstimatedTime() {
    let time = 0;
    let currentX = this.botStatus.x;
    let currentY = this.botStatus.y;

    for (const waypoint of this.waypoints) {
      // Movement time (assuming 1 second per grid cell)
      const distance = Math.abs(waypoint.x - currentX) + Math.abs(waypoint.y - currentY);
      time += distance * 2; // 2 seconds per move

      // Action time
      switch (waypoint.action) {
        case 'water':
        case 'fertilize':
          time += 5;
          break;
        case 'wait':
          time += waypoint.duration || 0;
          break;
        case 'scan':
          time += 3;
          break;
      }

      currentX = waypoint.x;
      currentY = waypoint.y;
    }

    this.estimatedTime = time;
  }

  clearPath() {
    this.stopStatusPolling();
    this.isExecuting = false;
    this.executionComplete = false;
    this.executionMessage = '';
    this.executionProgress = 0;
    this.activeWaypointIndex = -1;
    this.completedWaypointOrders.clear();
    this.waypoints = [];
    this.selectedCell = null;
    this.selectedWaypoint = null;
    this.estimatedTime = 0;
    this.botAction = 'idle';
  }

  savePath() {
    if (this.waypoints.length === 0) return;

    const newPath: Omit<SavedPath, '_id' | 'created_at'> = {
      name: this.pathName || `Path ${new Date().toLocaleString()}`,
      waypoints: [...this.waypoints]
    };

    this.apiService.savePath(newPath).subscribe({
      next: (response) => {
        if (response.success) {
          alert(`Path "${newPath.name}" saved successfully!`);
          this.pathName = '';
          this.loadSavedPaths();
        } else {
          alert('Failed to save path to server. Saving locally.');
          this.savePathToLocalStorage(newPath);
        }
      },
      error: () => {
        alert('Failed to save path to server. Saving locally.');
        this.savePathToLocalStorage(newPath);
      }
    });
  }

  loadPath(path: SavedPath) {
    this.waypoints = [...path.waypoints];
    this.pathName = path.name;
    this.calculateEstimatedTime();
  }

  deleteSavedPath(pathId: string) {
    if (confirm('Are you sure you want to delete this saved path?')) {
      this.apiService.deleteSavedPath(pathId).subscribe(response => {
        this.loadSavedPaths();
      });
    }
  }

  executePath() {
    if (this.waypoints.length === 0 || this.isExecuting) return;

    this.isExecuting = true;
    this.executionComplete = false;
    this.completedWaypointOrders.clear();
    this.activeWaypointIndex = 0;
    this.executionProgress = 0;
    this.executionMessage = 'Starting path execution...';

    const pathData = {
      waypoints: this.waypoints,
      path_name: this.pathName || `Execution_${Date.now()}`
    };

    this.startStatusPolling();

    this.apiService.createWaypointPath(pathData).subscribe({
      next: (response) => {
        if (response.success) {
          this.executionMessage = 'Bot is following the path...';
        } else {
          this.finishExecution(false);
        }
      },
      error: (error) => {
        console.error('Error executing path:', error);
        this.finishExecution(false);
        alert('Failed to execute path. Please try again.');
      }
    });
  }

  // --- LocalStorage Fallback Methods ---
  private savePathToLocalStorage(pathData: Omit<SavedPath, '_id' | 'created_at'>) {
    const localPath = {
      ...pathData,
      _id: `local-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const currentPaths = this.getPathsFromLocalStorage();
    currentPaths.push(localPath);
    localStorage.setItem('savedPaths', JSON.stringify(currentPaths));
    this.loadPathsFromLocalStorage();
  }

  private loadPathsFromLocalStorage() {
    this.savedPaths = this.getPathsFromLocalStorage();
  }

  private getPathsFromLocalStorage(): SavedPath[] {
    const saved = localStorage.getItem('savedPaths');
    return saved ? JSON.parse(saved) : [];
  }

  // Helper methods
  isBotPosition(x: number, y: number): boolean {
    return this.botStatus.x === x && this.botStatus.y === y;
  }

  hasPlant(x: number, y: number): boolean {
    return this.plants.some(plant => plant.x === x && plant.y === y);
  }

  isWaypoint(x: number, y: number): boolean {
    return this.waypoints.some(waypoint => waypoint.x === x && waypoint.y === y);
  }

  getWaypointOrder(x: number, y: number): number {
    const waypointsAtPosition = this.waypoints.filter(w => w.x === x && w.y === y);
    if (waypointsAtPosition.length > 0) {
      return waypointsAtPosition[waypointsAtPosition.length - 1].order;
    }
    return 0;
  }

  isPerformingAction(): boolean {
    return ['watering', 'fertilizing', 'scanning'].includes(this.botAction);
  }

  isActiveWaypoint(x: number, y: number): boolean {
    if (!this.isExecuting || this.activeWaypointIndex < 0) return false;
    const wp = this.waypoints[this.activeWaypointIndex];
    return wp?.x === x && wp?.y === y;
  }

  isCompletedWaypoint(x: number, y: number): boolean {
    return this.waypoints.some(
      wp => wp.x === x && wp.y === y && this.completedWaypointOrders.has(wp.order)
    );
  }

  isWaypointCompleted(waypoint: Waypoint): boolean {
    return this.completedWaypointOrders.has(waypoint.order);
  }
}
