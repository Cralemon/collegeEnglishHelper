'use client';

import { Button } from '@/components/ui';
import { ScoreDisplay } from './ScoreDisplay';
import { FeedbackPanel } from './FeedbackPanel';
import { computeTotalScore } from '@/features/practice/services/mockFeedback';
import type { AnswerRecord } from '@/types';

interface CardBackProps {
  record: AnswerRecord;
  isLastQuestion: boolean;
  isGenerating: boolean;
  onNext: () => void;
  onGenerateNext: () => void;
}

export function CardBack({ record, isLastQuestion, isGenerating, onNext, onGenerateNext }: CardBackProps) {
  const score = computeTotalScore(record.feedback);

  return (
    <div className="h-full flex flex-col p-4 sm:p-6">
      {/* 固定分数 */}
      <div className="mb-3 sm:mb-4 shrink-0">
        <ScoreDisplay score={score} />
      </div>

      {/* 可滚动反馈 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <FeedbackPanel feedback={record.feedback} />
      </div>

      {/* 固定底部 */}
      <div className="pt-3 sm:pt-4 shrink-0">
        {isLastQuestion ? (
          <Button
            variant="primary"
            className="w-full"
            loading={isGenerating}
            onClick={onGenerateNext}
          >
            {isGenerating ? '生成中...' : '生成下一组题目'}
          </Button>
        ) : (
          <Button
            variant="primary"
            className="w-full"
            onClick={onNext}
          >
            下一题 →
          </Button>
        )}
      </div>
    </div>
  );
}
