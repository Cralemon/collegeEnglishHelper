'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui';
import type { ImprovementPoint, FeedbackDimension } from '@/types';

interface ImprovementListProps {
  points: ImprovementPoint[];
  className?: string;
}

const dimensionLabel: Record<FeedbackDimension, string> = {
  grammar: '语法',
  vocabulary: '词汇',
  sentenceStructure: '句型',
};

function getMasteryVariant(mastery: number): 'success' | 'warning' | 'error' {
  if (mastery >= 80) return 'success';
  if (mastery >= 50) return 'warning';
  return 'error';
}

function getMasteryBarColor(mastery: number): string {
  if (mastery >= 80) return 'bg-success';
  if (mastery >= 50) return 'bg-accent-amber';
  return 'bg-error';
}

function getMasteryLabel(mastery: number): string {
  if (mastery >= 80) return '已掌握';
  if (mastery >= 50) return '练习中';
  return '需加强';
}

function ImprovementItem({ point }: { point: ImprovementPoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface-card border border-hairline rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full px-4 pt-4 pb-3 flex flex-col gap-3 text-left hover:bg-surface-soft transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* 上排：分类名 + 掌握度 */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-body-sm font-medium text-ink">{point.description}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                {dimensionLabel[point.dimension]}
              </Badge>
              <span className="text-caption text-muted">出现 {point.frequency} 次</span>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1 min-w-[72px]">
            <Badge variant={getMasteryVariant(point.mastery)} size="sm">
              {getMasteryLabel(point.mastery)}
            </Badge>
            <span className="text-caption text-muted">{point.mastery} / 100</span>
          </div>
        </div>

        {/* 进度条紧贴内容底部 */}
        <div className="h-1 bg-surface-soft rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', getMasteryBarColor(point.mastery))}
            style={{ width: `${point.mastery}%` }}
          />
        </div>
      </button>

      {/* 展开详情：关联记录 IDs（grid 高度动画） */}
      {point.recentIssueIds.length > 0 && (
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-4 pt-2 border-t border-hairline">
              <p className="text-caption-uppercase text-muted mb-2">关联记录</p>
              <div className="flex flex-wrap gap-1.5">
                {point.recentIssueIds.slice(0, 8).map((id) => (
                  <span
                    key={id}
                    className="text-caption text-muted bg-surface-soft px-2 py-0.5 rounded font-mono"
                  >
                    {id.slice(-8)}
                  </span>
                ))}
                {point.recentIssueIds.length > 8 && (
                  <span className="text-caption text-muted">
                    +{point.recentIssueIds.length - 8} 条
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ImprovementList({ points, className }: ImprovementListProps) {
  if (points.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-body-md text-muted">暂无改进点记录</p>
        <p className="text-body-sm text-muted mt-1">完成更多练习后会在这里显示</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {points.map((point) => (
        <ImprovementItem key={point.id} point={point} />
      ))}
    </div>
  );
}
