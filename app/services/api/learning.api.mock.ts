import { delay } from './mock-data';
import type { Lesson, LessonProgress, LearningStats, QuizSubmission } from '@/types/learning';
import type { ILearningApiClient } from './learning.api';

export class MockLearningApiClient implements ILearningApiClient {
  async getAllLessons(): Promise<Lesson[]> {
    await delay(80);
    return [] as Lesson[];
  }

  async getLessonById(_lessonId: string): Promise<Lesson> {
    await delay(80);
    // Return a minimal lesson
    return {
      id: _lessonId,
      title: 'Mock Lesson',
      description: 'A mock lesson',
      category: 'tactics',
      difficulty: 'beginner',
      duration: 5,
      topics: [],
      content: [],
    } as any;
  }

  async getLessonsByCategory(_category: string): Promise<Lesson[]> {
    await delay(60);
    return [] as Lesson[];
  }

  async startLesson(_lessonId: string): Promise<void> {
    await delay(40);
  }

  async completeLesson(_lessonId: string, _quizScore?: number): Promise<void> {
    await delay(40);
  }

  async getLessonProgress(_lessonId: string): Promise<LessonProgress | null> {
    await delay(40);
    return null;
  }

  async updateProgress(_lessonId: string, _progress: number, _timeSpent: number): Promise<void> {
    await delay(40);
  }

  async getUserStats(): Promise<LearningStats> {
    await delay(60);
    return {
      totalLessonsCompleted: 0,
      totalTimeSpent: 0,
      averageQuizScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      byCategory: {},
      recentProgress: [],
    } as LearningStats;
  }

  async submitQuiz(_lessonId: string, _answers: number[]): Promise<QuizSubmission> {
    await delay(60);
    return { score: 0, results: [] } as QuizSubmission;
  }
}
