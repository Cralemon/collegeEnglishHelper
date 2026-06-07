'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { IconPractice, IconReview, IconSettings } from '@/components/ui';
import { useNavRadius } from '@/hooks/useNavRadius';
import { useNavPosition } from '@/hooks/useNavPosition';

const GAP = 6; // gap-1.5 mobile / matches container padding

const navItems = [
  { href: '/', label: '练习', icon: IconPractice },
  { href: '/review', label: '回顾', icon: IconReview },
  { href: '/settings', label: '设置', icon: IconSettings },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { radius, mounted: radiusMounted } = useNavRadius();
  const { position, mounted: posMounted } = useNavPosition();

  if (!radiusMounted || !posMounted) return null;

  const isLeft = position === 'left';
  const activeRadius = Math.max(0, radius - GAP);

  return (
    <nav
      className={cn(
        'fixed z-50 pointer-events-none',
        'bottom-0 left-0 right-0 flex justify-center safe-mb',
        'md:top-1/2 md:bottom-auto md:right-auto md:left-auto md:-translate-y-1/2 md:flex-col md:items-center',
        isLeft ? 'md:left-4' : 'md:right-4',
      )}
    >
      <div
        className={cn(
          'pointer-events-auto flex items-center justify-around bg-canvas/30 backdrop-blur-md border border-hairline shadow-elevated',
          'mb-4 w-full max-w-5xl mx-4 p-1.5 gap-1.5',
          'md:w-[72px] md:mx-0 md:mb-0 md:flex-col md:gap-1',
        )}
        style={{ borderRadius: `${radius}px` }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                'md:flex-none md:w-full',
                isActive
                  ? 'text-primary bg-primary/30'
                  : 'text-muted hover:text-ink hover:bg-muted/15',
              )}
              style={{ borderRadius: `${activeRadius}px` }}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
