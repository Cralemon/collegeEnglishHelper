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

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast_${++toastCounter}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] pt-4 px-4 w-full max-w-md pointer-events-none flex flex-col items-center gap-2"
        aria-live="polite"
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

/** 半透明背景色 — Claude 语义色 + 88% 不透明度，深浅模式下统一 */
const TOAST_BG: Record<ToastType, string> = {
  error: 'rgba(198, 69, 69, 0.88)',
  warning: 'rgba(212, 160, 23, 0.88)',
  success: 'rgba(93, 184, 114, 0.88)',
  info: 'rgba(93, 184, 166, 0.88)',
};

const TOAST_DURATION = 3000;

function ToastItemView({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 16);

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
        'pointer-events-auto rounded-full px-5 py-2.5 shadow-lg transition-all duration-200 max-w-full',
        visible
          ? 'translate-y-2 opacity-100'
          : '-translate-y-4 opacity-0',
      )}
      style={{
        backgroundColor: TOAST_BG[item.type],
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: 1.4,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      role="alert"
    >
      {item.message}
    </div>
  );
}
