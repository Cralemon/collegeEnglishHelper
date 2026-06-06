'use client';

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/utils/cn';
import type { AnswerRecord } from '@/types';

interface ScoreTrendChartProps {
  records: AnswerRecord[];
  className?: string;
}

interface ChartPoint {
  label: string;
  score: number;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function buildChartData(records: AnswerRecord[]): ChartPoint[] {
  return records
    .slice(-20)
    .map((r) => ({ label: formatDate(r.answeredAt), score: r.score }));
}

export function ScoreTrendChart({ records, className }: ScoreTrendChartProps) {
  const data = buildChartData(records);

  return (
    <div className={cn('bg-surface-card border border-hairline rounded-xl p-4', className)}>
      <p className="text-caption-uppercase text-muted mb-4">分数趋势（近 {data.length} 次）</p>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-hairline)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-hairline)',
              borderRadius: '8px',
              fontSize: 12,
              color: 'var(--color-ink)',
            }}
            formatter={(value) => [`${value} 分`, '得分']}
            labelStyle={{ color: 'var(--color-muted)' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#scoreGrad)"
            dot={{ r: 3, fill: 'var(--color-primary)', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'var(--color-primary)', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
