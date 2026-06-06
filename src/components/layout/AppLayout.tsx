'use client';

import { BottomNav } from './BottomNav';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1 min-h-0">
        <div className="mx-auto max-w-5xl h-full flex flex-col px-4 pt-6 pb-20 md:px-8 md:pt-8 md:pl-[88px] md:pb-6 lg:pt-12">
          {children}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
