'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardFooter } from '@/components/ui';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  isGenerating?: boolean;
  onGenerate?: () => void;
  className?: string;
}

/**
 * 空状态 — 无题目时展示
 *
 * 单张卡片，内含提示信息 + 操作按钮。
 * 两个按钮均为 <button>，保证等高。
 */
export function EmptyState({
  isGenerating = false,
  onGenerate,
  className,
}: EmptyStateProps) {
  const router = useRouter();

  return (
    <Card variant="default" size="lg" className={cn('max-w-lg mx-auto', className)}>
      <CardContent>
        <div className="flex flex-col items-center text-center py-4">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-title-lg text-ink mb-2">
            还没有题目
          </h2>
          <p className="text-body-md text-muted">
            请先在设置中配置题目偏好，或直接生成翻译题目开始练习。
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="secondary"
          size="md"
          className="w-full sm:flex-1 sm:w-auto"
          onClick={() => router.push('/settings')}
        >
          前往设置
        </Button>
        <Button
          variant="primary"
          size="md"
          className="w-full sm:flex-1 sm:w-auto"
          loading={isGenerating}
          onClick={onGenerate}
        >
          {isGenerating ? '生成中...' : '生成题目'}
        </Button>
      </CardFooter>
    </Card>
  );
}
