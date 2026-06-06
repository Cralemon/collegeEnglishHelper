'use client';

import { type ReactNode, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface FlashCardProps {
  isFlipped: boolean;
  onFlip: (flipped: boolean) => void;
  front: ReactNode;
  back: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  /** 当前题目索引，用作 AnimatePresence key */
  currentIndex: number;
  className?: string;
}

const SWIPE_THRESHOLD = 80;

/**
 * 3D 翻转卡片容器
 *
 * 滑动时：旧卡片向滑出方向消失，新卡片从对面滑入。
 * 翻转时：rotateY 动画。
 */
export function FlashCard({
  isFlipped,
  onFlip,
  front,
  back,
  onSwipeLeft,
  onSwipeRight,
  currentIndex,
  className,
}: FlashCardProps) {
  const isDragging = useRef(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      isDragging.current = false;
      const { offset, velocity } = info;

      if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
        setSwipeDirection('left');
        onSwipeLeft?.();
      } else if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
        setSwipeDirection('right');
        onSwipeRight?.();
      }
    },
    [onSwipeLeft, onSwipeRight],
  );

  // 进入方向：与滑出方向相反
  const enterFrom = swipeDirection === 'left' ? 300 : -300;

  return (
    <div
      className={cn(
        'relative w-full max-w-[640px] mx-auto max-h-[700px]',
        'flex-1 min-h-0 h-[calc(100dvh-12rem)]',
        '[perspective:1000px]',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => setSwipeDirection(null)}>
        <motion.div
          key={currentIndex}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragStart={() => { isDragging.current = true; }}
          onDragEnd={handleDragEnd}
          initial={{ x: enterFrom, opacity: 0 }}
          animate={{ x: 0, opacity: 1, rotateY: isFlipped ? 180 : 0 }}
          exit={{ x: swipeDirection === 'left' ? -300 : 300, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full rounded-xl bg-surface-card border border-hairline touch-pan-y absolute inset-0"
        >
          <div
            className="absolute inset-0 w-full h-full overflow-y-auto"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {front}
          </div>
          <div
            className="absolute inset-0 w-full h-full overflow-y-auto"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {back}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
