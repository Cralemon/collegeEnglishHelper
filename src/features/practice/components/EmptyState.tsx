'use client';

import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  /** 是否正在生成题目 */
  isGenerating?: boolean;
  /** 生成题目回调 */
  onGenerate?: () => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 空状态 — 无题目时展示
 *
 * 上方：不可交互的提示卡片
 * 下方：前往设置 + 生成题目 两个按钮
 */
export function EmptyState({
  isGenerating = false,
  onGenerate,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('space-y-5', className)}>
      {/* 提示卡片（不可交互） */}
      <Card variant="default" size="lg">
        <CardContent>
          <div className="flex flex-col items-center text-center py-6 px-4">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="font-display text-title-lg text-ink mb-2">
              还没有题目
            </h2>
            <p className="text-body-md text-muted max-w-sm">
              请先在设置中配置题目偏好，或直接生成翻译题目开始练习。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/settings" className="flex-1">
          <Button variant="secondary" className="w-full">
            前往设置
          </Button>
        </Link>
        <Button
          variant="primary"
          className="flex-1"
          loading={isGenerating}
          onClick={onGenerate}
        >
          {isGenerating ? '生成中...' : '生成题目'}
        </Button>
      </div>
    </div>
  );
}
