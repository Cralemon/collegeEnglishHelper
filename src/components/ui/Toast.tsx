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
      {/* Toast 容器 — 固定顶部居中，pointer-events-none 确保不阻挡交互 */}
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

/** Claude 设计规范：cookie-consent-card → surface-dark + on-dark + body-sm + rounded-lg */
const TOAST_DURATION = 3000;

/** 类型 → 左边框颜色（使用 var() 引用 CSS 变量，避免 Tailwind 类名解析问题） */
const ACCENT_COLORS: Record<ToastType, string> = {
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
  success: 'var(--color-success)',
  info: 'var(--color-accent-teal)',
};

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
        'pointer-events-auto w-full rounded-lg px-4 py-3 shadow-lg transition-all duration-200',
        visible
          ? 'translate-y-2 opacity-100'
          : '-translate-y-4 opacity-0',
      )}
      style={{
        backgroundColor: 'var(--color-surface-dark)',
        color: 'var(--color-on-dark)',
        borderLeft: `4px solid ${ACCENT_COLORS[item.type]}`,
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: 1.55,
      }}
      role="alert"
    >
      {item.message}
    </div>
  );
}
