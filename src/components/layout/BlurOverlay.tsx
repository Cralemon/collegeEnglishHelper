'use client';

import { usePathname } from 'next/navigation';

/**
 * z-40 masked blur overlay — frames content edges.
 * Hidden on the homepage (/) where it's not needed.
 */
export function BlurOverlay() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-40 backdrop-blur pointer-events-none"
      style={{
        WebkitMaskImage: `linear-gradient(black 0px, black calc(40px + env(safe-area-inset-top, 0px)), transparent calc(100px + env(safe-area-inset-top, 0px)), transparent calc(100% - 96px - env(safe-area-inset-bottom, 0px)), black calc(100% - 12px - env(safe-area-inset-bottom, 0px)), black 100%)`,
        maskImage: `linear-gradient(black 0px, black calc(40px + env(safe-area-inset-top, 0px)), transparent calc(100px + env(safe-area-inset-top, 0px)), transparent calc(100% - 96px - env(safe-area-inset-bottom, 0px)), black calc(100% - 12px - env(safe-area-inset-bottom, 0px)), black 100%)`,
      }}
    />
  );
}
