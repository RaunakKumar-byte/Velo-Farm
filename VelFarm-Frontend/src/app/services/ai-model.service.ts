import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface AIModel {
  id: string;
  name: string;
  version: string;
  type: 'pest_detection' | 'crop_health' | 'yield_prediction' | 'weather_forecast' | 'soil_analysis';
  accuracy: number; // 0-100
  status: 'active' | 'inactive' | 'training' | 'error';
  uploadDate: Date;
  lastUpdated: Date;
  fileSize: number; // in MB
  description: string;
  isAutoUpdate: boolean;
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
  };
  trainingData: {
    samples: number;
    lastTraining: Date;
    nextTraining: Date;
  };
}

export interface ModelUploadResult {
  success: boolean;
  message: string;
  model?: AIModel;
  errors: string[];
}

export interface ModelUpdateResult {
  success: boolean;
  message: string;
  updatedModel?: AIModel;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AIModelService {
  private modelsSubject = new BehaviorSubject<AIModel[]>([]);
  public models$ = this.modelsSubject.asObservable();

  constructor() {
    this.initializeModels();
  }

  private initializeModels(): void {
    const sampleModels: AIModel[] = [
      {
        id: 'model-1',
        name: 'Crop Health Detection v2.1',
        version: '2.1.0',
        type: 'crop_health',
        accuracy: 94.2,
        status: 'active',
        uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        fileSize: 245.6,
        description: 'Advanced neural network for detecting crop diseases and health issues using computer vision.',
        isAutoUpdate: true,
        performance: {
          precision: 92.8,
          recall: 95.1,
          f1Score: 93.9
        },
        trainingData: {
          samples: 50000,
          lastTraining: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          nextTraining: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 'model-2',
        name: 'Pest Detection v1.8',
        version: '1.8.3',
        type: 'pest_detection',
        accuracy: 89.7,
        status: 'active',
        uploadDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        fileSize: 189.3,
        description: 'Machine learning model for identifying common agricultural pests and insects.',
        isAutoUpdate: true,
        performance: {
          precision: 88.2,
          recall: 91.3,
          f1Score: 89.7
        },
        trainingData: {
          samples: 35000,
          lastTraining: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          nextTraining: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 'model-3',
        name: 'Yield Prediction v3.0',
        version: '3.0.1',
        type: 'yield_prediction',
        accuracy: 91.5,
        status: 'training',
        uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        fileSize: 312.8,
        description: 'Deep learning model for predicting crop yield based on environmental and growth factors.',
        isAutoUpdate: false,
        performance: {
          precision: 90.1,
          recall: 92.8,
          f1Score: 91.4
        },
        trainingData: {
          samples: 75000,
          lastTraining: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          nextTraining: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 'model-4',
        name: 'Weather Forecast v1.5',
        version: '1.5.2',
        type: 'weather_forecast',
        accuracy: 87.3,
        status: 'inactive',
        uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        fileSize: 156.2,
        description: 'Weather prediction model for agricultural planning and irrigation scheduling.',
        isAutoUpdate: true,
        performance: {
          precision: 85.9,
          recall: 88.7,
          f1Score: 87.3
        },
        trainingData: {
          samples: 25000,
          lastTraining: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          nextTraining: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
        }
      }
    ];
    this.modelsSubject.next(sampleModels);
  }

  getAllModels(): Observable<AIModel[]> {
    return this.models$;
  }

  getModelById(id: string): Observable<AIModel | undefined> {
    return this.models$.pipe(
      map((models: AIModel[]) => models.find(model => model.id === id))
    );
  }

  getActiveModels(): Observable<AIModel[]> {
    return this.models$.pipe(
      map((models: AIModel[]) => models.filter(model => model.status === 'active'))
    );
  }

  uploadModel(file: File, modelData: Partial<AIModel>): Observable<ModelUploadResult> {
    return new Observable(observer => {
      // Simulate file upload process
      setTimeout(() => {
        const newModel: AIModel = {
          id: `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: modelData.name || file.name.replace(/\.[^/.]+$/, ''),
          version: modelData.version || '1.0.0',
          type: modelData.type || 'crop_health',
          accuracy: modelData.accuracy || 0,
          status: 'training',
          uploadDate: new Date(),
          lastUpdated: new Date(),
          fileSize: file.size / (1024 * 1024), // Convert to MB
          description: modelData.description || 'New AI model uploaded',
          isAutoUpdate: modelData.isAutoUpdate || false,
          performance: {
            precision: 0,
            recall: 0,
            f1Score: 0
          },
          trainingData: {
            samples: 0,
            lastTraining: new Date(),
            nextTraining: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        };

        const currentModels = this.modelsSubject.value;
        this.modelsSubject.next([newModel, ...currentModels]);

        observer.next({
          success: true,
          message: 'Model uploaded successfully and training started',
          model: newModel,
          errors: []
        });
        observer.complete();
      }, 2000);
    });
  }

  updateModel(id: string, updates: Partial<AIModel>): Observable<ModelUpdateResult> {
    const currentModels = this.modelsSubject.value;
    const modelIndex = currentModels.findIndex(model => model.id === id);
    
    if (modelIndex !== -1) {
      const updatedModel = { ...currentModels[modelIndex], ...updates, lastUpdated: new Date() };
      currentModels[modelIndex] = updatedModel;
      this.modelsSubject.next([...currentModels]);
      
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({
            success: true,
            message: 'Model updated successfully',
            updatedModel,
            errors: []
          });
          observer.complete();
        }, 1000);
      });
    }
    
    return new Observable(observer => {
      observer.next({
        success: false,
        message: 'Model not found',
        errors: ['Model with specified ID not found']
      });
      observer.complete();
    });
  }

  toggleModelStatus(id: string): Observable<ModelUpdateResult> {
    return this.getModelById(id).pipe(
      switchMap(model => {
        if (model) {
          const newStatus = model.status === 'active' ? 'inactive' : 'active';
          return this.updateModel(id, { status: newStatus });
        }
        throw new Error('Model not found');
      })
    );
  }

  toggleAutoUpdate(id: string): Observable<ModelUpdateResult> {
    return this.getModelById(id).pipe(
      switchMap(model => {
        if (model) {
          return this.updateModel(id, { isAutoUpdate: !model.isAutoUpdate });
        }
        throw new Error('Model not found');
      })
    );
  }

  deleteModel(id: string): Observable<{ success: boolean; message: string }> {
    const currentModels = this.modelsSubject.value;
    const filteredModels = currentModels.filter(model => model.id !== id);
    
    if (filteredModels.length < currentModels.length) {
      this.modelsSubject.next(filteredModels);
      
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({
            success: true,
            message: 'Model deleted successfully'
          });
          observer.complete();
        }, 1000);
      });
    }
    
    return new Observable(observer => {
      observer.next({
        success: false,
        message: 'Model not found'
      });
      observer.complete();
    });
  }

  getModelTypes(): AIModel['type'][] {
    return ['pest_detection', 'crop_health', 'yield_prediction', 'weather_forecast', 'soil_analysis'];
  }

  getModelTypeLabel(type: AIModel['type']): string {
    const labels = {
      pest_detection: 'Pest Detection',
      crop_health: 'Crop Health',
      yield_prediction: 'Yield Prediction',
      weather_forecast: 'Weather Forecast',
      soil_analysis: 'Soil Analysis'
    };
    return labels[type];
  }

  getModelStatusColor(status: AIModel['status']): string {
    const colors = {
      active: 'text-success',
      inactive: 'text-secondary',
      training: 'text-warning',
      error: 'text-danger'
    };
    return colors[status];
  }

  getModelStatusIcon(status: AIModel['status']): string {
    const icons = {
      active: 'bi-check-circle-fill',
      inactive: 'bi-pause-circle-fill',
      training: 'bi-arrow-clockwise',
      error: 'bi-x-circle-fill'
    };
    return icons[status];
  }

  getModelStatusLabel(status: AIModel['status']): string {
    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      training: 'Training',
      error: 'Error'
    };
    return labels[status];
  }

  getOverallAccuracy(): Observable<number> {
    return this.models$.pipe(
      map((models: AIModel[]) => {
        const activeModels = models.filter(model => model.status === 'active');
        if (activeModels.length === 0) return 0;
        
        const totalAccuracy = activeModels.reduce((sum, model) => sum + model.accuracy, 0);
        return totalAccuracy / activeModels.length;
      })
    );
  }

  getModelCount(): Observable<{ total: number; active: number; training: number; inactive: number }> {
    return this.models$.pipe(
      map((models: AIModel[]) => ({
        total: models.length,
        active: models.filter(m => m.status === 'active').length,
        training: models.filter(m => m.status === 'training').length,
        inactive: models.filter(m => m.status === 'inactive').length
      }))
    );
  }
}
