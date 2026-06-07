import { cn } from '@/utils/cn';

interface ScoreDisplayProps {
  /** 总分 0-100 */
  score: number;
  /** 自定义类名 */
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-accent-amber';
  return 'text-error';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '中等';
  if (score >= 60) return '及格';
  return '需改进';
}

/**
 * 总分展示组件
 *
 * 大字显示分数 + 等级标签。
 * 得分数字使用衬线大字，"/ 100" 使用较小的无衬线字。
 */
export function ScoreDisplay({ score, className }: ScoreDisplayProps) {
  return (
    <div className={cn('flex flex-col items-center gap-0.5 sm:gap-1', className)}>
      <p className="text-caption-uppercase text-muted">总分</p>
      <p className={cn('leading-none', getScoreColor(score))}>
        <span className="text-[26px] sm:text-[32px] md:text-[36px] font-light tracking-[-0.5px]">{score}</span>
        <span className="text-body-sm text-muted ml-1">/ 100</span>
      </p>
      <p className={cn('text-caption font-medium', getScoreColor(score))}>
        {getScoreLabel(score)}
      </p>
    </div>
  );
}
