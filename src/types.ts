// ===== API Key =====
export interface ApiKeyState {
  key: string;
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
}

// ===== Analysis =====
export interface CriterionResult {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  comment: string;
  strengths: string[];
  weaknesses: string[];
}

export interface DetailedError {
  context: string;
  suggestion: string;
  type: string;
}

export interface Roadmap {
  shortTerm: string[];
  mediumTerm: string[];
  longTerm: string[];
}

export interface AnalysisResult {
  overallScore: number;
  plagiarismRisk: number;
  summary: string;
  criteria: CriterionResult[];
  detailedErrors: DetailedError[];
  roadmap: Roadmap;
  expertAdvice: string;
}

export interface FormData {
  title: string;
  level: string;
  subject: string;
  target: string;
  content: string;
}

export type AppStep = 'input' | 'analyzing' | 'result';
export type InputMode = 'upload' | 'text';

// ===== History =====
export interface AnalysisHistoryItem {
  id: string;
  title: string;
  level: string;
  subject: string;
  target: string;
  overallScore: number;
  date: string;
  result: AnalysisResult;
}
