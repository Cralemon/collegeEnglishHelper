'use client';

import { forwardRef, type HTMLAttributes, useState, useCallback, createContext, useContext } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

// Context for Tabs state
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

// Tabs wrapper
export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue);

    const activeTab = value ?? internalValue;
    const setActiveTab = useCallback(
      (newValue: string) => {
        setInternalValue(newValue);
        onValueChange?.(newValue);
      },
      [onValueChange]
    );

    return (
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        <div ref={ref} className={cn('w-full', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

// TabsList
const tabsListVariants = cva('inline-flex items-center justify-center', {
  variants: {
    variant: {
      default: 'bg-surface-card rounded-lg p-1 gap-1',
      pills: 'bg-transparent gap-2',
      underline: 'bg-transparent border-b border-hairline gap-0',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface TabsListProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

TabsList.displayName = 'TabsList';

// TabsTrigger
const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center font-body font-medium text-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-canvas data-[state=active]:text-ink data-[state=active]:shadow-sm',
        pills: 'rounded-pill px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white',
        underline: 'px-4 py-2 text-sm border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-ink rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TabsTriggerProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabsTriggerVariants> {
  value: string;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, variant, value, ...props }, ref) => {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === value;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? 'active' : 'inactive'}
        className={cn(tabsTriggerVariants({ variant }), className)}
        onClick={() => setActiveTab(value)}
        {...props}
      />
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

// TabsContent
export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { activeTab } = useTabsContext();

    if (activeTab !== value) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={activeTab === value ? 'active' : 'inactive'}
        className={cn('mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2', className)}
        {...props}
      />
    );
  }
);

TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
