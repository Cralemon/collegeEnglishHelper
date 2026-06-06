import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui';
import type { AIFeedback, DimensionFeedback, FeedbackDimension } from '@/types';

interface FeedbackPanelProps {
  /** AI 反馈数据 */
  feedback: AIFeedback;
  /** 自定义类名 */
  className?: string;
}

const dimensionConfig: Record<
  FeedbackDimension,
  { label: string; icon: string }
> = {
  grammar: { label: '语法', icon: '✅' },
  vocabulary: { label: '词汇', icon: '📚' },
  sentenceStructure: { label: '句型', icon: '🏗️' },
};

function getScoreBadgeVariant(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}

function DimensionSection({
  dimension,
  feedback,
}: {
  dimension: FeedbackDimension;
  feedback: DimensionFeedback;
}) {
  const config = dimensionConfig[dimension];

  return (
    <details className="group">
      <summary className="flex items-center justify-between cursor-pointer list-none py-2 px-3 rounded-lg hover:bg-surface-soft transition-colors">
        <span className="flex items-center gap-2 text-body-md font-medium text-ink">
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </span>
        <Badge variant={getScoreBadgeVariant(feedback.score)} size="sm">
          {feedback.score}
        </Badge>
      </summary>

      <div className="mt-2 ml-3 space-y-3 pb-2">
        {/* 优点 */}
        <div>
          <p className="text-caption-uppercase text-muted mb-1">优点</p>
          <ul className="space-y-1">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-body-sm text-body flex items-start gap-2">
                <span className="text-success mt-0.5">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 改进 */}
        <div>
          <p className="text-caption-uppercase text-muted mb-1">改进</p>
          <ul className="space-y-1">
            {feedback.improvements.map((item, i) => (
              <li key={i} className="text-body-sm text-body flex items-start gap-2">
                <span className="text-accent-amber mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}

/**
 * 三维反馈详情面板
 *
 * 展示语法/词汇/句型三个维度的评估结果，
 * 每个维度可折叠展开查看详细优点和改进点。
 */
export function FeedbackPanel({ feedback, className }: FeedbackPanelProps) {
  const dimensions: FeedbackDimension[] = ['grammar', 'vocabulary', 'sentenceStructure'];

  return (
    <div className={cn('space-y-1', className)}>
      {dimensions.map((dim) => (
        <DimensionSection key={dim} dimension={dim} feedback={feedback[dim]} />
      ))}

      {/* 总结 */}
      {feedback.summary && (
        <div className="mt-4 pt-3 border-t border-hairline">
          <p className="text-body-sm text-muted flex items-start gap-2">
            <span>💡</span>
            <span>{feedback.summary}</span>
          </p>
        </div>
      )}
    </div>
  );
}
