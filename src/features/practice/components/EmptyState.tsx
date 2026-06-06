import Link from 'next/link';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  className?: string;
}

/**
 * 空状态 — 无题目时展示
 */
export function EmptyState({ className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className,
      )}
    >
      <div className="text-5xl mb-4">📝</div>
      <h2 className="font-display text-title-lg text-ink mb-2">
        还没有题目
      </h2>
      <p className="text-body-md text-muted max-w-sm mb-6">
        请先在设置中创建题集并添加翻译题目，开始你的翻译练习之旅。
      </p>
      <Link href="/settings">
        <Button variant="primary">去设置 →</Button>
      </Link>
    </div>
  );
}
