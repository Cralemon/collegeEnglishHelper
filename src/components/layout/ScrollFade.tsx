'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

interface ScrollFadeProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollFade({ children, className }: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setAtTop(el.scrollTop < 8);
      setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 8);
    };

    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={cn('relative flex-1 min-h-0', className)}>
      <div ref={ref} className="h-full overflow-y-auto">
        {children}
      </div>

      {/* 顶部渐隐 */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-0 inset-x-0 h-8',
          'bg-gradient-to-b from-canvas to-transparent',
          'transition-opacity duration-200',
          atTop ? 'opacity-0' : 'opacity-100',
        )}
      />

      {/* 底部渐隐 */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute bottom-0 inset-x-0 h-16',
          'bg-gradient-to-t from-canvas to-transparent',
          'transition-opacity duration-200',
          atBottom ? 'opacity-0' : 'opacity-100',
        )}
      />
    </div>
  );
}
