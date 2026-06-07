'use client';

import { cn } from '@/utils/cn';

interface ScrollFadeProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 滚动容器 — 隐藏滚动条，内容自然延伸。
 * 渐隐效果由页面标题栏（sticky + backdrop-blur）和底部导航栏（毛玻璃）各自处理。
 */
export function ScrollFade({ children, className }: ScrollFadeProps) {
  return (
    <div className={cn('relative flex-1 min-h-0', className)}>
      <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {children}
      </div>
    </div>
  );
}
