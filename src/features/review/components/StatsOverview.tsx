import { cn } from '@/utils/cn';
import type { AnswerRecord } from '@/types';
import type { PracticeStatistics } from '@/features/review/store';

interface StatsOverviewProps {
  records: AnswerRecord[];
  stats: PracticeStatistics;
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
    <div className="bg-surface-card border border-hairline rounded-xl p-4 flex flex-col gap-1">
      <p className="text-caption-uppercase text-muted">{label}</p>
      <p className={cn('text-display-sm leading-none', valueColor ?? 'text-ink')}>{value}</p>
      {sub && <p className="text-caption text-muted">{sub}</p>}
    </div>
  );
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

export function StatsOverview({ records, stats, className }: StatsOverviewProps) {
  const grammarAvg = getDimensionAvg(records, 'grammar');
  const vocabAvg = getDimensionAvg(records, 'vocabulary');
  const structAvg = getDimensionAvg(records, 'sentenceStructure');

  return (
    <div className={cn('space-y-3', className)}>
      {/* 主要数据 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
      <div className="bg-surface-card border border-hairline rounded-xl p-4 space-y-3">
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
    </div>
  );
}
