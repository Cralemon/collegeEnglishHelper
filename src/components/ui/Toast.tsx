'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { cn } from '@/utils/cn';

// ============================================================
// 类型
// ============================================================

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

// ============================================================
// Context
// ============================================================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

// ============================================================
// Provider
// ============================================================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast_${++counterRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast 容器 — 固定顶部居中 */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] pt-4 px-4 w-full max-w-md pointer-events-none flex flex-col items-center gap-2"
        aria-live="polite"
        aria-label="通知"
      >
        {toasts.map((item) => (
          <ToastItemView key={item.id} item={item} onDone={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ============================================================
// 单个 Toast（带动画）
// ============================================================

const BORDER_COLORS: Record<ToastType, string> = {
  info: 'border-l-accent-teal',
  success: 'border-l-success',
  warning: 'border-l-warning',
  error: 'border-l-error',
};

const TOAST_DURATION = 3000;

function ToastItemView({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // 进入动画：下一帧触发
    const enterTimer = setTimeout(() => setVisible(true), 16);

    // 自动消失：3s 后隐藏 → 200ms 动画完成后移除
    const exitTimer = setTimeout(() => {
      setVisible(false);
      timerRef.current = setTimeout(onDone, 200);
    }, TOAST_DURATION);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDone]);

  return (
    <div
      className={cn(
        'pointer-events-auto w-full bg-surface-dark text-on-dark text-body-sm rounded-lg border-l-4 px-4 py-3 shadow-lg transition-all duration-200',
        BORDER_COLORS[item.type],
        visible
          ? 'translate-y-2 opacity-100'
          : '-translate-y-4 opacity-0',
      )}
      role="alert"
    >
      {item.message}
    </div>
  );
}
