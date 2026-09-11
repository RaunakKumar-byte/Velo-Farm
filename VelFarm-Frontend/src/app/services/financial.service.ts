import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  period: string;
}

export interface TrendData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface CropProfitability {
  crop: string;
  profit: number;
  percentage: number;
  color: string;
}

export interface FinancialData {
  metrics: FinancialMetrics;
  trendData: TrendData[];
  expenseBreakdown: ExpenseCategory[];
  cropProfitability: CropProfitability[];
}

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  private financialDataSubject = new BehaviorSubject<FinancialData>(this.generateFinancialData());
  public financialData$ = this.financialDataSubject.asObservable();

  constructor() {}

  getFinancialData(): Observable<FinancialData> {
    return this.financialData$;
  }

  getFinancialDataByPeriod(period: string): Observable<FinancialData> {
    const data = this.generateFinancialDataByPeriod(period);
    this.financialDataSubject.next(data);
    return this.financialData$;
  }

  exportFinancialData(format: 'csv' | 'json' | 'pdf'): string {
    const data = this.financialDataSubject.value;
    
    switch (format) {
      case 'csv':
        return this.exportToCSV(data);
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'pdf':
        return this.exportToPDF(data);
      default:
        return '';
    }
  }

  private generateFinancialData(): FinancialData {
    return {
      metrics: {
        totalRevenue: 125670,
        totalExpenses: 72430,
        netProfit: 53240,
        period: 'Last 90 Days'
      },
      trendData: this.generateTrendData(),
      expenseBreakdown: this.generateExpenseBreakdown(),
      cropProfitability: this.generateCropProfitability()
    };
  }

  private generateFinancialDataByPeriod(period: string): FinancialData {
    const trendData = this.generateTrendDataForPeriod(period);
    const totalRevenue = trendData.reduce((sum, d) => sum + d.revenue, 0);
    const totalExpenses = trendData.reduce((sum, d) => sum + d.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;

    return {
      metrics: {
        totalRevenue: Math.round(totalRevenue),
        totalExpenses: Math.round(totalExpenses),
        netProfit: Math.round(netProfit),
        period: period
      },
      trendData,
      expenseBreakdown: this.generateExpenseBreakdownForPeriod(period),
      cropProfitability: this.generateCropProfitabilityForPeriod(period)
    };
  }

  private generateTrendData(): TrendData[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      revenue: Math.round(15000 + (index * 4000) + Math.random() * 5000),
      expenses: Math.round(12000 + (index * 3000) + Math.random() * 3000)
    }));
  }

  private generateTrendDataForPeriod(period: string): TrendData[] {
    const baseData = this.generateTrendData();
    const multiplier = this.getPeriodMultiplier(period);
    
    return baseData.map(data => ({
      ...data,
      revenue: Math.round(data.revenue * multiplier),
      expenses: Math.round(data.expenses * multiplier)
    }));
  }

  private generateExpenseBreakdown(): ExpenseCategory[] {
    return [
      { name: 'Seeds & Plants', amount: 18500, percentage: 25.5, color: '#ef4444' },
      { name: 'Fertilizer & Chemicals', amount: 25200, percentage: 34.8, color: '#f97316' },
      { name: 'Labor', amount: 15800, percentage: 21.8, color: '#eab308' },
      { name: 'Equipment & Fuel', amount: 9630, percentage: 13.3, color: '#22c55e' },
      { name: 'Other', amount: 3300, percentage: 4.6, color: '#3b82f6' }
    ];
  }

  private generateExpenseBreakdownForPeriod(period: string): ExpenseCategory[] {
    const baseData = this.generateExpenseBreakdown();
    const multiplier = this.getPeriodMultiplier(period);
    
    return baseData.map(category => ({
      ...category,
      amount: Math.round(category.amount * multiplier)
    }));
  }

  private generateCropProfitability(): CropProfitability[] {
    return [
      { crop: 'Corn', profit: 28500, percentage: 53.5, color: '#eab308' },
      { crop: 'Soybean', profit: 18500, percentage: 34.7, color: '#22c55e' },
      { crop: 'Wheat', profit: 6240, percentage: 11.8, color: '#f97316' }
    ];
  }

  private generateCropProfitabilityForPeriod(period: string): CropProfitability[] {
    const baseData = this.generateCropProfitability();
    const multiplier = this.getPeriodMultiplier(period);
    
    return baseData.map(crop => ({
      ...crop,
      profit: Math.round(crop.profit * multiplier)
    }));
  }

  private getPeriodMultiplier(period: string): number {
    const multipliers: { [key: string]: number } = {
      'Last 30 Days': 0.33,
      'Last 90 Days': 1,
      'Last 6 Months': 2,
      'Last Year': 4
    };
    return multipliers[period] || 1;
  }

  private exportToCSV(data: FinancialData): string {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Revenue', `$${data.metrics.totalRevenue.toLocaleString()}`],
      ['Total Expenses', `$${data.metrics.totalExpenses.toLocaleString()}`],
      ['Net Profit', `$${data.metrics.netProfit.toLocaleString()}`],
      ['Period', data.metrics.period]
    ];
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private exportToPDF(data: FinancialData): string {
    // Simplified PDF export - in real implementation, use a PDF library
    return `PDF Export for ${data.metrics.period} - Implementation needed`;
  }

  // Chart data generation for Chart.js
  getChartData(): any {
    const data = this.financialDataSubject.value;
    
    return {
      trendChart: {
        labels: data.trendData.map(d => d.month),
        datasets: [
          {
            label: 'Revenue',
            data: data.trendData.map(d => d.revenue),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Expenses',
            data: data.trendData.map(d => d.expenses),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      donutChart: {
        labels: data.cropProfitability.map(c => c.crop),
        datasets: [{
          data: data.cropProfitability.map(c => c.profit),
          backgroundColor: data.cropProfitability.map(c => c.color),
          borderWidth: 0
        }]
      }
    };
  }
}
