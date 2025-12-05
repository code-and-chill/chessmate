import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useApiClients } from './ApiContext';
import type {
  Lesson,
  LessonContent,
  Quiz,
  QuizQuestion,
  LessonProgress,
  LearningStats,
  QuizSubmission,
} from '@/services/api';

// Re-export types for convenience
export type {
  Lesson,
  LessonContent,
  Quiz,
  QuizQuestion,
  LessonProgress,
  LearningStats,
};

interface LearningContextType {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  learningStats: LearningStats | null;
  isLoading: boolean;
  
  // Lesson management
  getAllLessons: () => Promise<Lesson[]>;
  getLessonById: (id: string) => Promise<Lesson>;
  getLessonsByCategory: (category: string) => Promise<Lesson[]>;
  startLesson: (lessonId: string) => Promise<void>;
  completeLesson: (lessonId: string, quizScore?: number) => Promise<void>;
  
  // Progress tracking
  getLessonProgress: (lessonId: string) => Promise<LessonProgress | null>;
  updateProgress: (lessonId: string, progress: number, timeSpent: number) => Promise<void>;
  getUserStats: () => Promise<LearningStats>;
  
  // Quiz
  submitQuiz: (lessonId: string, answers: number[]) => Promise<QuizSubmission>;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export function LearningProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { learningApi } = useApiClients();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAllLessons = useCallback(async (): Promise<Lesson[]> => {
    setIsLoading(true);
    try {
      const fetchedLessons = await learningApi.getAllLessons();
      setLessons(fetchedLessons);
      return fetchedLessons;
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [learningApi]);

  const getLessonById = useCallback(async (id: string): Promise<Lesson> => {
    setIsLoading(true);
    try {
      const lesson = await learningApi.getLessonById(id);
      setCurrentLesson(lesson);
      return lesson;
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [learningApi]);

  const getLessonsByCategory = useCallback(async (category: string): Promise<Lesson[]> => {
    setIsLoading(true);
    try {
      return await learningApi.getLessonsByCategory(category);
    } catch (error) {
      console.error('Failed to fetch lessons by category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [learningApi]);

  const startLesson = useCallback(async (lessonId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await learningApi.startLesson(lessonId);
      const lesson = await getLessonById(lessonId);
      console.log('Started lesson:', lesson.title);
    } catch (error) {
      console.error('Failed to start lesson:', error);
      throw error;
    }
  }, [user, learningApi, getLessonById]);

  const completeLesson = useCallback(async (lessonId: string, quizScore?: number) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await learningApi.completeLesson(lessonId, quizScore);
      console.log('Completed lesson:', lessonId, 'Score:', quizScore);
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      throw error;
    }
  }, [user, learningApi]);

  const getLessonProgress = useCallback(async (lessonId: string): Promise<LessonProgress | null> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      return await learningApi.getLessonProgress(lessonId);
    } catch (error) {
      console.error('Failed to get lesson progress:', error);
      return null;
    }
  }, [user, learningApi]);

  const updateProgress = useCallback(async (lessonId: string, progress: number, timeSpent: number) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await learningApi.updateProgress(lessonId, progress, timeSpent);
      console.log('Updated progress:', lessonId, progress, timeSpent);
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  }, [user, learningApi]);

  const getUserStats = useCallback(async (): Promise<LearningStats> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      const stats = await learningApi.getUserStats();
      setLearningStats(stats);
      return stats;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, learningApi]);

  const submitQuiz = useCallback(async (
    lessonId: string,
    answers: number[]
  ): Promise<QuizSubmission> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      return await learningApi.submitQuiz(lessonId, answers);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      throw error;
    }
  }, [user, learningApi]);

  const value: LearningContextType = {
    lessons,
    currentLesson,
    learningStats,
    isLoading,
    getAllLessons,
    getLessonById,
    getLessonsByCategory,
    startLesson,
    completeLesson,
    getLessonProgress,
    updateProgress,
    getUserStats,
    submitQuiz,
  };

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
}
