'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePracticeStore } from '@/features/practice';
import { useSettingsStore } from '@/features/settings';
import { useReviewStore } from '@/features/review';
import { EmptyState } from '@/features/practice/components';
import { ScoreDisplay } from '@/features/practice/components/ScoreDisplay';
import { FeedbackPanel } from '@/features/practice/components/FeedbackPanel';
import { useToast, Button, Textarea } from '@/components/ui';
import { evaluateTranslation, generateQuestions, LLMError } from '@/features/practice/services/llmClient';
import { generateMockFeedback, computeTotalScore } from '@/features/practice/services/mockFeedback';
import { mockGenerateQuestions } from '@/features/practice/services/mockGenerateQuestions';
import type { AnswerRecord, AIFeedback, TranslationDirection } from '@/types';

const SWIPE_THRESHOLD = 80;

function getDirectionLabel(direction: TranslationDirection): string {
  return direction === 'zh-en' ? '中 → 英' : '英 → 中';
}

export default function HomePage() {
  const {
    questions,
    currentIndex,
    draft,
    isEvaluating,
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
  const [showFeedback, setShowFeedback] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Swipe state
  const [dragX, setDragX] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const dragXRef = useRef(0);

  // Close menu on outside click
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

  // Reset feedback view when question changes
  useEffect(() => {
    setShowFeedback(false);
  }, [currentIndex]);

  const handleClearQuestions = useCallback(() => {
    clearQuestions();
    setMenuOpen(false);
    setShowFeedback(false);
    toast('题目已清除，作答记录保留', 'info');
  }, [clearQuestions, toast]);

  const currentQuestion = questions[currentIndex];
  const currentRecord = currentQuestion
    ? [...answerRecords].reverse().find((r) => r.questionId === currentQuestion.id)
    : undefined;

  // Check if current question already has a submitted answer in this session
  useEffect(() => {
    if (currentRecord) {
      setShowFeedback(true);
    } else {
      setShowFeedback(false);
    }
  }, [currentRecord]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setShowFeedback(false);
    toast('正在生成题目...', 'info');

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
      const answeredOld = questions.filter((q) =>
        answerRecords.some((r) => r.questionId === q.id),
      );
      const merged = [...answeredOld, ...newQuestions];
      setQuestions(merged);
      toast(
        newQuestions.length === merged.length
          ? `已生成 ${newQuestions.length} 道题目`
          : `已生成 ${newQuestions.length} 道题目（保留 ${answeredOld.length} 道已答题目）`,
        'success',
      );
    }
    setIsGenerating(false);
  }, [userProfile, llmConfig, questions, answerRecords, setQuestions, toast]);

  const handleSubmit = useCallback(async () => {
    if (!draft.trim() || !currentQuestion) return;

    setEvaluating(true);

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
    setShowFeedback(true);
    setEvaluating(false);
  }, [draft, currentQuestion, userProfile, llmConfig, submitAnswer, setEvaluating, toast]);

  // Swipe handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select, summary, details')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    startX.current = e.clientX;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    dragXRef.current = dx;
    setDragX(dx);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = dragXRef.current;
    if (dx < -SWIPE_THRESHOLD) {
      setShowFeedback(false);
      nextQuestion();
    } else if (dx > SWIPE_THRESHOLD) {
      setShowFeedback(false);
      prevQuestion();
    }
    dragXRef.current = 0;
    setDragX(0);
  }, [nextQuestion, prevQuestion]);

  const handleNext = useCallback(() => {
    setShowFeedback(false);
    nextQuestion();
  }, [nextQuestion]);

  const handlePrev = useCallback(() => {
    setShowFeedback(false);
    prevQuestion();
  }, [prevQuestion]);

  // Move focus to textarea when entering practice view, then scroll to top
  useEffect(() => {
    if (!showFeedback && currentQuestion && textareaRef.current) {
      textareaRef.current.focus();
      // On mobile, browsers auto-scroll to the focused element.
      // Force scroll back to page top so the source text is visible.
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      });
    }
  }, [showFeedback, currentQuestion]);

  // ===== Title Bar =====
  const titleBar = (
    <div className="flex items-center justify-between pt-4 sm:pt-5 mb-4 sm:mb-5 shrink-0">
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

  // ===== Empty State =====
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

  const direction = currentQuestion?.translationDirection ?? userProfile.translationDirection;

  // ===== Practice View =====
  const practiceView = (
    <motion.div
      key={`practice-${currentIndex}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex-1 min-h-0 flex flex-col"
    >
      {/* Header: direction badge + progress */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 shrink-0">
        <span className="text-caption-uppercase text-muted bg-surface-card px-2.5 py-1 rounded-pill">
          {getDirectionLabel(direction)}
        </span>
        <span className="text-caption text-muted">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Desktop: two-column layout; Mobile: single column */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:gap-6">
        {/* Left: Source Text */}
        <div className="shrink-0 lg:flex-1 lg:min-h-0 lg:flex lg:flex-col lg:justify-start lg:pt-1">
          <div className="relative bg-surface-soft border-l-2 border-primary rounded-r-lg p-3 sm:p-4 mb-3 lg:mb-0 lg:min-h-0">
            <p className="text-caption-uppercase text-muted mb-1.5">原文</p>
            <p className="text-body-md sm:text-[17px] lg:text-[19px] text-ink leading-relaxed break-words">
              {currentQuestion?.sourceText}
            </p>
          </div>
        </div>

        {/* Right: Translation workspace */}
        <div className="flex flex-col flex-1 min-h-0 gap-2 sm:gap-3">
          <div className="flex-1 min-h-0">
            <Textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="输入你的翻译..."
              className="h-full resize-none !text-[18px] sm:!text-[20px]"
              wrapperClassName="h-full"
              disabled={isEvaluating}
            />
          </div>

          <div className="shrink-0">
            <Button
              variant="primary"
              className="w-full"
              disabled={!draft.trim() || isEvaluating}
              loading={isEvaluating}
              onClick={handleSubmit}
            >
              {isEvaluating ? '评估中...' : '提交翻译'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ===== Feedback View =====
  const feedbackView = currentRecord ? (
    <motion.div
      key={`feedback-${currentIndex}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex-1 min-h-0 flex flex-col"
    >
      {/* Header: direction badge + progress */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 shrink-0">
        <span className="text-caption-uppercase text-muted bg-surface-card px-2.5 py-1 rounded-pill">
          {getDirectionLabel(direction)}
        </span>
        <span className="text-caption text-muted">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Desktop two-column; Mobile single column */}
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto lg:flex-row lg:overflow-hidden lg:gap-6">
        {/* Left: Source + Comparison */}
        <div className="shrink-0 space-y-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
          {/* Score */}
          <div className="bg-surface-card border border-hairline rounded-xl p-3 sm:p-4">
            <ScoreDisplay score={computeTotalScore(currentRecord.feedback)} />
          </div>

          {/* Source ↔ Translation */}
          <div className="space-y-2 p-3 sm:p-4 rounded-xl bg-surface-soft text-body-sm">
            <div className="flex items-start gap-1.5">
              <span className="text-caption text-muted shrink-0 mt-px">原文</span>
              <span className="text-ink">{currentQuestion?.sourceText ?? '(已删除)'}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-caption text-muted shrink-0 mt-px">你的翻译</span>
              <span className="text-ink">{currentRecord.userTranslation}</span>
            </div>
          </div>
        </div>

        {/* Right: Feedback + Next */}
        <div className="flex flex-col flex-1 min-h-0 mt-3 lg:mt-0">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <FeedbackPanel feedback={currentRecord.feedback} />
          </div>

          {/* Next button */}
          <div className="shrink-0 pt-3 sm:pt-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleNext}
            >
              下一题 →
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  ) : null;

  // ===== Navigation Bar =====
  const navBar = (
    <div className="flex items-center justify-between pt-2 sm:pt-3 shrink-0 mb-24 md:mb-6">
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="text-nav-link text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-1"
      >
        ← 上一题
      </button>
      <span className="text-caption text-muted-soft">
        {currentIndex + 1} / {questions.length}
      </span>
      <button
        onClick={handleNext}
        disabled={currentIndex >= questions.length - 1}
        className="text-nav-link text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-1"
      >
        下一题 →
      </button>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {titleBar}

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex-1 min-h-0 flex flex-col touch-pan-y select-none"
      >
        <AnimatePresence mode="wait">
          {showFeedback && currentRecord ? feedbackView : practiceView}
        </AnimatePresence>

        {navBar}
      </div>
    </div>
  );
}
