/**
 * Toast Notifications using Sonner
 *
 * A beautiful, customizable toast notification system
 * with RTL support and glass morphism styling
 */

'use client';

import { Toaster as Sonner } from 'sonner';
import { useTheme } from 'next-themes';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      dir="rtl" // RTL support
      toastOptions={{
        classNames: {
          toast:
            'group toast glass border-border text-foreground backdrop-blur-xl',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
          error: 'border-destructive text-destructive',
          success: 'border-success text-success',
          warning: 'border-warning text-warning',
          info: 'border-info text-info',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
