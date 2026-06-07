'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '@/components/ui';
import { useReviewStore } from '@/features/review';
import type { WeakCategory, IssueCategory } from '@/types';

const dimensionLabels: Record<string, string> = {
  grammar: '语法',
  vocabulary: '词汇',
  sentenceStructure: '句型',
};

const trendLabels: Record<string, { label: string; color: string }> = {
  improving: { label: '↑ 提升中', color: 'text-success' },
  stable: { label: '→ 稳定', color: 'text-muted' },
  declining: { label: '↓ 下降中', color: 'text-error' },
};

function getMasteryColor(mastery: number): string {
  if (mastery >= 80) return 'bg-success';
  if (mastery >= 50) return 'bg-accent-amber';
  return 'bg-error';
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-body-sm text-muted w-10 text-right shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface-cream-strong overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="text-body-sm font-medium text-ink w-9 shrink-0">{score}</span>
    </div>
  );
}

export function LearningDataSection() {
  const learningData = useReviewStore((s) => s.learningData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>学习画像</CardTitle>
        <CardDescription>
          {learningData
            ? `基于 ${learningData.totalQuestions} 次作答自动生成`
            : '答题后自动生成，用于指导个性化出题'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!learningData ? (
          <p className="text-body-sm text-muted py-4 text-center">
            尚未答题，暂无学习数据
          </p>
        ) : (
          <div className="space-y-4">
            {/* 总览 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-surface-soft">
                <p className="text-display-sm text-ink">{learningData.totalQuestions}</p>
                <p className="text-caption text-muted">作答数</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-surface-soft">
                <p className="text-display-sm text-ink">{learningData.averageScore}</p>
                <p className="text-caption text-muted">均分</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-surface-soft">
                <p className={trendLabels[learningData.recentTrend]?.color ?? 'text-muted'}>
                  <span className="text-body-sm font-medium">
                    {trendLabels[learningData.recentTrend]?.label ?? '—'}
                  </span>
                </p>
                <p className="text-caption text-muted">趋势</p>
              </div>
            </div>

            {/* 维度分数 */}
            <div>
              <p className="text-caption-uppercase text-muted mb-2">各维度平均分</p>
              <div className="space-y-2">
                {(['grammar', 'vocabulary', 'sentenceStructure'] as const).map((dim) => (
                  <ScoreBar
                    key={dim}
                    label={dimensionLabels[dim]}
                    score={learningData.dimensionScores[dim]}
                  />
                ))}
              </div>
            </div>

            {/* 薄弱领域 */}
            {learningData.weakCategories.length > 0 && (
              <div>
                <p className="text-caption-uppercase text-muted mb-2">
                  薄弱领域（{learningData.weakCategories.length}）
                </p>
                <div className="space-y-1.5">
                  {learningData.weakCategories.map((w: WeakCategory) => (
                    <div
                      key={w.category}
                      className="flex items-center justify-between p-2 rounded-lg bg-surface-soft"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-ink truncate">{w.suggestedFocus}</p>
                        <p className="text-caption text-muted">
                          {w.category} · 出现 {w.frequency} 次
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2 ml-3">
                        <div className="w-12 h-1.5 rounded-full bg-surface-cream-strong overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getMasteryColor(w.mastery)}`}
                            style={{ width: `${Math.min(100, Math.max(0, w.mastery))}%` }}
                          />
                        </div>
                        <span className="text-caption text-muted w-8 text-right">{w.mastery}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 已掌握领域 */}
            {learningData.strongCategories.length > 0 && (
              <div>
                <p className="text-caption-uppercase text-muted mb-2">
                  已掌握（{learningData.strongCategories.length}）
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {learningData.strongCategories.map((cat: IssueCategory) => (
                    <Badge key={cat} variant="success" size="sm">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
