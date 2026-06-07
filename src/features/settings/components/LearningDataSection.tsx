'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';
import { useReviewStore, categoryDescription } from '@/features/review';
import Link from 'next/link';

type LevelTier = {
  label: string;
  color: string;
  summary: string;
};

function getLevelTier(avgScore: number): LevelTier {
  if (avgScore >= 85) return { label: '熟练', color: 'text-success', summary: '翻译能力扎实，能够处理复杂句式与高阶词汇' };
  if (avgScore >= 70) return { label: '进阶', color: 'text-accent-teal', summary: '具备较好的翻译基础，可挑战更高难度文本' };
  if (avgScore >= 55) return { label: '基础', color: 'text-accent-amber', summary: '掌握基本翻译技巧，词汇量和句型变化有待提升' };
  return { label: '入门', color: 'text-error', summary: '处于学习初期，建议重点巩固语法和常用词汇' };
}

export function LearningDataSection() {
  const learningData = useReviewStore((s) => s.learningData);

  const tier = learningData ? getLevelTier(learningData.averageScore) : null;
  const topWeak = learningData?.weakCategories.slice(0, 3) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>学习概览</CardTitle>
        <CardDescription>
          {learningData
            ? `基于 ${learningData.totalQuestions} 次作答`
            : '答题后自动生成'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!learningData ? (
          <p className="text-body-sm text-muted py-4 text-center">
            尚未答题，暂无学习数据
          </p>
        ) : (
          <div className="space-y-4">
            {/* 学习等级 */}
            <div className="p-4 rounded-lg bg-surface-soft text-center">
              <p className={tier ? `${tier.color} text-display-sm` : 'text-muted'}>
                {tier?.label ?? '—'}
              </p>
              <p className="text-body-sm text-body mt-1">{tier?.summary}</p>
              <div className="flex items-center justify-center gap-4 mt-3 text-caption text-muted">
                <span>均分 {learningData.averageScore}</span>
                <span>·</span>
                <span>作答 {learningData.totalQuestions} 次</span>
              </div>
            </div>

            {/* 重点关注 */}
            {topWeak.length > 0 && (
              <div>
                <p className="text-caption-uppercase text-muted mb-2">重点关注</p>
                <div className="space-y-1.5">
                  {topWeak.map((w) => (
                    <div
                      key={w.category}
                      className="flex items-center gap-2 text-body-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-error shrink-0" />
                      <span className="text-ink">
                        {categoryDescription[w.category] ?? w.category}
                      </span>
                      <span className="text-muted text-caption ml-auto">
                        掌握度 {w.mastery}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {topWeak.length === 0 && (
              <p className="text-body-sm text-muted text-center py-2">
                暂无薄弱领域，继续保持！
              </p>
            )}

            {/* 查看详情链接 */}
            <div className="text-center pt-1">
              <Link
                href="/review"
                className="text-caption text-primary hover:underline"
              >
                查看详细回顾数据 →
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
