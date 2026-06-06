'use client';

import { type ReactNode, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/utils/cn';

interface FlashCardProps {
  /** 是否显示背面 */
  isFlipped: boolean;
  /** 翻转状态变更回调 */
  onFlip: (flipped: boolean) => void;
  /** 正面内容 */
  front: ReactNode;
  /** 背面内容 */
  back: ReactNode;
  /** 左滑回调（下一题） */
  onSwipeLeft?: () => void;
  /** 右滑回调（上一题） */
  onSwipeRight?: () => void;
  /** 自定义类名 */
  className?: string;
}

const flipVariants = {
  front: {
    rotateY: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] as const },
  },
  back: {
    rotateY: 180,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] as const },
  },
};

const SWIPE_THRESHOLD = 80;

/**
 * 3D 翻转卡片容器
 *
 * 固定尺寸，内容超出时内部滚动。
 * 左滑划走当前卡片，右滑找回上一张。
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
        'relative w-full max-w-[640px] mx-auto h-full',
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
        style={{ x: dragX, opacity: cardOpacity, rotateZ: cardRotate }}
        className="w-full h-full rounded-xl overflow-hidden touch-pan-y bg-surface-card border border-hairline"
      >
        <AnimatePresence mode="wait" initial={false}>
          {!isFlipped ? (
            <motion.div
              key="front"
              className="w-full h-full overflow-y-auto"
              variants={flipVariants}
              initial="back"
              animate="front"
              exit="back"
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
            >
              {front}
            </motion.div>
          ) : (
            <motion.div
              key="back"
              className="w-full h-full overflow-y-auto"
              variants={flipVariants}
              initial="front"
              animate="back"
              exit="front"
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {back}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
