import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const loadingVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string;
}

export function Loading({ size, text, className, ...props }: LoadingProps) {
  return (
    <div
      className={cn('flex items-center justify-center gap-2', className)}
      {...props}
    >
      <Loader2 className={cn(loadingVariants({ size }))} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="glass-card flex flex-col items-center gap-4 p-8">
        <Loading size="xl" />
        <p className="text-lg font-heading">جاري التحميل...</p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
