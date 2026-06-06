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

const SWIPE_THRESHOLD = 100;

/**
 * 3D 翻转卡片容器
 *
 * 正面：翻译作答，背面：AI 反馈。
 * 支持左右滑动切换题目（仅正面有效）。
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
  const opacity = useTransform(dragX, [-200, 0, 200], [0.5, 1, 0.5]);
  const rotateZ = useTransform(dragX, [-200, 0, 200], [-5, 0, 5]);
  const isDragging = useRef(false);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      isDragging.current = false;
      const { offset, velocity } = info;

      // 左滑：下一题
      if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
        onSwipeLeft?.();
        return;
      }

      // 右滑：上一题
      if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
        onSwipeRight?.();
        return;
      }
    },
    [onSwipeLeft, onSwipeRight],
  );

  const content = !isFlipped ? (
    <motion.div
      key="front"
      className="w-full"
      variants={flipVariants}
      initial="back"
      animate="front"
      exit="back"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="w-full" style={{ backfaceVisibility: 'hidden' }}>
        {front}
      </div>
    </motion.div>
  ) : (
    <motion.div
      key="back"
      className="w-full"
      variants={flipVariants}
      initial="front"
      animate="back"
      exit="front"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className="w-full"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        {back}
      </div>
    </motion.div>
  );

  return (
    <div
      className={cn(
        'relative w-full max-w-[640px] mx-auto',
        '[perspective:1000px]',
        className,
      )}
    >
      <motion.div
        drag={!isFlipped ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={handleDragEnd}
        style={{ x: dragX, opacity, rotateZ }}
        className="w-full touch-pan-y"
      >
        <AnimatePresence mode="wait" initial={false}>
          {content}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
