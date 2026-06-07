'use client';

import { type ReactNode, useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, [role="button"]';

export function FlashCard({
  isFlipped,
  onFlip,
  front,
  back,
  onSwipeLeft,
  onSwipeRight,
  className,
}: FlashCardProps) {
  const [dragX, setDragX] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  /** ref 保存最新拖拽位置，避免 handlePointerUp 闭包过期 */
  const dragXRef = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Skip drag for interactive elements — let click through
      if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
      // 移动端：阻止浏览器默认行为，防止页面滚动/缩放干扰拖拽
      e.currentTarget.setPointerCapture(e.pointerId);
      isDragging.current = true;
      startX.current = e.clientX;
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - startX.current;
      dragXRef.current = dx;
      setDragX(dx);
    },
    [],
  );

  const handlePointerUp = useCallback(
    () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      // 使用 ref 而非 state，确保读到最新拖拽位置
      const dx = dragXRef.current;
      if (dx < -SWIPE_THRESHOLD) {
        onSwipeLeft?.();
      } else if (dx > SWIPE_THRESHOLD) {
        onSwipeRight?.();
      }
      dragXRef.current = 0;
      setDragX(0);
    },
    [onSwipeLeft, onSwipeRight],
  );

  return (
    <div
      className={cn(
        'relative w-full max-w-[640px] mx-auto max-h-[1200px]',
        'flex-1 min-h-0 mb-6',
        '[perspective:1000px]',
        className,
      )}
    >
      <motion.div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{
          x: dragX,
          rotateZ: dragX * 0.02,
          opacity: Math.max(0.3, 1 - Math.abs(dragX) / 300),
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full rounded-xl bg-surface-card border border-hairline touch-pan-y select-none"
      >
        <div
          className="absolute inset-0 w-full h-full overflow-y-auto"
          style={{ backfaceVisibility: 'hidden', touchAction: 'pan-y' }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0 w-full h-full overflow-y-auto"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', touchAction: 'pan-y' }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
