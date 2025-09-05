export interface Skill {
  name: string;
  type: 'current' | 'new';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  confidence: number;
  priority: 'Low' | 'Medium' | 'High';
  salaryImpact: string;
  marketDemand: number;
  description: string;
}

export interface AnalysisData {
  skills: Skill[];
}
