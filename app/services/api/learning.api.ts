/**
 * Learning API Client - chess-knowledge-api integration
 */

import type { Lesson, LessonContent, Quiz, QuizQuestion, LessonProgress, LearningStats, QuizSubmission } from '@/types/learning';

// Public interface for the Learning API used by the app
export interface ILearningApiClient {
  setAuthToken?(token: string): void;
  getAllLessons(): Promise<Lesson[]>;
  getLessonById(lessonId: string): Promise<Lesson>;
  getLessonsByCategory(category: string): Promise<Lesson[]>;
  startLesson(lessonId: string): Promise<void>;
  completeLesson(lessonId: string, quizScore?: number): Promise<void>;
  getLessonProgress(lessonId: string): Promise<LessonProgress | null>;
  updateProgress(lessonId: string, progress: number, timeSpent: number): Promise<void>;
  getUserStats(): Promise<LearningStats>;
  submitQuiz(lessonId: string, answers: number[]): Promise<QuizSubmission>;
}

export class LearningApiClient implements ILearningApiClient {
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
