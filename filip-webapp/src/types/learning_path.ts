

export interface Recommendation {
    type: 'warning' | 'caution' | 'success' | 'suggestion' | 'alternative';
    title: string;
    message: string;
    action: string;
  }

export interface AnalysisResults {
  totalHours: number;
  weeklyHours: number;
  totalWeeks: number;
  estimatedEndDate: Date;
  targetDate: Date;
  daysDiff: number;
  riskLevel: 'high' | 'medium' | 'low';
  recommendations: Recommendation[];
}