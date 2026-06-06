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
 * 始终渲染正反两面，通过 backfaceVisibility + rotateY 控制可见性。
 * isFlipped=false：rotateY(0)，正面可见。
 * isFlipped=true：rotateY(180)，背面可见（预旋转 180° + 父 180° = 360° = 正向）。
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

  return (
    <div
      className={cn(
        'relative w-full max-w-[640px] mx-auto max-h-[700px]',
        'h-[calc(100dvh-12rem)]',
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
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{
          x: dragX,
          opacity: cardOpacity,
          rotateZ: cardRotate,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full rounded-xl bg-surface-card border border-hairline touch-pan-y"
      >
        {/* 正面：rotateY(0)，父 rotateY(0) 时可见 */}
        <div
          className="absolute inset-0 w-full h-full overflow-y-auto"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>

        {/* 背面：预旋转 180°，父 rotateY(180) 时 180+180=360° 正向可见 */}
        <div
          className="absolute inset-0 w-full h-full overflow-y-auto"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
