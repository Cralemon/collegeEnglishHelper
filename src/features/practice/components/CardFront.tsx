'use client';

import { Button, Textarea } from '@/components/ui';
import type { Question, TranslationDirection } from '@/types';

interface CardFrontProps {
  question: Question;
  questionIndex: number;
  totalCount: number;
  direction: TranslationDirection;
  draft: string;
  isEvaluating: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
}

function getDirectionLabel(direction: TranslationDirection): string {
  return direction === 'zh-en' ? '中 → 英' : '英 → 中';
}

export function CardFront({
  question,
  questionIndex,
  totalCount,
  direction,
  draft,
  isEvaluating,
  onDraftChange,
  onSubmit,
}: CardFrontProps) {
  return (
    <div className="h-full flex flex-col p-4 gap-3 sm:p-6 sm:gap-4">
      {/* 固定头部 */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-caption-uppercase text-muted bg-surface-soft px-3 py-1 rounded-pill">
          {getDirectionLabel(direction)}
        </span>
        <span className="text-caption text-muted">
          {questionIndex + 1} / {totalCount}
        </span>
      </div>

      {/* 原文 */}
      <p className="text-body-md text-ink leading-relaxed shrink-0 break-words">
        {question.sourceText}
      </p>

      {/* textarea 满高 */}
      <div className="flex-1 min-h-0">
        <Textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
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
          disabled={!draft.trim() || isEvaluating}
          loading={isEvaluating}
          onClick={onSubmit}
        >
          {isEvaluating ? '评估中...' : '提交翻译'}
        </Button>
      </div>
    </div>
  );
}
