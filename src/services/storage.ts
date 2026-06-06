/**
 * localStorage 类型安全封装
 *
 * 基于 FINAL_PLAN.md §5.2 的键名规范，提供统一的读写接口。
 * 所有值以 JSON 序列化存储，读取时自动反序列化。
 */

// ============================================================
// 存储键名常量
// ============================================================

export const STORAGE_KEYS = {
  QUESTIONS: 'ueh_questions',
  ANSWERS: 'ueh_answers',
  COLLECTIONS: 'ueh_collections',
  USER_PROFILE: 'ueh_user_profile',
  LLM_CONFIG: 'ueh_llm_config',
  IMPROVEMENTS: 'ueh_improvements',
  THEME: 'ueh_theme',
  NAV_RADIUS: 'ueh_nav_radius',
  NAV_POSITION: 'ueh_nav_position',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ============================================================
// 核心读写函数
// ============================================================

/**
 * 从 localStorage 读取并反序列化
 *
 * @param key - 存储键名
 * @param fallback - 读取失败时的默认值
 * @returns 反序列化后的值，或 fallback
 */
export function storageGet<T>(key: StorageKey, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[storage] Failed to read key "${key}", returning fallback`);
    return fallback;
  }
}

/**
 * 序列化并写入 localStorage
 *
 * @param key - 存储键名
 * @param value - 要存储的值
 */
export function storageSet<T>(key: StorageKey, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[storage] Failed to write key "${key}":`, error);
  }
}

/**
 * 删除 localStorage 中的指定键
 *
 * @param key - 存储键名
 */
export function storageRemove(key: StorageKey): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[storage] Failed to remove key "${key}":`, error);
  }
}

// ============================================================
// Zustand 持久化适配器
// ============================================================

/**
 * 为 Zustand persist 中间件提供的 storage 适配器
 *
 * Zustand persist 期望的接口：{ getItem, setItem, removeItem }
 * 此适配器将调用转发到我们的类型安全函数。
 */
export const zustandStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};
