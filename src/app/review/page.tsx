'use client';

import { useEffect } from 'react';
import { usePracticeStore } from '@/features/practice';
import { useReviewStore, computeStatistics } from '@/features/review';
import { StatsOverview, ImprovementList, ScoreTrendChart } from '@/features/review/components';

export default function ReviewPage() {
  const { answerRecords } = usePracticeStore();
  const { improvementPoints, extractImprovements } = useReviewStore();

  useEffect(() => {
    extractImprovements(answerRecords);
  }, [answerRecords, extractImprovements]);

  if (answerRecords.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <h1 className="text-display-sm text-ink mb-6 shrink-0">回顾与统计</h1>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-5xl">📊</p>
            <p className="text-title-lg text-ink">还没有练习记录</p>
            <p className="text-body-md text-muted">去首页完成练习后，统计数据会在这里显示</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = computeStatistics(answerRecords);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h1 className="text-display-sm text-ink mb-6 shrink-0">回顾与统计</h1>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-4">
        {/* 统计概览 */}
        <StatsOverview records={answerRecords} stats={stats} />

        {/* 分数趋势图（至少 3 条记录才显示） */}
        {answerRecords.length >= 3 && (
          <ScoreTrendChart records={answerRecords} />
        )}

        {/* 改进点列表 */}
        <section>
          <h2 className="text-title-md text-ink mb-3">改进点追踪</h2>
          <ImprovementList points={improvementPoints} />
        </section>
      </div>
    </div>
  );
}
