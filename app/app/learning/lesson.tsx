import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack, useFonts, useColors } from '@/ui';
import { useLearning } from '@/contexts/LearningContext';
import type { Lesson, Quiz } from '@/contexts/LearningContext';
import { useI18n } from '@/i18n/I18nContext';

export default function LessonViewerScreen() {
  const router = useRouter();
  const fonts = useFonts();
  const colors = useColors();
  const { t, ti } = useI18n();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { startLesson, completeLesson, getQuiz, submitQuiz, isLoading } = useLearning();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    if (!lessonId) return;
    const data = await startLesson(lessonId);
    setLesson(data);
  };

  const handleNext = () => {
    if (!lesson) return;

    if (currentSection < lesson.content.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      // Lesson complete, show quiz if available
      loadQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const loadQuiz = async () => {
    if (!lessonId) return;
    const quizData = await getQuiz(lessonId);
    if (quizData) {
      setQuiz(quizData);
      setShowQuiz(true);
    } else {
      // No quiz, mark as complete
      await completeLesson(lessonId);
      Alert.alert(t('learn.lesson_complete'), t('learn.lesson_complete_message'), [
        { text: t('common.continue'), onPress: () => router.back() },
      ]);
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleQuizSubmit = async () => {
    if (!quiz || !lessonId) return;

    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correct++;
      }
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    // Submit to backend
    await submitQuiz(quiz.id, selectedAnswers, score);

    // Mark lesson as complete if passed
    if (score >= quiz.passingScore) {
      await completeLesson(lessonId);
    }
  };

  const handleQuizRetry = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  if (isLoading || !lesson) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loader}>
          <Text style={[styles.loaderText, { color: colors.foreground.secondary }]}>{t('learn.loading_lesson')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentContent = lesson.content[currentSection];
  const progress = ((currentSection + 1) / lesson.content.length) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeIn.duration(500)}>
            <Text style={[styles.title, { color: colors.foreground.primary }]}>{lesson.title}</Text>
            
            {/* Progress Bar */}
            {!showQuiz && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBarContainer, { backgroundColor: colors.background.tertiary }]}>
                  <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: colors.accent.primary }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.foreground.secondary }]}>
                  {ti('learn.section_progress', { current: currentSection + 1, total: lesson.content.length })}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Content */}
          {!showQuiz ? (
            <Animated.View entering={FadeInDown.duration(500)} key={currentSection}>
              <Card variant="default" size="lg">
                <VStack gap={4} style={{ padding: 20 }}>
                  {currentContent.type === 'text' && (
                    <View>
                      <Text style={[styles.contentTitle, { color: colors.foreground.primary }]}>{currentContent.title}</Text>
                      <Text style={[styles.contentText, { color: colors.foreground.secondary }]}>{currentContent.content}</Text>
                    </View>
                  )}

                  {currentContent.type === 'video' && (
                    <View>
                      <Text style={[styles.contentTitle, { color: colors.foreground.primary }]}>{currentContent.title}</Text>
                      <View style={[styles.videoPlaceholder, { backgroundColor: colors.background.secondary }]}>
                        <Text style={[styles.videoText, { color: colors.foreground.secondary }]}>{t('learn.video_player')}</Text>
                        <Text style={[styles.videoUrl, { fontFamily: fonts.mono, color: colors.foreground.muted }]}>{currentContent.content}</Text>
                      </View>
                    </View>
                  )}

                  {currentContent.type === 'diagram' && (
                    <View>
                      <Text style={[styles.contentTitle, { color: colors.foreground.primary }]}>{currentContent.title}</Text>
                      <View style={[styles.diagramPlaceholder, { backgroundColor: colors.background.secondary }]}>
                        <Text style={[styles.diagramText, { color: colors.foreground.secondary }]}>{t('learn.chess_diagram')}</Text>
                        <Text style={[styles.fenText, { fontFamily: fonts.mono, color: colors.foreground.muted }]}>{currentContent.content}</Text>
                      </View>
                    </View>
                  )}

                  {currentContent.type === 'interactive' && (
                    <View>
                      <Text style={[styles.contentTitle, { color: colors.foreground.primary }]}>{currentContent.title}</Text>
                      <View style={[styles.interactivePlaceholder, { backgroundColor: colors.background.secondary }]}>
                        <Text style={[styles.interactiveText, { color: colors.foreground.secondary }]}>{t('learn.interactive_exercise')}</Text>
                        <Text style={[styles.instructionText, { color: colors.foreground.secondary }]}>{currentContent.content}</Text>
                      </View>
                    </View>
                  )}
                </VStack>
              </Card>
            </Animated.View>
          ) : (
            // Quiz Section
            <Animated.View entering={FadeInDown.duration(500)}>
              <VStack gap={4}>
                <Card variant="gradient" size="md">
                  <View style={{ padding: 16 }}>
                    <Text style={[styles.quizTitle, { color: colors.foreground.primary }]}>{t('learn.quiz_time')}</Text>
                    <Text style={[styles.quizSubtitle, { color: colors.foreground.secondary }]}>
                      {ti('learn.quiz_info', { count: quiz?.questions.length, score: quiz?.passingScore })}
                    </Text>
                  </View>
                </Card>

                {quiz?.questions.map((question, qIndex) => (
                  <Card key={question.id} variant="default" size="md">
                    <VStack gap={3} style={{ padding: 16 }}>
                      <Text style={[styles.questionNumber, { color: colors.accent.primary }]}>{ti('learn.question_number', { number: qIndex + 1 })}</Text>
                      <Text style={[styles.questionText, { color: colors.foreground.primary }]}>{question.question}</Text>
                      
                      {question.options.map((option, optIndex) => {
                        const isSelected = selectedAnswers[question.id] === optIndex;
                        const isCorrect = optIndex === question.correctAnswerIndex;
                        const showResult = quizSubmitted;

                        return (
                          <TouchableOpacity
                            key={optIndex}
                            style={[
                              styles.optionButton,
                              { 
                                backgroundColor: colors.background.secondary,
                                borderColor: colors.background.tertiary 
                              },
                              isSelected && { borderColor: colors.accent.primary, backgroundColor: colors.background.tertiary },
                              showResult && isCorrect && { borderColor: colors.success, backgroundColor: `${colors.success}20` },
                              showResult && isSelected && !isCorrect && { borderColor: colors.error, backgroundColor: `${colors.error}20` },
                            ]}
                            onPress={() => handleAnswerSelect(question.id, optIndex)}
                            disabled={quizSubmitted}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                { color: colors.foreground.secondary },
                                isSelected && { color: colors.foreground.primary, fontWeight: '600' },
                              ]}
                            >
                              {option}
                            </Text>
                            {showResult && isCorrect && <Text style={[styles.checkmark, { color: colors.success }]}>✓</Text>}
                            {showResult && isSelected && !isCorrect && <Text style={[styles.cross, { color: colors.error }]}>✗</Text>}
                          </TouchableOpacity>
                        );
                      })}

                      {quizSubmitted && (
                        <View style={[styles.explanationBox, { backgroundColor: colors.background.secondary, borderLeftColor: colors.accent.primary }]}>
                          <Text style={[styles.explanationText, { color: colors.foreground.secondary }]}>{question.explanation}</Text>
                        </View>
                      )}
                    </VStack>
                  </Card>
                ))}

                {quizSubmitted && (
                  <Card variant="gradient" size="md">
                    <VStack gap={3} style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={[styles.scoreTitle, { color: colors.foreground.primary }]}>
                        {t('learn.quiz_score_title')}
                      </Text>
                      <Text style={[styles.scoreValue, { color: colors.accent.primary }]}>{quizScore}%</Text>
                      <Text style={[styles.scoreText, { color: colors.foreground.secondary }]}>
                        {quizScore >= (quiz?.passingScore || 70)
                          ? t('learn.quiz_passed')
                          : t('learn.quiz_failed')}
                      </Text>
                    </VStack>
                  </Card>
                )}
              </VStack>
            </Animated.View>
          )}

          {/* Navigation Buttons */}
          {!showQuiz && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <View style={styles.navigationButtons}>
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    { backgroundColor: colors.accent.primary },
                    currentSection === 0 && styles.navButtonDisabled
                  ]}
                  onPress={handlePrevious}
                  disabled={currentSection === 0}
                >
                  <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>{t('learn.previous')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.navButton, { backgroundColor: colors.accent.primary }]} 
                  onPress={handleNext}
                >
                  <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>
                    {currentSection < lesson.content.length - 1 ? t('learn.next_section') : t('learn.complete_lesson')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Quiz Buttons */}
          {showQuiz && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              {!quizSubmitted ? (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.accent.primary },
                    Object.keys(selectedAnswers).length !== quiz?.questions.length &&
                      styles.submitButtonDisabled,
                  ]}
                  onPress={handleQuizSubmit}
                  disabled={Object.keys(selectedAnswers).length !== quiz?.questions.length}
                >
                  <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>{t('learn.submit_quiz')}</Text>
                </TouchableOpacity>
              ) : (
                <VStack gap={2}>
                  {quizScore < (quiz?.passingScore || 70) && (
                    <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.warning }]} onPress={handleQuizRetry}>
                      <Text style={[styles.retryButtonText, { color: '#FFFFFF' }]}>{t('learn.retry_quiz')}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={[styles.continueButton, { borderColor: colors.accent.primary }]} 
                    onPress={() => router.back()}
                  >
                    <Text style={[styles.continueButtonText, { color: colors.accent.primary }]}>{t('common.continue')}</Text>
                  </TouchableOpacity>
                </VStack>
              )}
            </Animated.View>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  videoPlaceholder: {
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videoText: {
    fontSize: 24,
    marginBottom: 8,
  },
  videoUrl: {
    fontSize: 12,
  },
  diagramPlaceholder: {
    height: 240,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  diagramText: {
    fontSize: 24,
    marginBottom: 8,
  },
  fenText: {
    fontSize: 10,
  },
  interactivePlaceholder: {
    minHeight: 200,
    borderRadius: 12,
    padding: 20,
  },
  interactiveText: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quizSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
  },
  cross: {
    fontSize: 20,
  },
  explanationBox: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  scoreTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 16,
    textAlign: 'center',
  },
  submitButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  retryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 16,
  },
});
