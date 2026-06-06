'use client';

import { type ReactNode, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/utils/cn';

interface FlashCardProps {
  isFlipped: boolean;
  onFlip: (flipped: boolean) => void;
  front: ReactNode;
  back: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

const SWIPE_THRESHOLD = 80;

/**
 * 3D 翻转卡片容器
 *
 * 高度用 dvh 直接计算：100dvh - 顶部安全间距(3rem) - 底部导航(3rem)
 * 最大 700px。不依赖 flex 高度链。
 */
export function FlashCard({
  isFlipped,
  onFlip,
  front,
  back,
  onSwipeLeft,
  onSwipeRight,
  className,
}: FlashCardProps) {
  const dragX = useMotionValue(0);
  const cardOpacity = useTransform(dragX, [-300, -100, 0, 100, 300], [0.3, 1, 1, 1, 0.3]);
  const cardRotate = useTransform(dragX, [-300, 0, 300], [-6, 0, 6]);
  const isDragging = useRef(false);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      isDragging.current = false;
      const { offset, velocity } = info;
      if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
        onSwipeLeft?.();
      } else if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
        onSwipeRight?.();
      }
    },
    [onSwipeLeft, onSwipeRight],
  );

  const activeContent = isFlipped ? back : front;
  const animate = isFlipped ? { rotateY: 180 } : { rotateY: 0 };

  return (
    <div
      className={cn(
        'relative w-full max-w-[640px] mx-auto max-h-[700px]',
        /* 100dvh - pt-6(1.5rem) - title+mb-6(3.6rem) - pb-20(5rem) - nav(5.25rem) */
        'h-[calc(100dvh-15.5rem)]',
        '[perspective:1000px]',
        className,
      )}
    >
      <motion.div
        drag={!isFlipped ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={handleDragEnd}
        animate={animate}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{
          x: dragX,
          opacity: cardOpacity,
          rotateZ: cardRotate,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full rounded-xl bg-surface-card border border-hairline touch-pan-y"
      >
        <div
          className="w-full h-full overflow-y-auto"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {activeContent}
        </div>
      </motion.div>
    </div>
  );
}
