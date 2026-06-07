'use client';

import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  /** Sticky blur header — rendered as direct child of <main>, above all scroll content */
  header?: React.ReactNode;
}

export function AppLayout({ children, header }: AppLayoutProps) {
  return (
    <>
      <main className="flex-1 min-h-0 flex flex-col">
        {header}
        <div className="flex-1 min-h-0 mx-auto max-w-5xl w-full flex flex-col px-4 md:px-8 md:pl-[88px]">
          {children}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
