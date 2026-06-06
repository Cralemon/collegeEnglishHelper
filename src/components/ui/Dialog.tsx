'use client';

import { forwardRef, type HTMLAttributes, useEffect, useState, useRef } from 'react';
import { cn } from '@/utils/cn';

// ============================================================
// Dialog
// ============================================================

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Trigger enter animation after paint
      timerRef.current = setTimeout(() => setVisible(true), 16);
    } else {
      setVisible(false);
      // Unmount after exit animation completes
      timerRef.current = setTimeout(() => setMounted(false), 200);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open]);

  // Lock scroll + Escape key while mounted (covers enter + exit animation)
  useEffect(() => {
    if (!mounted) return;

    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mounted, onOpenChange]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-black/40 transition-opacity duration-200',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      {/* Content */}
      <div
        className={cn(
          'relative z-10 w-full max-w-md transition-all duration-200',
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================
// DialogContent
// ============================================================

const DialogContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-surface-card rounded-lg p-6 space-y-4',
        className,
      )}
      {...props}
    />
  ),
);

DialogContent.displayName = 'DialogContent';

// ============================================================
// DialogHeader
// ============================================================

const DialogHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1.5', className)} {...props} />
  ),
);

DialogHeader.displayName = 'DialogHeader';

// ============================================================
// DialogTitle
// ============================================================

const DialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-title-md text-ink', className)}
      {...props}
    />
  ),
);

DialogTitle.displayName = 'DialogTitle';

// ============================================================
// DialogDescription
// ============================================================

const DialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-body-sm text-muted', className)}
      {...props}
    />
  ),
);

DialogDescription.displayName = 'DialogDescription';

// ============================================================
// DialogFooter
// ============================================================

const DialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex justify-end gap-3 pt-2', className)}
      {...props}
    />
  ),
);

DialogFooter.displayName = 'DialogFooter';

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
