'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePracticeStore } from '@/features/practice';
import { ScoreDisplay } from '@/features/practice/components/ScoreDisplay';
import { FeedbackPanel } from '@/features/practice/components/FeedbackPanel';
import { computeTotalScore } from '@/features/practice/services/mockFeedback';
import { ScrollFade } from '@/components/layout/ScrollFade';
import { Button } from '@/components/ui';

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function DetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const recordId = searchParams.get('id');
  const answerRecords = usePracticeStore((s) => s.answerRecords);
  const questions = usePracticeStore((s) => s.questions);

  const record = useMemo(
    () => (recordId ? answerRecords.find((r) => r.id === recordId) : undefined),
    [recordId, answerRecords],
  );

  const question = useMemo(
    () => (record ? questions.find((q) => q.id === record.questionId) : undefined),
    [record, questions],
  );

  if (!record) {
    return (
      <motion.div
        className="flex flex-col flex-1 min-h-0"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <h1 className="text-display-sm text-ink mb-6 shrink-0">作答详情</h1>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-body-md text-muted">未找到该作答记录</p>
            <Button variant="outline" onClick={() => router.back()}>
              ← 返回
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  const score = computeTotalScore(record.feedback);

  return (
    <motion.div
      className="flex flex-col flex-1 min-h-0"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* 标题栏 */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-surface-card transition-colors shrink-0"
          aria-label="返回"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.5 3L5.5 8l5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-title-md text-ink">作答详情</h1>
          <p className="text-caption text-muted">{formatDate(record.answeredAt)}</p>
        </div>
      </div>

      {/* 内容区（带渐隐） */}
      <ScrollFade>
        <div className="space-y-4 pb-4">
          {/* 分数 */}
          <div className="bg-surface-card border border-hairline rounded-xl p-4">
            <ScoreDisplay score={score} />
          </div>

          {/* 题目与答案 */}
          <div className="bg-surface-card border border-hairline rounded-xl p-4 space-y-3">
            <div>
              <p className="text-caption-uppercase text-muted mb-1">原文</p>
              <p className="text-body-md text-ink">{question?.sourceText ?? '(题目已删除)'}</p>
            </div>
            <div>
              <p className="text-caption-uppercase text-muted mb-1">你的翻译</p>
              <p className="text-body-md text-ink leading-relaxed bg-surface-soft rounded-lg p-3">
                {record.userTranslation}
              </p>
            </div>
          </div>

          {/* AI 反馈 */}
          <div className="bg-surface-card border border-hairline rounded-xl p-4">
            <p className="text-caption-uppercase text-muted mb-3">AI 反馈</p>
            <FeedbackPanel feedback={record.feedback} />
          </div>
        </div>
      </ScrollFade>
    </motion.div>
  );
}

export default function AnswerDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col flex-1 min-h-0">
          <h1 className="text-display-sm text-ink mb-6 shrink-0">作答详情</h1>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-body-sm text-muted">加载中...</p>
          </div>
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
