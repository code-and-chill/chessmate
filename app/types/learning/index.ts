// Types for Learning API
export interface LessonContent {
  type: 'text' | 'video' | 'diagram' | 'interactive';
  title?: string;
  content: string;
  fen?: string;
  videoUrl?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  fen?: string;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: 'openings' | 'tactics' | 'endgames' | 'strategy' | 'theory';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // minutes
  topics: string[];
  content: LessonContent[];
  quiz?: Quiz;
  prerequisites?: string[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  progress: number; // 0-100
  quizScore?: number;
  completedAt?: string;
  timeSpent: number;
}

export interface LearningStats {
  totalLessonsCompleted: number;
  totalTimeSpent: number;
  averageQuizScore: number;
  currentStreak: number;
  longestStreak: number;
  byCategory: Record<string, { completed: number; total: number; averageScore: number }>;
  recentProgress: LessonProgress[];
}

export interface QuizSubmission {
  score: number;
  results: boolean[];
}

