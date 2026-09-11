import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, interval, takeWhile } from 'rxjs';
import { log } from '@tensorflow/tfjs';

// Interface for prediction results
interface Prediction {
  class: string;
  confidence: number;
  detection_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageInfo {
  width: number;
  height: number;
}

interface AnalysisResponse {
  outputs: Array<{
    image: ImageInfo;
    predictions: Prediction[];
  }>;
}

interface SampleImage {
  id: number;
  url: string;
  name: string;
  disease: string;
}

interface DiseaseDetails {
  severity: string;
  treatment: string;
  prevention: string;
}

@Component({
  selector: 'app-disease-detection',
  standalone: false,
  templateUrl: './disease-detection.html',
  styleUrl: './disease-detection.scss'
})
export class DiseaseDetectionComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Core properties
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  imageInfo: ImageInfo | null = null;
  predictions: Prediction[] = [];
  loading = false;

  // UI state properties
  currentStep = 1;
  uploadProgress = 0;
  analysisProgress = 0;
  isDragOver = false;
  analysisTime = 0;

  // Modal properties
  modalTitle = '';
  modalContent = '';

  // API configuration
  private readonly apiUrl = 'https://serverless.roboflow.com/infer/workflows/sih2025-ieer4/custom-workflow-2';
  private readonly apiKey = 'jSQT6S0ootkfqKePFMzl';

  // Sample images data
  sampleImages: SampleImage[] = [
    {
      id: 1,
      url: 'https://tse4.mm.bing.net/th/id/OIP.QJ0LPNOHSj00r1xztLB5twHaEo?pid=Api&P=0&h=180',
      name: 'Car',
      disease: 'Early Blight'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=300&h=200&fit=crop',
      name: 'Earbuds',
      disease: 'Late Blight'
    },
    {
      id: 3,
      url: 'https://tse4.mm.bing.net/th/id/OIP.nTnBelqc7O2297Ww8hDhgQHaE8?pid=Api&P=0&h=180',
      name: 'Healthy Leaf',
      disease: 'Bacterial Spot'
    },
    {
      id: 4,
      url: 'https://storage.googleapis.com/kaggle-datasets-images/4374455/7510772/8b35cc13b3c3f3a1dcb3cccbd92ff731/dataset-card.jpg?t=2024-01-30-06-07-39',
      name: 'Early Blight',
      disease: 'Blight'
    }
  ];

  // Disease information database
  private diseaseDatabase: { [key: string]: DiseaseDetails } = {
    'Early Blight': {
      severity: 'Medium',
      treatment: 'Apply fungicide containing chlorothalonil or copper-based compounds. Remove affected leaves immediately and improve air circulation around plants. Water at soil level to avoid wetting foliage.',
      prevention: 'Avoid overhead watering and ensure proper plant spacing. Practice crop rotation with non-solanaceous plants. Apply mulch to prevent soil splash onto leaves. Use drip irrigation systems when possible.'
    },
    'Late Blight': {
      severity: 'High',
      treatment: 'Remove and destroy infected plants immediately. Apply copper-based fungicide preventively. Improve drainage and avoid overhead irrigation. Consider systemic fungicides in severe cases.',
      prevention: 'Plant resistant varieties when available. Ensure good drainage and avoid wet, humid conditions. Apply preventive fungicide sprays during high-risk periods. Remove crop debris after harvest.'
    },
    'Bacterial Spot': {
      severity: 'Medium',
      treatment: 'Apply copper-based bactericides or streptomycin if available. Remove affected leaves and improve air circulation. Reduce humidity around plants and avoid overhead watering.',
      prevention: 'Use certified disease-free seeds. Avoid overhead irrigation and use drip systems. Practice crop rotation with non-host plants. Maintain proper plant spacing for air circulation.'
    },
    'Common Rust': {
      severity: 'Low',
      treatment: 'Apply fungicides containing propiconazole or tebuconazole. Remove heavily infected leaves. Ensure adequate plant nutrition, especially nitrogen management.',
      prevention: 'Plant resistant varieties. Avoid excessive nitrogen fertilization. Ensure proper plant spacing. Apply preventive fungicide applications during favorable weather conditions.'
    },
    'Apple Scab': {
      severity: 'Medium',
      treatment: 'Apply fungicides like captan or myclobutanil during early season. Prune for better air circulation. Remove fallen leaves and infected fruit.',
      prevention: 'Choose scab-resistant apple varieties. Maintain proper pruning for air circulation. Apply dormant season treatments. Clean up fallen leaves in autumn.'
    },
    'Healthy': {
      severity: 'None',
      treatment: 'No treatment required. Continue with regular plant care and monitoring.',
      prevention: 'Maintain good cultural practices: proper watering, fertilization, and pruning. Monitor regularly for early signs of disease. Ensure adequate air circulation and sunlight.'
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    // Initialize component with default values
    this.resetAnalysis();
    this.updateWorkflowStep(1);
  }

  
// Unified File Handling Method
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    this.selectedFile = file;

    // Preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;

      // Auto-call API after preview is ready
      this.detectDisease();
    };
    reader.readAsDataURL(file);
  }
}



  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileUpload(files[0]);
    }
  }

  private handleFileUpload(file: File): void {
    // Validate file
    if (!this.validateFile(file)) {
      return;
    }

    this.selectedFile = file;
    this.simulateUploadProgress();

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      this.updateWorkflowStep(2);
    };
    reader.readAsDataURL(file);
  }

  private validateFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, WEBP)');
      return false;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return false;
    }

    return true;
  }

  private simulateUploadProgress(): void {
    this.uploadProgress = 0;
    const progressInterval = interval(50).pipe(
      takeWhile(() => this.uploadProgress < 100)
    );

    progressInterval.subscribe(() => {
      this.uploadProgress += Math.random() * 15;
      if (this.uploadProgress >= 100) {
        this.uploadProgress = 100;
      }
    });
  }

  // Sample image handling
  useSampleImage(sample: SampleImage): void {
    this.selectedFile = null;
    this.imagePreview = sample.url;
    this.updateWorkflowStep(2);

    // Auto-trigger analysis for sample images
    setTimeout(() => {
      this.detectDisease(sample.url, true);
    }, 500);
  }

  // Disease detection methods
  async detectDisease(imageInput?: string, isSample = false): Promise<void> {
    if (!this.selectedFile && !isSample) {
      alert('Please select an image first');
      return;
    }

    this.startAnalysis();

    try {
      const startTime = Date.now();
      let body: any;

      if (isSample && imageInput) {
        body = {
          api_key: this.apiKey,
          inputs: { image: { type: 'url', value: imageInput } }
        };
      } else if (this.selectedFile) {
        const base64Image = await this.toBase64(this.selectedFile);
        body = {
          api_key: this.apiKey,
          inputs: { image: { type: 'base64', value: base64Image } }
        };
      }

      this.http.post<AnalysisResponse>(this.apiUrl, body).subscribe({
        next: (response) => {
          this.analysisTime = Date.now() - startTime;
          this.processAnalysisResults(response);
          this.completeAnalysis();
        },
        error: (error) => {
          console.error('Analysis failed:', error);
          this.handleAnalysisError(error);
        }
      });
    } catch (error) {
      console.error('Preprocessing failed:', error);
      this.handleAnalysisError(error);
    }
  }

  private startAnalysis(): void {
    this.loading = true;
    this.analysisProgress = 0;
    this.imageInfo = null;
    this.predictions = [];
    this.updateWorkflowStep(2);

    this.simulateAnalysisProgress();
  }

  private simulateAnalysisProgress(): void {
    const progressInterval = interval(100).pipe(
      takeWhile(() => this.analysisProgress < 95 && this.loading)
    );

    progressInterval.subscribe(() => {
      this.analysisProgress += Math.random() * 8;
      if (this.analysisProgress >= 95) {
        this.analysisProgress = 95;
      }
    });
  }

 private processAnalysisResults(response: any): void {
  if (response.outputs && response.outputs.length > 0) {
    const output = response.outputs[0];
    const predsObj = output.predictions;

    this.imageInfo = predsObj.image || null; // image info
    this.predictions = predsObj.predictions || []; // array of disease predictions
    console.log(this.predictions);
  } else {
    this.imageInfo = null;
    this.predictions = [];
  }
}


  private completeAnalysis(): void {
    this.analysisProgress = 100;
    setTimeout(() => {
      this.loading = false;
      this.updateWorkflowStep(3);
    }, 500);
  }

  private handleAnalysisError(error: any): void {
    this.loading = false;
    this.analysisProgress = 0;
    alert('Analysis failed. Please try again.');
    this.updateWorkflowStep(1);
  }

  // Utility methods
  private async toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private updateWorkflowStep(step: number): void {
    this.currentStep = step;
  }

  getCurrentAnalysisStep(): string {
    const steps = [
      'Preprocessing image...',
      'Extracting features...',
      'Running AI model...',
      'Analyzing patterns...',
      'Generating results...'
    ];

    const stepIndex = Math.floor((this.analysisProgress / 100) * (steps.length - 1));
    return steps[stepIndex] || steps[0];
  }

  // UI helper methods
  getSeverityClass(diseaseClass: string): string {
    const severity = this.getSeverityLevel(diseaseClass).toLowerCase();
    return severity === 'high' ? 'bg-danger' :
           severity === 'medium' ? 'bg-warning' :
           severity === 'low' ? 'bg-info' : 'bg-success';
  }

  getSeverityBadgeClass(diseaseClass: string): string {
    const severity = this.getSeverityLevel(diseaseClass).toLowerCase();
    return severity === 'high' ? 'high-severity' :
           severity === 'medium' ? 'medium-severity' : 'low-severity';
  }

  getSeverityLevel(diseaseClass: string): string {
    return this.diseaseDatabase[diseaseClass]?.severity || 'Unknown';
  }

  getConfidenceClass(confidence: number): string {
    return confidence >= 0.8 ? 'high-confidence' :
           confidence >= 0.6 ? 'medium-confidence' : 'low-confidence';
  }

  getAverageConfidence(): number {
    if (this.predictions.length === 0) return 0;
    const total = this.predictions.reduce((sum, p) => sum + p.confidence, 0);
    return Math.round((total / this.predictions.length) * 100);
  }

  // Modal methods
  showTreatment(prediction: Prediction): void {
    const diseaseInfo = this.diseaseDatabase[prediction.class];
    this.modalTitle = `Treatment for ${prediction.class}`;
    this.modalContent = diseaseInfo?.treatment || 'Treatment information not available.';

    // Trigger Bootstrap modal (assuming Bootstrap JS is loaded)
    const modalElement = document.getElementById('detailModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  showPrevention(prediction: Prediction): void {
    const diseaseInfo = this.diseaseDatabase[prediction.class];
    this.modalTitle = `Prevention for ${prediction.class}`;
    this.modalContent = diseaseInfo?.prevention || 'Prevention information not available.';

    const modalElement = document.getElementById('detailModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Reset methods
  resetAnalysis(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.imageInfo = null;
    this.predictions = [];
    this.loading = false;
    this.currentStep = 1;
    this.uploadProgress = 0;
    this.analysisProgress = 0;
    this.analysisTime = 0;
  }

  // Additional utility methods for enhanced functionality
  downloadResults(): void {
    if (this.predictions.length === 0) return;

    const results = {
      timestamp: new Date().toISOString(),
      image_info: this.imageInfo,
      predictions: this.predictions,
      analysis_time: this.analysisTime
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], 
                         { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plant_disease_analysis_${Date.now()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  shareResults(): void {
    if (navigator.share && this.predictions.length > 0) {
      const summary = `Plant Disease Analysis Results:\n${this.predictions.length} detection(s) found with ${this.getAverageConfidence()}% average confidence.`;
      navigator.share({
        title: 'Plant Disease Detection Results',
        text: summary,
        url: window.location.href
      });
    }
  }

  retryAnalysis(): void {
    if (this.selectedFile || this.imagePreview) {
      this.detectDisease();
    }
  }
}