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
import { useToast } from '@/components/ui';
import { evaluateTranslation, generateQuestions, LLMError } from '@/features/practice/services/llmClient';
import { generateMockFeedback, computeTotalScore } from '@/features/practice/services/mockFeedback';
import { mockGenerateQuestions } from '@/features/practice/services/mockGenerateQuestions';
import type { AnswerRecord, AIFeedback } from '@/types';

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
  const { userProfile, llmConfig } = useSettingsStore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentRecord = currentQuestion
    ? [...answerRecords].reverse().find((r) => r.questionId === currentQuestion.id)
    : undefined;

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);

    let newQuestions: typeof questions;
    try {
      newQuestions = await generateQuestions(llmConfig, {
        direction: userProfile.translationDirection,
        gradeLevel: userProfile.gradeLevel,
        vocabularyLevel: userProfile.vocabularyLevel,
        presetTopics: userProfile.topicPreference.presetTopics,
        customTopics: userProfile.topicPreference.customTopics,
        count: 10,
        existingTexts: questions.map((q) => q.sourceText),
      });
    } catch (err) {
      if (err instanceof LLMError) {
        if (err.code === 'NO_API_KEY') {
          toast('请先在设置中配置 API Key', 'error');
          setIsGenerating(false);
          return;
        }
        toast(`题目生成失败，已使用本地数据：${err.message}`, 'warning');
      } else {
        toast('题目生成失败，已使用本地数据', 'warning');
      }
      newQuestions = mockGenerateQuestions(userProfile, 10);
    }

    if (newQuestions.length > 0) {
      setQuestions(newQuestions);
    }
    setIsGenerating(false);
  }, [userProfile, llmConfig, questions, setQuestions, toast]);

  const handleSubmit = useCallback(async () => {
    if (!draft.trim() || !currentQuestion) return;

    setEvaluating(true);

    let feedback: AIFeedback;
    try {
      feedback = await evaluateTranslation(llmConfig, {
        sourceText: currentQuestion.sourceText,
        userTranslation: draft,
        direction: userProfile.translationDirection,
        gradeLevel: userProfile.gradeLevel,
        vocabularyLevel: userProfile.vocabularyLevel,
      });
    } catch (err) {
      if (err instanceof LLMError) {
        if (err.code === 'NO_API_KEY') {
          toast('请先在设置中配置 API Key', 'error');
          setEvaluating(false);
          return;
        }
        toast(`翻译评估失败，已使用本地数据：${err.message}`, 'warning');
      } else {
        toast('翻译评估失败，已使用本地数据', 'warning');
      }
      feedback = generateMockFeedback(
        currentQuestion.sourceText,
        draft,
        userProfile.translationDirection,
      );
    }

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
  }, [draft, currentQuestion, userProfile.translationDirection, userProfile.gradeLevel, userProfile.vocabularyLevel, llmConfig, submitAnswer, setEvaluating, toast]);

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
      isGenerating={isGenerating}
      onNext={nextQuestion}
      onGenerateNext={handleGenerate}
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
