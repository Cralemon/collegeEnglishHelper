import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui';
import type {
  AIFeedback,
  DimensionFeedback,
  FeedbackDimension,
  Issue,
  IssueSeverity,
  TranslationStrategy,
} from '@/types';

interface FeedbackPanelProps {
  feedback: AIFeedback;
  className?: string;
}

const dimensionConfig: Record<FeedbackDimension, { label: string; icon: string }> = {
  grammar: { label: '语法', icon: '✅' },
  vocabulary: { label: '词汇', icon: '📚' },
  sentenceStructure: { label: '句型', icon: '🏗️' },
};

function getScoreBadgeVariant(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}

function getSeverityBadgeVariant(severity: IssueSeverity): 'error' | 'warning' | 'outline' {
  if (severity === 'error') return 'error';
  if (severity === 'warning') return 'warning';
  return 'outline';
}

const severityLabel: Record<IssueSeverity, string> = {
  error: '错误',
  warning: '注意',
  suggestion: '建议',
};

function IssueItem({ issue }: { issue: Issue }) {
  return (
    <li className="rounded-lg bg-surface-soft p-2.5 space-y-1">
      <div className="flex items-center gap-2">
        <Badge variant={getSeverityBadgeVariant(issue.severity)} size="sm">
          {severityLabel[issue.severity]}
        </Badge>
        <span className="text-body-sm text-muted font-mono">{issue.userFragment}</span>
      </div>
      <p className="text-body-sm text-ink">
        <span className="text-success font-medium">→ </span>
        {issue.suggestedFix}
      </p>
      <p className="text-caption text-muted">{issue.reason}</p>
    </li>
  );
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

        {/* 具体问题 */}
        {feedback.issues.length > 0 && (
          <div>
            <p className="text-caption-uppercase text-muted mb-1">问题</p>
            <ul className="space-y-2">
              {feedback.issues.map((issue, i) => (
                <IssueItem key={i} issue={issue} />
              ))}
            </ul>
          </div>
        )}

        {/* 改进概述 */}
        <div>
          <p className="text-caption-uppercase text-muted mb-1">改进方向</p>
          <ul className="space-y-1">
            {feedback.improvements.map((item, i) => (
              <li key={i} className="text-body-sm text-body flex items-start gap-2">
                <span className="text-accent-amber mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 学习技巧 */}
        {feedback.tips && feedback.tips.length > 0 && (
          <div>
            <p className="text-caption-uppercase text-muted mb-1">技巧</p>
            <ul className="space-y-1">
              {feedback.tips.map((tip, i) => (
                <li key={i} className="text-body-sm text-muted flex items-start gap-2">
                  <span className="mt-0.5">💡</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}

function StrategySection({ strategy }: { strategy: TranslationStrategy }) {
  const approachColor =
    strategy.approach === '直译为主'
      ? 'text-primary'
      : strategy.approach === '意译为主'
        ? 'text-accent-amber'
        : 'text-success';

  return (
    <details className="group">
      <summary className="flex items-center justify-between cursor-pointer list-none py-2 px-3 rounded-lg hover:bg-surface-soft transition-colors">
        <span className="flex items-center gap-2 text-body-md font-medium text-ink">
          <span>🎯</span>
          <span>翻译策略</span>
        </span>
        <span className={cn('text-body-sm font-medium', approachColor)}>
          {strategy.approach}
        </span>
      </summary>

      <div className="mt-2 ml-3 space-y-3 pb-2">
        {/* 策略优点 */}
        {strategy.strengths.length > 0 && (
          <div>
            <p className="text-caption-uppercase text-muted mb-1">策略优点</p>
            <ul className="space-y-1">
              {strategy.strengths.map((s, i) => (
                <li key={i} className="text-body-sm text-body flex items-start gap-2">
                  <span className="text-success mt-0.5">+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 策略建议 */}
        {strategy.suggestions.length > 0 && (
          <div>
            <p className="text-caption-uppercase text-muted mb-1">策略建议</p>
            <ul className="space-y-1">
              {strategy.suggestions.map((s, i) => (
                <li key={i} className="text-body-sm text-body flex items-start gap-2">
                  <span className="text-accent-amber mt-0.5">→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 关键词处理 */}
        {strategy.keyPoints.length > 0 && (
          <div>
            <p className="text-caption-uppercase text-muted mb-1">关键词处理</p>
            <ul className="space-y-2">
              {strategy.keyPoints.map((kp, i) => (
                <li key={i} className="rounded-lg bg-surface-soft p-2.5 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        kp.evaluation === '优秀'
                          ? 'success'
                          : kp.evaluation === '合格'
                            ? 'warning'
                            : 'error'
                      }
                      size="sm"
                    >
                      {kp.evaluation}
                    </Badge>
                    <span className="text-body-sm text-muted">{kp.originalFragment}</span>
                  </div>
                  <p className="text-body-sm text-ink">{kp.userTranslation}</p>
                  {kp.alternativeSuggestion && (
                    <p className="text-caption text-muted">
                      建议：{kp.alternativeSuggestion}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}

/**
 * 三维反馈详情面板
 *
 * 展示语法/词汇/句型三个维度的评估结果（含 issues 列表）
 * 以及翻译策略分析和整体学习建议。
 */
export function FeedbackPanel({ feedback, className }: FeedbackPanelProps) {
  const dimensions: FeedbackDimension[] = ['grammar', 'vocabulary', 'sentenceStructure'];

  return (
    <div className={cn('space-y-1', className)}>
      {dimensions.map((dim) => (
        <DimensionSection key={dim} dimension={dim} feedback={feedback[dim]} />
      ))}

      {/* 翻译策略 */}
      <StrategySection strategy={feedback.translationStrategy} />

      {/* 整体建议 */}
      {feedback.overallSuggestion.length > 0 && (
        <div className="mt-4 pt-3 border-t border-hairline space-y-1">
          {feedback.overallSuggestion.map((tip, i) => (
            <p key={i} className="text-body-sm text-muted flex items-start gap-2">
              <span>💡</span>
              <span>{tip}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
