import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution
 *
 * @example
 * ```tsx
 * cn('px-4 py-2', 'px-6') // => 'px-6 py-2'
 * cn('text-red-500', condition && 'text-blue-500') // => 'text-blue-500' (if condition is true)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
