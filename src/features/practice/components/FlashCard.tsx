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
 * 单层结构：perspective 容器 → motion.drag 卡片 → 内容面
 * 卡片通过 max-h 限制最大尺寸，默认 flex-1 满高。
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

  // 决定当前显示的内容和翻转动画
  const activeContent = isFlipped ? back : front;
  const animate = isFlipped ? { rotateY: 180 } : { rotateY: 0 };

  return (
    <div
      className={cn(
        // perspective 容器：宽高由 flex 父级决定，max-w/max-h 限制上限
        'relative w-full max-w-[640px] mx-auto flex-1 min-h-0 max-h-[700px]',
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
