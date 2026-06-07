'use client';

import { useEffect } from 'react';
import { usePracticeStore } from '@/features/practice';
import { useReviewStore, computeDirectionSplitStats } from '@/features/review';
import { StatsOverview, ImprovementList, ScoreTrendChart, AnswerHistory } from '@/features/review/components';
import { ScrollFade } from '@/components/layout/ScrollFade';
import { HeaderPortal } from '@/components/layout/HeaderPortal';

function ReviewHeader() {
  return (
    <div className="px-4 md:px-8 md:pl-[88px] pt-4 pb-2">
      <h1 className="text-display-sm text-ink mb-4">回顾与统计</h1>
    </div>
  );
}

export default function ReviewPage() {
  const { answerRecords, questions } = usePracticeStore();
  const { improvementPoints, extractImprovements } = useReviewStore();

  useEffect(() => {
    extractImprovements(answerRecords);
  }, [answerRecords, extractImprovements]);

  if (answerRecords.length === 0) {
    return (
      <>
        <HeaderPortal>
          <ReviewHeader />
        </HeaderPortal>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-5xl">📊</p>
            <p className="text-title-lg text-ink">还没有练习记录</p>
            <p className="text-body-md text-muted">去首页完成练习后，统计数据会在这里显示</p>
          </div>
        </div>
      </>
    );
  }

  const { enzh, zhen } = computeDirectionSplitStats(answerRecords, questions);

  return (
    <>
      <HeaderPortal>
        <ReviewHeader />
      </HeaderPortal>
      <div className="flex flex-col flex-1 min-h-0">
        <ScrollFade>
          <div className="space-y-4 pt-18 pb-24">
            {/* 统计概览（按方向拆分） */}
            <StatsOverview
              enzhRecords={enzh.records}
              zhenRecords={zhen.records}
              enzhStats={enzh.stats}
              zhenStats={zhen.stats}
            />

            {/* 分数趋势图（至少 3 条记录才显示） */}
            {answerRecords.length >= 3 && (
              <ScoreTrendChart records={answerRecords} />
            )}

            {/* 答题记录 */}
            <AnswerHistory />

            {/* 改进点列表 */}
            <section>
              <h2 className="text-title-md text-ink mb-3">改进点追踪</h2>
              <ImprovementList points={improvementPoints} />
            </section>
          </div>
        </ScrollFade>
      </div>
    </>
  );
}
