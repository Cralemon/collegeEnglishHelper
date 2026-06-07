'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import type { AnswerRecord } from '@/types';

interface ScoreTrendChartProps {
  records: AnswerRecord[];
  className?: string;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

interface ChartDatum {
  label: string;
  score: number;
}

function buildChartData(records: AnswerRecord[]): ChartDatum[] {
  return records
    .slice(-20)
    .map((r) => ({ label: formatDate(r.answeredAt), score: r.score }));
}

// Layout constants
const PAD_L = 32;
const PAD_R = 16;
const PAD_T = 12;
const PAD_B = 20;
const W = 400;
const H = 160;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

/** Y=0 (top) → score=100, Y=PLOT_H (bottom) → score=0 */
function y(score: number): number {
  return PAD_T + PLOT_H * (1 - Math.min(100, Math.max(0, score)) / 100);
}

function x(i: number, total: number): number {
  if (total <= 1) return PAD_L + PLOT_W / 2;
  return PAD_L + (PLOT_W / (total - 1)) * i;
}

export function ScoreTrendChart({ records, className }: ScoreTrendChartProps) {
  const data = buildChartData(records);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    score: number;
  } | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      // Find nearest data point
      let nearest: ChartDatum | null = null;
      let nearestDist = Infinity;
      for (let i = 0; i < data.length; i++) {
        const px = x(i, data.length);
        const py = y(data[i].score);
        const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = data[i];
        }
      }

      if (nearest && nearestDist < 40) {
        setTooltip({
          x: (e.clientX - rect.left) / scaleX,
          y: (e.clientY - rect.top) / scaleY,
          label: nearest.label,
          score: nearest.score,
        });
      } else {
        setTooltip(null);
      }
    },
    [data],
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  if (data.length === 0) {
    return (
      <div className={cn('bg-surface-card border border-hairline rounded-xl p-4', className)}>
        <p className="text-caption-uppercase text-muted mb-4">分数趋势</p>
        <p className="text-body-sm text-muted text-center py-8">暂无数据</p>
      </div>
    );
  }

  // Build area path + line polyline
  const areaPoints: string[] = [];
  const linePoints: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const px = x(i, data.length);
    const py = y(data[i].score);
    linePoints.push(`${px},${py}`);
    areaPoints.push(`${px},${py}`);
  }
  // Close area path: bottom-right → bottom-left → back to first point
  areaPoints.push(`${x(data.length - 1, data.length)},${y(0)}`);
  areaPoints.push(`${x(0, data.length)},${y(0)}`);
  const areaD = `M${areaPoints.join(' L')} Z`;
  const lineD = `M${linePoints.join(' L')}`;

  // Grid lines at 0, 50, 100
  const gridTicks = [0, 50, 100];

  // X-axis labels (max 8 to avoid overcrowding)
  const xLabelStep = Math.max(1, Math.ceil(data.length / 8));
  const xLabels = data.filter((_, i) => i % xLabelStep === 0);

  return (
    <div className={cn('bg-surface-card border border-hairline rounded-xl p-4', className)}>
      <p className="text-caption-uppercase text-muted mb-4">分数趋势（近 {data.length} 次）</p>
      <div className="relative w-full" style={{ maxHeight: H }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          style={{ maxHeight: H }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Gradient */}
          <defs>
            <linearGradient id="scoreGradSvg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD_L}
                y1={y(tick)}
                x2={W - PAD_R}
                y2={y(tick)}
                stroke="var(--color-hairline)"
                strokeDasharray="3 3"
              />
              <text
                x={PAD_L - 4}
                y={y(tick) + 4}
                textAnchor="end"
                fontSize={11}
                fill="var(--color-muted)"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#scoreGradSvg)" />

          {/* Line */}
          <path
            d={lineD}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Dots */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={x(i, data.length)}
              cy={y(d.score)}
              r={3}
              fill="var(--color-primary)"
            />
          ))}

          {/* X-axis labels */}
          {xLabels.map((d, i) => {
            const idx = data.indexOf(d);
            return (
              <text
                key={i}
                x={x(idx, data.length)}
                y={H - 2}
                textAnchor="middle"
                fontSize={10}
                fill="var(--color-muted)"
              >
                {d.label}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-surface-card border border-hairline rounded-lg px-2.5 py-1.5 shadow-elevated z-10"
            style={{
              left: `${(tooltip.x / W) * 100}%`,
              top: `${(tooltip.y / H) * 100}%`,
              transform: 'translate(-50%, -130%)',
            }}
          >
            <p className="text-caption text-muted">{tooltip.label}</p>
            <p className="text-body-sm font-medium text-ink">{tooltip.score} 分</p>
          </div>
        )}
      </div>
    </div>
  );
}
