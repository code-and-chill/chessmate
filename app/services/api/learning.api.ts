/**
 * Learning API Client - chess-knowledge-api integration
 */

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

export interface LessonContent {
  type: 'text' | 'video' | 'diagram' | 'interactive';
  title?: string;
  content: string;
  fen?: string;
  videoUrl?: string;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  fen?: string;
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
  byCategory: {
    [key: string]: {
      completed: number;
      total: number;
      averageScore: number;
    };
  };
  recentProgress: LessonProgress[];
}

export interface QuizSubmission {
  score: number;
  results: boolean[];
}

/**
 * Learning API Client
 */
export class LearningApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async getAllLessons(): Promise<Lesson[]> {
    const response = await fetch(`${this.baseUrl}/lessons`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch lessons');
    }
    return response.json();
  }

  async getLessonById(lessonId: string): Promise<Lesson> {
    const response = await fetch(`${this.baseUrl}/lessons/${lessonId}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch lesson');
    }
    return response.json();
  }

  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    const response = await fetch(`${this.baseUrl}/lessons?category=${category}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch lessons by category');
    }
    return response.json();
  }

  async startLesson(lessonId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/progress/${lessonId}/start`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to start lesson');
    }
  }

  async completeLesson(lessonId: string, quizScore?: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/progress/${lessonId}/complete`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ quizScore }),
    });
    if (!response.ok) {
      throw new Error('Failed to complete lesson');
    }
  }

  async getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
    const response = await fetch(`${this.baseUrl}/progress/${lessonId}`, {
      headers: this.getHeaders(),
    });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error('Failed to fetch lesson progress');
    }
    return response.json();
  }

  async updateProgress(lessonId: string, progress: number, timeSpent: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/progress/${lessonId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ progress, timeSpent }),
    });
    if (!response.ok) {
      throw new Error('Failed to update progress');
    }
  }

  async getUserStats(): Promise<LearningStats> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    return response.json();
  }

  async submitQuiz(lessonId: string, answers: number[]): Promise<QuizSubmission> {
    const response = await fetch(`${this.baseUrl}/lessons/${lessonId}/quiz`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ answers }),
    });
    if (!response.ok) {
      throw new Error('Failed to submit quiz');
    }
    return response.json();
  }
}
