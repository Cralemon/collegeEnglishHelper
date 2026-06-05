import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center font-body font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-surface-card text-ink border border-hairline',
        primary: 'bg-primary text-white',
        success: 'bg-success text-white',
        warning: 'bg-warning text-white',
        error: 'bg-error text-white',
        outline: 'bg-transparent text-ink border border-hairline',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs rounded-pill',
        md: 'px-2.5 py-1 text-sm rounded-pill',
        lg: 'px-3 py-1.5 text-body-md rounded-pill',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
