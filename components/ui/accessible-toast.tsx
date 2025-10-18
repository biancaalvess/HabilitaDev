import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground',
        success: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-50',
        warning: 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-50',
        info: 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900 dark:text-blue-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconVariants = cva('h-5 w-5', {
  variants: {
    variant: {
      default: 'text-foreground',
      destructive: 'text-destructive-foreground',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      info: 'text-blue-600 dark:text-blue-400',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface AccessibleToastProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
  duration?: number;
  role?: 'alert' | 'status' | 'log';
}

const AccessibleToast = forwardRef<HTMLDivElement, AccessibleToastProps>(
  ({ 
    className, 
    variant = 'default', 
    title,
    description,
    action,
    onClose,
    role = 'alert',
    ...props 
  }, ref) => {
    const getIcon = () => {
      switch (variant) {
        case 'success':
          return <CheckCircle className={iconVariants({ variant })} />;
        case 'destructive':
          return <AlertCircle className={iconVariants({ variant })} />;
        case 'warning':
          return <AlertTriangle className={iconVariants({ variant })} />;
        case 'info':
          return <Info className={iconVariants({ variant })} />;
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        role={role}
        aria-live={variant === 'destructive' ? 'assertive' : 'polite'}
        aria-atomic="true"
        {...props}
      >
        <div className="flex items-start space-x-3">
          {getIcon() && (
            <div className="flex-shrink-0" aria-hidden="true">
              {getIcon()}
            </div>
          )}
          
          <div className="flex-1 space-y-1">
            {title && (
              <div className="text-sm font-semibold" id={`toast-title-${Math.random().toString(36).substr(2, 9)}`}>
                {title}
              </div>
            )}
            {description && (
              <div 
                className="text-sm opacity-90"
                id={`toast-description-${Math.random().toString(36).substr(2, 9)}`}
              >
                {description}
              </div>
            )}
          </div>
        </div>
        
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
        
        {onClose && (
          <button
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            onClick={onClose}
            aria-label="Fechar notificação"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

AccessibleToast.displayName = 'AccessibleToast';

export { AccessibleToast, toastVariants };
