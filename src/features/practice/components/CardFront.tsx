'use client';

import { useCallback } from 'react';
import { usePracticeStore } from '@/features/practice/store';
import { useSettingsStore } from '@/features/settings/store';
import { Button, Textarea } from '@/components/ui';
import { generateMockFeedback, computeTotalScore } from '@/features/practice/services/mockFeedback';
import type { AnswerRecord, TranslationDirection } from '@/types';

function getDirectionLabel(direction: TranslationDirection): string {
  return direction === 'zh-en' ? '中 → 英' : '英 → 中';
}

/**
 * 卡片正面 — 题目 + 输入 + 提交
 *
 * 布局：固定头部 / textarea 满高 / 固定底部按钮
 */
export function CardFront() {
  const {
    questions,
    currentIndex,
    draft,
    isEvaluating,
    setDraft,
    submitAnswer,
    setEvaluating,
  } = usePracticeStore();

  const { userProfile } = useSettingsStore();

  const question = questions[currentIndex];
  const direction = userProfile.translationDirection;

  const handleSubmit = useCallback(async () => {
    if (!draft.trim() || !question) return;

    setEvaluating(true);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

    const feedback = generateMockFeedback(question.sourceText, draft, direction);
    const score = computeTotalScore(feedback);

    const record: AnswerRecord = {
      id: `ans_${Date.now()}`,
      questionId: question.id,
      userTranslation: draft,
      score,
      feedback,
      answeredAt: Date.now(),
    };

    submitAnswer(record);
    setEvaluating(false);
  }, [draft, question, direction, submitAnswer, setEvaluating]);

  if (!question) return null;

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      {/* 固定头部 */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-caption-uppercase text-muted bg-surface-soft px-3 py-1 rounded-pill">
          {getDirectionLabel(direction)}
        </span>
        <span className="text-caption text-muted">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* 原文 */}
      <p className="text-body-md text-ink leading-relaxed shrink-0">
        {question.sourceText}
      </p>

      {/* textarea 满高 */}
      <div className="flex-1 min-h-0">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="请输入你的翻译..."
          className="h-full resize-none"
          wrapperClassName="h-full"
          disabled={isEvaluating}
        />
      </div>

      {/* 固定底部按钮 */}
      <div className="shrink-0">
        <Button
          variant="primary"
          className="w-full"
          disabled={!draft.trim()}
          loading={isEvaluating}
          onClick={handleSubmit}
        >
          {isEvaluating ? '评估中...' : '提交翻译'}
        </Button>
      </div>
    </div>
  );
}
