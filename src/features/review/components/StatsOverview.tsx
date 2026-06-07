import { cn } from '@/utils/cn';
import type { AnswerRecord } from '@/types';
import type { PracticeStatistics } from '@/features/review/store';

interface StatsOverviewProps {
  /** 英译汉记录 */
  enzhRecords: AnswerRecord[];
  /** 汉译英记录 */
  zhenRecords: AnswerRecord[];
  /** 英译汉统计 */
  enzhStats: PracticeStatistics;
  /** 汉译英统计 */
  zhenStats: PracticeStatistics;
  className?: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  valueColor?: string;
}

function StatCard({ label, value, sub, valueColor }: StatCardProps) {
  return (
    <div className="bg-surface-card border border-hairline rounded-xl p-3 sm:p-4 flex flex-col gap-1">
      <p className="text-caption-uppercase text-muted">{label}</p>
      <p className={cn('text-[28px] sm:text-4xl lg:text-5xl leading-none font-bold', valueColor ?? 'text-ink')}>{value}</p>
      {sub && <p className="text-body-sm text-muted">{sub}</p>}
    </div>
  );
}

interface DirectionSectionProps {
  label: string;
  directionLabel: string;
  records: AnswerRecord[];
  stats: PracticeStatistics;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-accent-amber';
  return 'text-error';
}

function getDimensionAvg(records: AnswerRecord[], dim: 'grammar' | 'vocabulary' | 'sentenceStructure'): number {
  if (records.length === 0) return 0;
  const sum = records.reduce((acc, r) => acc + (r.feedback[dim]?.score ?? 0), 0);
  return Math.round(sum / records.length);
}

const dimensionLabel: Record<'grammar' | 'vocabulary' | 'sentenceStructure', string> = {
  grammar: '语法',
  vocabulary: '词汇',
  sentenceStructure: '句型',
};

function DirectionSection({ label, directionLabel, records, stats }: DirectionSectionProps) {
  const grammarAvg = getDimensionAvg(records, 'grammar');
  const vocabAvg = getDimensionAvg(records, 'vocabulary');
  const structAvg = getDimensionAvg(records, 'sentenceStructure');
  const hasRecords = records.length > 0;

  return (
    <div className="space-y-3">
      {/* 方向标签 */}
      <div className="flex items-center gap-2">
        <span className="text-caption-uppercase text-muted bg-surface-soft px-2.5 py-1 rounded-pill">
          {directionLabel}
        </span>
        <span className="text-caption text-muted">{hasRecords ? `${records.length} 次练习` : ''}</span>
      </div>

      {hasRecords ? (
        <>
          {/* 主要数据 */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
            <StatCard label="刷题数" value={stats.totalAnswers} sub="道题" />
            <StatCard
              label="平均分"
              value={stats.averageScore}
              sub="/ 100"
              valueColor={getScoreColor(stats.averageScore)}
            />
            <StatCard
              label="最高分"
              value={stats.maxScore}
              sub="/ 100"
              valueColor="text-success"
            />
            <StatCard
              label="最低分"
              value={stats.minScore}
              sub="/ 100"
              valueColor={getScoreColor(stats.minScore)}
            />
          </div>

          {/* 三维度平均分 */}
          <div className="bg-surface-card border border-hairline rounded-xl p-3 sm:p-4 space-y-3">
            <p className="text-caption-uppercase text-muted">维度平均分</p>
            {(
              [
                ['grammar', grammarAvg],
                ['vocabulary', vocabAvg],
                ['sentenceStructure', structAvg],
              ] as const
            ).map(([dim, avg]) => (
              <div key={dim} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-ink">{dimensionLabel[dim]}</span>
                  <span className={cn('text-body-sm font-medium', getScoreColor(avg))}>{avg}</span>
                </div>
                <div className="h-1.5 bg-surface-soft rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      avg >= 80 ? 'bg-success' : avg >= 60 ? 'bg-accent-amber' : 'bg-error',
                    )}
                    style={{ width: `${avg}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-surface-card border border-hairline rounded-xl p-6 text-center">
          <p className="text-body-sm text-muted">暂无{label}练习记录</p>
        </div>
      )}
    </div>
  );
}

export function StatsOverview({ enzhRecords, zhenRecords, enzhStats, zhenStats, className }: StatsOverviewProps) {
  return (
    <div className={cn('space-y-5', className)}>
      <DirectionSection label="英译汉" directionLabel="英 → 中" records={enzhRecords} stats={enzhStats} />
      <DirectionSection label="汉译英" directionLabel="中 → 英" records={zhenRecords} stats={zhenStats} />
    </div>
  );
}
