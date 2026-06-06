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

  const currentQuestion = questions[currentIndex];
  const currentRecord = currentQuestion
    ? [...answerRecords].reverse().find((r) => r.questionId === currentQuestion.id)
    : undefined;

  const handleNext = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  if (!currentRecord) return null;

  const score = computeTotalScore(currentRecord.feedback);
  const isLastQuestion = currentIndex >= questions.length - 1;

  return (
    <div className="h-full flex flex-col p-6">
      {/* 固定分数 */}
      <div className="mb-4 shrink-0">
        <ScoreDisplay score={score} />
      </div>

      {/* 可滚动反馈 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <FeedbackPanel feedback={currentRecord.feedback} />
      </div>

      {/* 固定底部 */}
      <div className="pt-4 shrink-0">
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
