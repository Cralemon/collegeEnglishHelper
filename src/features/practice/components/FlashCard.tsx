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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Skip drag for interactive elements — let click through
      if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
      isDragging.current = true;
      startX.current = e.clientX;
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - startX.current;
      setDragX(dx);
    },
    [],
  );

  const handlePointerUp = useCallback(
    () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (dragX < -SWIPE_THRESHOLD) {
        onSwipeLeft?.();
      } else if (dragX > SWIPE_THRESHOLD) {
        onSwipeRight?.();
      }
      setDragX(0);
    },
    [dragX, onSwipeLeft, onSwipeRight],
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
        drag={false}
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
        className="w-full h-full rounded-xl bg-surface-card border border-hairline touch-pan-y"
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
    </div>
  );
}
