'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ueh_nav_radius';
const DEFAULT_RADIUS = 9999;

export function useNavRadius() {
  const [radius, setRadiusState] = useState<number>(DEFAULT_RADIUS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        setRadiusState(parsed);
      }
    }
    setMounted(true);
  }, []);

  const setRadius = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(9999, Math.round(value)));
    setRadiusState(clamped);
    localStorage.setItem(STORAGE_KEY, String(clamped));
  }, []);

  return { radius, setRadius, mounted };
}
