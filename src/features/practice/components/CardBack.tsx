'use client';

import { useCallback } from 'react';
import { usePracticeStore } from '@/features/practice/store';
import { Button } from '@/components/ui';
import { ScoreDisplay } from './ScoreDisplay';
import { FeedbackPanel } from './FeedbackPanel';
import { computeTotalScore } from '@/features/practice/services/mockFeedback';

/**
 * 卡片背面 — AI 反馈展示
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
    <div className="bg-surface-card border border-hairline rounded-xl p-6 space-y-5">
      {/* 总分 */}
      <ScoreDisplay score={score} />

      {/* 三维反馈 */}
      <FeedbackPanel feedback={currentRecord.feedback} />

      {/* 下一题按钮 */}
      <Button
        variant="primary"
        className="w-full"
        onClick={handleNext}
        disabled={isLastQuestion}
      >
        {isLastQuestion ? '已是最后一题' : '下一题 →'}
      </Button>
    </div>
  );
}
