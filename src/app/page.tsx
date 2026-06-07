'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { usePracticeStore } from '@/features/practice';
import { useSettingsStore } from '@/features/settings';
import { useReviewStore } from '@/features/review';
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
    clearQuestions,
  } = usePracticeStore();
  const { userProfile, llmConfig } = useSettingsStore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击菜单外部关闭
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleClearQuestions = useCallback(() => {
    clearQuestions();
    setMenuOpen(false);
    toast('题目已清除，作答记录保留', 'info');
  }, [clearQuestions, toast]);

  const currentQuestion = questions[currentIndex];
  const currentRecord = currentQuestion
    ? [...answerRecords].reverse().find((r) => r.questionId === currentQuestion.id)
    : undefined;

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    toast('正在生成题目...', 'info');

    // Phase 9: 读取薄弱领域用于驱动出题
    const { learningData } = useReviewStore.getState();
    const weakCategories = learningData?.weakCategories ?? [];

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
        weakCategories,
      });
    } catch (err) {
      if (err instanceof LLMError) {
        if (err.code === 'NO_API_KEY') {
          toast('请先在设置中配置 API Key', 'error');
          setIsGenerating(false);
          return;
        }
        toast(`题目生成失败，已使用本地数据`, 'warning');
      } else {
        toast('题目生成失败，已使用本地数据', 'warning');
      }
      newQuestions = mockGenerateQuestions(userProfile, 10);
    }

    if (newQuestions.length > 0) {
      setQuestions(newQuestions);
      toast(`已生成 ${newQuestions.length} 道题目`, 'success');
    }
    setIsGenerating(false);
  }, [userProfile, llmConfig, questions, setQuestions, toast]);

  const handleSubmit = useCallback(async () => {
    if (!draft.trim() || !currentQuestion) return;

    setEvaluating(true);

    // Phase 9: 读取薄弱领域辅助评估
    const { learningData: ld } = useReviewStore.getState();
    const submitWeakCategories = ld?.weakCategories ?? [];

    let feedback: AIFeedback;
    try {
      feedback = await evaluateTranslation(llmConfig, {
        sourceText: currentQuestion.sourceText,
        userTranslation: draft,
        direction: userProfile.translationDirection,
        gradeLevel: userProfile.gradeLevel,
        vocabularyLevel: userProfile.vocabularyLevel,
        weakCategories: submitWeakCategories,
      });
    } catch (err) {
      if (err instanceof LLMError) {
        if (err.code === 'NO_API_KEY') {
          toast('请先在设置中配置 API Key', 'error');
          setEvaluating(false);
          return;
        }
        toast(`翻译评估失败，已使用本地数据`, 'warning');
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

  // 标题栏（含菜单按钮）
  const titleBar = (
    <div className="flex items-center justify-between mb-6 shrink-0">
      <h1 className="text-display-sm text-ink">翻译练习</h1>
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-surface-card transition-colors"
          aria-label="更多操作"
        >
          <svg width="18" height="4" viewBox="0 0 18 4" fill="currentColor">
            <circle cx="2" cy="2" r="2" />
            <circle cx="9" cy="2" r="2" />
            <circle cx="16" cy="2" r="2" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-surface-card border border-hairline rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={() => { setMenuOpen(false); handleGenerate(); }}
              disabled={isGenerating}
              className="w-full text-left px-4 py-2.5 text-body-sm text-ink hover:bg-surface-soft transition-colors"
            >
              重新生成题目
            </button>
            <button
              onClick={handleClearQuestions}
              className="w-full text-left px-4 py-2.5 text-body-sm text-ink hover:bg-surface-soft transition-colors"
            >
              清除当前题目
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (questions.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        {titleBar}
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
      {titleBar}
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
