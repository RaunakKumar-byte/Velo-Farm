import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/services/api.service';
import { AuthService } from '../../services/auth.service';
import { Task, NewTask } from '../../models/bot.models';

@Component({
  selector: 'app-task-scheduler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-calendar-alt text-primary me-2"></i>
                Scheduled Tasks
              </h5>
            </div>
            <div class="card-body">
              <!-- Task List -->
              <div *ngIf="tasks.length === 0" class="text-center text-muted py-5">
                <i class="fas fa-calendar-plus fa-3x mb-3"></i>
                <h5>No Scheduled Tasks</h5>
                <p>Create your first automated task to get started.</p>
              </div>

              <div *ngFor="let task of tasks" class="task-item mb-3 p-3 border rounded">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <div class="d-flex align-items-center">
                      <div class="form-check me-3">
                        <input class="form-check-input"
                               type="checkbox"
                               [checked]="task.active"
                               (change)="toggleTask(task._id)">
                      </div>
                      <div>
                        <h6 class="mb-1">{{ task.name }}</h6>
                        <p class="text-muted mb-1">{{ task.description }}</p>
                        <div class="d-flex align-items-center">
                          <span class="badge me-2"
                                [class.bg-success]="task.action === 'water_all'"
                                [class.bg-info]="task.action === 'fertilize_all'"
                                [class.bg-warning]="task.action === 'move_to'"
                                [class.bg-secondary]="task.action === 'custom'">
                            <i class="fas me-1"
                               [class.fa-tint]="task.action === 'water_all'"
                               [class.fa-leaf]="task.action === 'fertilize_all'"
                               [class.fa-crosshairs]="task.action === 'move_to'"
                               [class.fa-cog]="task.action === 'custom'"></i>
                            {{ getActionLabel(task.action) }}
                          </span>
                          <span class="badge bg-light text-dark">
                            {{ getScheduleLabel(task) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-3">
                    <div class="text-center">
                      <div class="mb-1">
                        <strong>Next Execution</strong>
                      </div>
                      <div class="text-muted">
                        {{ task.next_execution | date:'medium' }}
                      </div>
                    </div>
                  </div>

                  <div class="col-md-3">
                    <div class="d-flex justify-content-end">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" (click)="editTask(task)">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" (click)="deleteTask(task._id)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Task Details -->
                <div class="row mt-2" *ngIf="task.last_executed">
                  <div class="col-12">
                    <small class="text-muted">
                      Last executed: {{ task.last_executed | date:'medium' }}
                      ({{ task.execution_count }} times total)
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Task Sidebar -->
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="fas fa-plus text-success me-2"></i>
                {{ editingTask ? 'Edit Task' : 'Create New Task' }}
              </h6>
            </div>
            <div class="card-body">
              <form (ngSubmit)="saveTask()" #taskForm="ngForm">
                <div class="mb-3">
                  <label for="taskName" class="form-label">Task Name</label>
                  <input type="text"
                         class="form-control"
                         id="taskName"
                         name="taskName"
                         [(ngModel)]="newTask.name"
                         required
                         placeholder="e.g., Morning Watering">
                </div>

                <div class="mb-3">
                  <label for="taskDescription" class="form-label">Description</label>
                  <textarea class="form-control"
                            id="taskDescription"
                            name="taskDescription"
                            [(ngModel)]="newTask.description"
                            rows="2"
                            placeholder="Optional description"></textarea>
                </div>

                <div class="mb-3">
                  <label for="taskAction" class="form-label">Action</label>
                  <select class="form-select"
                          id="taskAction"
                          name="taskAction"
                          [(ngModel)]="newTask.action"
                          required>
                    <option value="water_all">Water All Plants</option>
                    <option value="fertilize_all">Fertilize All Plants</option>
                    <option value="move_to">Move to Position</option>
                    <option value="custom">Custom Action</option>
                  </select>
                </div>

                <!-- Position Selection for Move Action -->
                <div class="mb-3" *ngIf="newTask.action === 'move_to'">
                  <label class="form-label">Target Position</label>
                  <div class="row">
                    <div class="col-6">
                      <input type="number"
                             class="form-control"
                             [(ngModel)]="newTask.target_position.x"
                             name="targetX"
                             placeholder="X (0-4)"
                             min="0"
                             max="4">
                    </div>
                    <div class="col-6">
                      <input type="number"
                             class="form-control"
                             [(ngModel)]="newTask.target_position.y"
                             name="targetY"
                             placeholder="Y (0-4)"
                             min="0"
                             max="4">
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="scheduleType" class="form-label">Schedule Type</label>
                  <select class="form-select"
                          id="scheduleType"
                          name="scheduleType"
                          [(ngModel)]="newTask.schedule_type"
                          required>
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label for="scheduleTime" class="form-label">Time</label>
                  <input type="time"
                         class="form-control"
                         id="scheduleTime"
                         name="scheduleTime"
                         [(ngModel)]="newTask.schedule_time"
                         required>
                </div>

                <div class="mb-3" *ngIf="newTask.schedule_type === 'weekly'">
                  <label for="scheduleDay" class="form-label">Day of Week</label>
                  <select class="form-select"
                          id="scheduleDay"
                          name="scheduleDay"
                          [(ngModel)]="newTask.schedule_day">
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label for="priority" class="form-label">Priority</label>
                  <select class="form-select"
                          id="priority"
                          name="priority"
                          [(ngModel)]="newTask.priority">
                    <option value="1">Low (1)</option>
                    <option value="3">Normal (3)</option>
                    <option value="5" selected>Medium (5)</option>
                    <option value="7">High (7)</option>
                    <option value="10">Critical (10)</option>
                  </select>
                </div>

                <div class="d-grid gap-2">
                  <button type="submit"
                          class="btn btn-success"
                          [disabled]="taskForm.invalid || isLoading">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ editingTask ? 'Update Task' : 'Create Task' }}
                  </button>

                  <button type="button"
                          class="btn btn-outline-secondary"
                          (click)="cancelEdit()"
                          *ngIf="editingTask">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card mt-4">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="fas fa-bolt text-warning me-2"></i>
                Quick Schedule Templates
              </h6>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button class="btn btn-outline-info btn-sm" (click)="createQuickTask('morning_water')">
                  <i class="fas fa-tint me-2"></i>Morning Watering (6 AM)
                </button>
                <button class="btn btn-outline-success btn-sm" (click)="createQuickTask('weekly_fertilize')">
                  <i class="fas fa-leaf me-2"></i>Weekly Fertilizing (Monday 8 AM)
                </button>
                <button class="btn btn-outline-warning btn-sm" (click)="createQuickTask('evening_check')">
                  <i class="fas fa-search me-2"></i>Evening Check (6 PM)
                </button>
              </div>
            </div>
          </div>

          <!-- Active Tasks Summary -->
          <div class="card mt-4">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="fas fa-chart-bar text-info me-2"></i>
                Task Summary
              </h6>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-4">
                  <h4 class="text-primary">{{ tasks.length }}</h4>
                  <small class="text-muted">Total Tasks</small>
                </div>
                <div class="col-4">
                  <h4 class="text-success">{{ getActiveTasksCount() }}</h4>
                  <small class="text-muted">Active</small>
                </div>
                <div class="col-4">
                  <h4 class="text-info">{{ getUpcomingTasksCount() }}</h4>
                  <small class="text-muted">Today</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-item {
      transition: all 0.2s ease;
    }

    .task-item:hover {
      background: #f8f9fa;
      border-color: #007bff !important;
    }

    .form-check-input:checked {
      background-color: #28a745;
      border-color: #28a745;
    }

    .badge {
      font-size: 0.75rem;
    }

    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
    }

    @media (max-width: 768px) {
      .task-item .row {
        text-align: center;
      }

      .task-item .col-md-3 {
        margin-top: 1rem;
      }
    }
  `]
})
export class TaskSchedulerComponent implements OnInit {
  tasks: Task[] = [];
  newTask: NewTask = {
    name: '',
    description: '',
    action: 'water_all',
    schedule_type: 'daily',
    schedule_time: '',
    schedule_day: 0,
    priority: 5,
    target_position: { x: 0, y: 0 }
  };

  editingTask: Task | null = null;
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.apiService.getTasks().subscribe(response => {
      if (response.success) {
        this.tasks = response['tasks'];
      }
    });
  }

  saveTask() {
    this.isLoading = true;

    const taskData = { ...this.newTask };

    if (this.editingTask) {
      this.apiService.updateTask(this.editingTask._id, taskData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTasks();
            this.cancelEdit();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.apiService.createTask(taskData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTasks();
            this.resetForm();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.isLoading = false;
        }
      });
    }
  }

  editTask(task: Task) {
    this.editingTask = task;
    this.newTask = {
      name: task.name,
      description: task.description,
      action: task.action,
      schedule_type: task.schedule_type,
      schedule_time: task.schedule_time,
      schedule_day: task.schedule_day,
      priority: task.priority || 5,
      target_position: task.target_position || { x: 0, y: 0 }
    };
  }

  cancelEdit() {
    this.editingTask = null;
    this.resetForm();
  }

  deleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.apiService.deleteTask(taskId).subscribe(response => {
        if (response.success) {
          this.loadTasks();
        }
      });
    }
  }

  toggleTask(taskId: string) {
    this.apiService.toggleTask(taskId).subscribe(response => {
      if (response.success) {
        this.loadTasks();
      }
    });
  }

  createQuickTask(template: string) {
    switch (template) {
      case 'morning_water':
        this.newTask = {
          name: 'Morning Watering',
          description: 'Water all plants every morning',
          action: 'water_all',
          schedule_type: 'daily',
          schedule_time: '06:00',
          schedule_day: 0,
          priority: 7,
          target_position: { x: 0, y: 0 }
        };
        break;
      case 'weekly_fertilize':
        this.newTask = {
          name: 'Weekly Fertilizing',
          description: 'Fertilize all plants every Monday',
          action: 'fertilize_all',
          schedule_type: 'weekly',
          schedule_time: '08:00',
          schedule_day: 1, // Monday
          priority: 5,
          target_position: { x: 0, y: 0 }
        };
        break;
      case 'evening_check':
        this.newTask = {
          name: 'Evening Check',
          description: 'Move to center for evening inspection',
          action: 'move_to',
          schedule_type: 'daily',
          schedule_time: '18:00',
          schedule_day: 0,
          priority: 3,
          target_position: { x: 2, y: 2 }
        };
        break;
    }
  }

  resetForm() {
    this.newTask = {
      name: '',
      description: '',
      action: 'water_all',
      schedule_type: 'daily',
      schedule_time: '',
      schedule_day: 0,
      priority: 5,
      target_position: { x: 0, y: 0 }
    };
  }

  getActionLabel(action: string): string {
    const labels: { [key: string]: string } = {
      'water_all': 'Water All',
      'fertilize_all': 'Fertilize All',
      'move_to': 'Move To',
      'custom': 'Custom'
    };
    return labels[action] || action;
  }

  getScheduleLabel(task: Task): string {
    if (task.schedule_type === 'daily') {
      return `Daily at ${task.schedule_time}`;
    } else if (task.schedule_type === 'weekly') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${days[task.schedule_day ?? 0]} at ${task.schedule_time}`;
    } else if (task.schedule_type === 'once') {
      return `Once at ${task.schedule_time}`;
    }
    return 'Unknown';
  }

  getActiveTasksCount(): number {
    return this.tasks.filter(task => task.active).length;
  }

  getUpcomingTasksCount(): number {
    const today = new Date().toDateString();
    return this.tasks.filter(task => {
      if (!task.next_execution) return false;
      return new Date(task.next_execution).toDateString() === today;
    }).length;
  }
}
