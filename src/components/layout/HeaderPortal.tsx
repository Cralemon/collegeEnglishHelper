'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Portal wrapper that renders children into the #app-header target
 * (a direct child of <main>, above all scroll content).
 *
 * Uses a mounted guard to avoid SSR hydration mismatch.
 */
export function HeaderPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const target = document.getElementById('app-header');
  if (!target) return null;

  return createPortal(children, target);
}
