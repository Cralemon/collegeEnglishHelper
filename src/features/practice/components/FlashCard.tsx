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
 * 3D 翻转卡片容器（叠卡模式）
 *
 * 卡片堆叠展示，左滑划走当前卡片展示下一张，右滑找回上一张。
 * 卡片尺寸：宽度 90% 内容区，高度 = 窗口宽度，最大尺寸受限。
 * 内容超出卡片高度时，卡片内部滚动。
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
  const opacity = useTransform(dragX, [-300, -100, 0, 100, 300], [0.3, 1, 1, 1, 0.3]);
  const rotateZ = useTransform(dragX, [-300, 0, 300], [-8, 0, 8]);
  const isDragging = useRef(false);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      isDragging.current = false;
      const { offset, velocity } = info;

      // 左滑：划走当前卡片，展示下一张
      if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
        onSwipeLeft?.();
        return;
      }

      // 右滑：找回上一张卡片
      if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
        onSwipeRight?.();
        return;
      }
    },
    [onSwipeLeft, onSwipeRight],
  );

  const cardContent = !isFlipped ? (
    <motion.div
      key="front"
      className="w-full h-full"
      variants={flipVariants}
      initial="back"
      animate="front"
      exit="back"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="w-full h-full overflow-y-auto" style={{ backfaceVisibility: 'hidden' }}>
        {front}
      </div>
    </motion.div>
  ) : (
    <motion.div
      key="back"
      className="w-full h-full"
      variants={flipVariants}
      initial="front"
      animate="back"
      exit="front"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div
        className="w-full h-full overflow-y-auto"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        {back}
      </div>
    </motion.div>
  );

  return (
    <div
      className={cn(
        'relative mx-auto',
        /* Width: 90% of content area, max 640px */
        'w-[90%] max-w-[640px]',
        /* Height: viewport width, clamped between 400px and 700px */
        'h-[100vw] min-h-[400px] max-h-[700px]',
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
        style={{ x: dragX, opacity, rotateZ }}
        className="w-full h-full touch-pan-y rounded-xl overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {cardContent}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
