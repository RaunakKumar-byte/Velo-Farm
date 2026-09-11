import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FinancialService, FinancialData, FinancialMetrics, TrendData, ExpenseCategory, CropProfitability } from '../../services/financial.service';
import { ApiService } from '../../services/api.service';
import { SharedModule } from '../../shared/shared-module';

declare var Chart: any;

@Component({
  selector: 'app-financial-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './financial-overview.html',
  styleUrls: ['./financial-overview.scss']
})
export class FinancialOverviewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('trendChart', { static: false }) trendChartRef!: ElementRef;
  @ViewChild('donutChart', { static: false }) donutChartRef!: ElementRef;
  @ViewChild('activityChart', { static: false }) activityChartRef!: ElementRef;

  private readonly destroy$ = new Subject<void>();
  
  // Data properties
  financialData: FinancialData | null = null;
  trendChart: any = null;
  donutChart: any = null;
  activityChart: any = null;
  
  // UI state
  selectedPeriod = 'Last 90 Days';
  showExportModal = false;
  exportFormat: 'csv' | 'json' | 'pdf' = 'csv';
  isLoading = false;
  darkMode = false;
  
  // Backend finance
  financeSummary: any = null;
  financeRecords: any[] = [];

  // Period options
  periodOptions = [
    'Last 30 Days',
    'Last 90 Days',
    'Last 6 Months',
    'Last Year'
  ];

  constructor(
    private readonly financialService: FinancialService,
    private readonly api: ApiService
  ) {}

  ngOnInit(): void {
    this.loadFinancialData();
    // Apply dark class on body but scope via attribute to this component only
    this.syncBodyDarkMode();
  }

  ngAfterViewInit(): void {
    // In case data already loaded and canvases are present, initialize charts
    setTimeout(() => {
      if (this.financialData) {
        this.initializeCharts();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.trendChart) {
      this.trendChart.destroy();
    }
    if (this.donutChart) {
      this.donutChart.destroy();
    }
    if (this.activityChart) {
      this.activityChart.destroy();
    }
    // Remove scoped dark attribute on leave
    document.body.removeAttribute('data-financial-dark');
  }

  private loadFinancialData(): void {
    this.isLoading = true;
    
    this.financialService.getFinancialDataByPeriod(this.selectedPeriod)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.financialData = data;
        this.isLoading = false;
        this.initializeCharts();
      });

    // Also load backend finance summary and records
    this.api.getFinanceSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (s) => this.financeSummary = s, error: () => {} });
    this.api.getFinanceRecords()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (r) => this.financeRecords = r || [], error: () => {} });
  }

  onPeriodChange(): void {
    this.loadFinancialData();
  }

  private initializeCharts(): void {
    if (!this.financialData) return;
    // Defer until view updates to ensure canvases exist (due to *ngIf)
    setTimeout(() => {
      this.initializeTrendChart();
      this.initializeDonutChart();
      this.initializeActivityChart();
    });
  }

  private initializeTrendChart(): void {
    if (this.trendChart) {
      this.trendChart.destroy();
    }

    const chartData = this.financialService.getChartData();
    
    if (!this.trendChartRef || !this.trendChartRef.nativeElement) return;
    const tCanvas = this.trendChartRef.nativeElement as HTMLCanvasElement;
    const tCtx = tCanvas.getContext('2d');
    if (!tCtx) return;
    this.trendChart = new Chart(tCtx, {
      type: 'line',
      data: chartData.trendChart,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return '$' + Number(value).toLocaleString();
              }
            }
          }
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6
          }
        }
      }
    });
  }

  private initializeDonutChart(): void {
    if (this.donutChart) {
      this.donutChart.destroy();
    }

    const chartData = this.financialService.getChartData();
    
    if (!this.donutChartRef || !this.donutChartRef.nativeElement) return;
    const dCanvas = this.donutChartRef.nativeElement as HTMLCanvasElement;
    const dCtx = dCanvas.getContext('2d');
    if (!dCtx) return;
    this.donutChart = new Chart(dCtx, {
      type: 'doughnut',
      data: chartData.donutChart,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              generateLabels: (chart: any) => {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label: string, index: number) => {
                    const dataset = data.datasets[0];
                    const value = dataset.data[index];
                    const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    
                    return {
                      text: `${label} (${percentage}%)`,
                      fillStyle: dataset.backgroundColor[index],
                      strokeStyle: dataset.backgroundColor[index],
                      lineWidth: 0,
                      pointStyle: 'rect',
                      hidden: false,
                      index: index
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = Number(context.parsed) || 0;
                const dataset = context.dataset;
                const total = (dataset?.data || []).reduce((a: number, b: number) => a + Number(b || 0), 0);
                const pct = total ? ((value / total) * 100).toFixed(1) : '0.0';
                return `${label}: $${value.toLocaleString()} (${pct}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    });
  }

  private initializeActivityChart(): void {
    if (!this.financialData || !this.activityChartRef) return;
    if (this.activityChart) {
      this.activityChart.destroy();
    }

    const labels = this.financialData.trendData.map(d => d.month);
    const activityValues = this.financialData.trendData.map(d => Math.max(d.revenue - d.expenses, 0));

    this.activityChart = new Chart(this.activityChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Monthly Activity',
            data: activityValues,
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderRadius: 8,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => `$${(ctx.parsed.y || 0).toLocaleString()}`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: any) => '$' + Number(value).toLocaleString()
            }
          }
        }
      }
    });
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    this.syncBodyDarkMode();
  }

  private syncBodyDarkMode(): void {
    // Add or remove a scoped data attribute on body that CSS can target when this page is active
    if (this.darkMode) {
      document.body.setAttribute('data-financial-dark', 'true');
      document.body.classList.add('financial-dark');
    } else {
      document.body.removeAttribute('data-financial-dark');
      document.body.classList.remove('financial-dark');
    }
  }

  // Export functionality
  openExportModal(): void {
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  exportData(): void {
    const exportData = this.financialService.exportFinancialData(this.exportFormat);
    
    if (this.exportFormat === 'csv') {
      this.downloadCSV(exportData, 'financial-overview.csv');
    } else if (this.exportFormat === 'json') {
      this.downloadJSON(exportData, 'financial-overview.json');
    } else if (this.exportFormat === 'pdf') {
      console.log('PDF export:', exportData);
    }
    
    this.closeExportModal();
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private downloadJSON(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return '$' + amount.toLocaleString();
  }

  getExpenseBarWidth(amount: number): string {
    if (!this.financialData) return '0%';
    const maxAmount = Math.max(...this.financialData.expenseBreakdown.map(e => e.amount));
    return `${(amount / maxAmount) * 100}%`;
  }

  getExpensePercentage(amount: number): number {
    if (!this.financialData) return 0;
    const total = this.financialData.expenseBreakdown.reduce((sum, e) => sum + e.amount, 0);
    return Math.round((amount / total) * 100);
  }

  getCropPercentage(profit: number): number {
    if (!this.financialData) return 0;
    const total = this.financialData.cropProfitability.reduce((sum, c) => sum + c.profit, 0);
    return Math.round((profit / total) * 100);
  }

  // Derived insights for template to avoid complex expressions
  getMaxMonthlyProfit(): number {
    if (!this.financialData || !this.financialData.trendData || this.financialData.trendData.length === 0) {
      return 0;
    }
    const profits = this.financialData.trendData.map(d => d.revenue - d.expenses);
    if (profits.length === 0) return 0;
    return Math.max(...profits);
  }

  getRevenueOutpacedCount(): number {
    if (!this.financialData || !this.financialData.trendData) return 0;
    return this.financialData.trendData.filter(d => d.revenue > d.expenses).length;
  }

  getBiggestCostCenter(): string {
    if (!this.financialData || !this.financialData.expenseBreakdown || this.financialData.expenseBreakdown.length === 0) {
      return 'N/A';
    }
    const max = this.financialData.expenseBreakdown.reduce((acc, curr) => (curr.amount > acc.amount ? curr : acc));
    return max?.name || 'N/A';
  }

  // Additional insights
  getBestMonth(): { month: string; profit: number } | null {
    if (!this.financialData || !this.financialData.trendData || this.financialData.trendData.length === 0) return null;
    const profits = this.financialData.trendData.map(d => ({ month: d.month, profit: d.revenue - d.expenses }));
    return profits.reduce((best, cur) => (cur.profit > best.profit ? cur : best), profits[0]);
  }

  getWorstMonth(): { month: string; profit: number } | null {
    if (!this.financialData || !this.financialData.trendData || this.financialData.trendData.length === 0) return null;
    const profits = this.financialData.trendData.map(d => ({ month: d.month, profit: d.revenue - d.expenses }));
    return profits.reduce((worst, cur) => (cur.profit < worst.profit ? cur : worst), profits[0]);
  }

  getAverageProfit(): number {
    if (!this.financialData || !this.financialData.trendData || this.financialData.trendData.length === 0) return 0;
    const sum = this.financialData.trendData.reduce((acc, d) => acc + (d.revenue - d.expenses), 0);
    return Math.round(sum / this.financialData.trendData.length);
  }

  getPositiveStreak(): number {
    if (!this.financialData || !this.financialData.trendData) return 0;
    let streak = 0;
    for (let i = this.financialData.trendData.length - 1; i >= 0; i--) {
      const d = this.financialData.trendData[i];
      if (d.revenue - d.expenses > 0) streak++; else break;
    }
    return streak;
  }

  // Additional key ratios (distinct from Top Insights)
  getRevenueToExpenseRatio(): number {
    if (!this.financialData) return 0;
    const rev = this.financialData.metrics.totalRevenue || 0;
    const exp = this.financialData.metrics.totalExpenses || 0;
    if (exp === 0) return rev > 0 ? Infinity : 0;
    return Number((rev / exp).toFixed(2));
  }

  getTopCropContributionPercent(): number {
    if (!this.financialData || !this.financialData.cropProfitability || this.financialData.cropProfitability.length === 0) return 0;
    const totalProfit = this.financialData.cropProfitability.reduce((sum, c) => sum + c.profit, 0);
    if (totalProfit === 0) return 0;
    const top = this.financialData.cropProfitability.reduce((acc, cur) => (cur.profit > acc.profit ? cur : acc));
    return Math.round((top.profit / totalProfit) * 100);
  }
}
