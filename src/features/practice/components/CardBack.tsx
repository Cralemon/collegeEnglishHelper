'use client';

import { useCallback } from 'react';
import { usePracticeStore } from '@/features/practice/store';
import { Button } from '@/components/ui';
import { ScoreDisplay } from './ScoreDisplay';
import { FeedbackPanel } from './FeedbackPanel';
import { computeTotalScore } from '@/features/practice/services/mockFeedback';

/**
 * 卡片背面 — AI 反馈展示
 *
 * 布局：固定分数 + 可滚动反馈区 + 固定底部
 */
export function CardBack() {
  const { answerRecords, nextQuestion, questions, currentIndex } =
    usePracticeStore();

  // 获取当前题目的最新作答记录
  const currentQuestion = questions[currentIndex];
  const currentRecord = currentQuestion
    ? [...answerRecords]
        .reverse()
        .find((r) => r.questionId === currentQuestion.id)
    : undefined;

  const handleNext = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  if (!currentRecord) return null;

  const score = computeTotalScore(currentRecord.feedback);
  const isLastQuestion = currentIndex >= questions.length - 1;

  return (
    <div className="bg-surface-card h-full flex flex-col rounded-xl">
      {/* 固定分数 */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <ScoreDisplay score={score} />
      </div>

      {/* 可滚动反馈区 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-3">
        <FeedbackPanel feedback={currentRecord.feedback} />
      </div>

      {/* 固定底部：下一题按钮 */}
      <div className="px-6 pb-5 pt-2 shrink-0">
        <Button
          variant="primary"
          className="w-full"
          onClick={handleNext}
          disabled={isLastQuestion}
        >
          {isLastQuestion ? '已是最后一题' : '下一题 →'}
        </Button>
      </div>
    </div>
  );
}
