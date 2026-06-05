'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ueh_nav_position';
export type NavPosition = 'left' | 'right';

export function useNavPosition() {
  const [position, setPositionState] = useState<NavPosition>('left');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'left' || stored === 'right') {
      setPositionState(stored);
    }
    setMounted(true);
  }, []);

  const setPosition = useCallback((value: NavPosition) => {
    setPositionState(value);
    localStorage.setItem(STORAGE_KEY, value);
  }, []);

  return { position, setPosition, mounted };
}
