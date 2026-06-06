'use client';

import { useState, useCallback } from 'react';
import { usePracticeStore } from '@/features/practice';
import { useSettingsStore } from '@/features/settings';
import {
  FlashCard,
  CardFront,
  CardBack,
  EmptyState,
} from '@/features/practice/components';
import { generateMockFeedback, computeTotalScore } from '@/features/practice/services/mockFeedback';
import { mockGenerateQuestions } from '@/features/practice/services/mockGenerateQuestions';
import type { AnswerRecord } from '@/types';

export default function HomePage() {
  const {
    questions,
    currentIndex,
    draft,
    isFlipped,
    isEvaluating,
    setFlipped,
    setDraft,
    nextQuestion,
    prevQuestion,
    setQuestions,
    submitAnswer,
    setEvaluating,
    answerRecords,
  } = usePracticeStore();
  const { userProfile } = useSettingsStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentRecord = currentQuestion
    ? [...answerRecords].reverse().find((r) => r.questionId === currentQuestion.id)
    : undefined;

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    const newQuestions = mockGenerateQuestions(userProfile, 10);
    setQuestions(newQuestions);
    setIsGenerating(false);
  }, [userProfile, setQuestions]);

  const handleSubmit = useCallback(async () => {
    if (!draft.trim() || !currentQuestion) return;

    setEvaluating(true);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

    const feedback = generateMockFeedback(
      currentQuestion.sourceText,
      draft,
      userProfile.translationDirection,
    );
    const score = computeTotalScore(feedback);

    const record: AnswerRecord = {
      id: `ans_${Date.now()}`,
      questionId: currentQuestion.id,
      userTranslation: draft,
      score,
      feedback,
      answeredAt: Date.now(),
    };

    submitAnswer(record);
    setEvaluating(false);
  }, [draft, currentQuestion, userProfile.translationDirection, submitAnswer, setEvaluating]);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <h1 className="text-display-sm text-ink mb-6 shrink-0">翻译练习</h1>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <EmptyState isGenerating={isGenerating} onGenerate={handleGenerate} />
        </div>
      </div>
    );
  }

  const front = currentQuestion ? (
    <CardFront
      question={currentQuestion}
      questionIndex={currentIndex}
      totalCount={questions.length}
      direction={userProfile.translationDirection}
      draft={draft}
      isEvaluating={isEvaluating}
      onDraftChange={setDraft}
      onSubmit={handleSubmit}
    />
  ) : null;

  const back = currentRecord ? (
    <CardBack
      record={currentRecord}
      isLastQuestion={currentIndex >= questions.length - 1}
      onNext={nextQuestion}
    />
  ) : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h1 className="text-display-sm text-ink mb-6 shrink-0">翻译练习</h1>
      <FlashCard
        isFlipped={isFlipped}
        onFlip={setFlipped}
        front={front}
        back={back}
        onSwipeLeft={nextQuestion}
        onSwipeRight={prevQuestion}
      />
    </div>
  );
}
