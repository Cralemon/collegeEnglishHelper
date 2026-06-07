'use client';

import { Button } from '@/components/ui';
import { ScoreDisplay } from './ScoreDisplay';
import { FeedbackPanel } from './FeedbackPanel';
import { computeTotalScore } from '@/features/practice/services/mockFeedback';
import type { AnswerRecord } from '@/types';

interface CardBackProps {
  record: AnswerRecord;
  /** 当前题目原文，用于与用户翻译对照 */
  sourceText: string;
  isLastQuestion: boolean;
  isGenerating: boolean;
  onNext: () => void;
  onGenerateNext: () => void;
}

export function CardBack({
  record,
  sourceText,
  isLastQuestion,
  isGenerating,
  onNext,
  onGenerateNext,
}: CardBackProps) {
  const score = computeTotalScore(record.feedback);

  return (
    <div className="h-full flex flex-col p-3 gap-2 sm:p-4 sm:gap-3 md:p-5 lg:p-6 lg:gap-4">
      {/* 固定分数 */}
      <div className="shrink-0">
        <ScoreDisplay score={score} />
      </div>

      {/* 题目与答案对照 */}
      <div className="shrink-0 space-y-1 p-2 sm:p-2.5 md:p-3 rounded-lg bg-surface-soft text-body-sm">
        <div className="flex items-start gap-1.5">
          <span className="text-caption text-muted shrink-0 mt-px">原文</span>
          <span className="text-ink">{sourceText}</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-caption text-muted shrink-0 mt-px">你的翻译</span>
          <span className="text-ink">{record.userTranslation}</span>
        </div>
      </div>

      {/* 可滚动反馈 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <FeedbackPanel feedback={record.feedback} />
      </div>

      {/* 固定底部 */}
      <div className="shrink-0">
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
