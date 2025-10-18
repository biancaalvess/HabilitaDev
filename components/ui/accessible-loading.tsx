import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const loadingVariants = cva('', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      default: 'text-primary',
      muted: 'text-muted-foreground',
      destructive: 'text-destructive',
      success: 'text-green-600',
      warning: 'text-yellow-600',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface AccessibleLoadingProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string;
  fullScreen?: boolean;
}

const AccessibleLoading = forwardRef<HTMLDivElement, AccessibleLoadingProps>(
  ({ 
    className, 
    size = 'md', 
    variant = 'default',
    text = 'Carregando...',
    fullScreen = false,
    ...props 
  }, ref) => {
    const spinnerId = `spinner-${Math.random().toString(36).substr(2, 9)}`;
    const textId = `spinner-text-${Math.random().toString(36).substr(2, 9)}`;

    const spinner = (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center space-y-2',
          fullScreen && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={text}
        {...props}
      >
        <svg
          className={cn('animate-spin', loadingVariants({ size, variant }))}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        
        {text && (
          <p
            id={textId}
            className="text-sm text-muted-foreground"
            aria-live="polite"
          >
            {text}
          </p>
        )}
        
        <span className="sr-only">{text}</span>
      </div>
    );

    return spinner;
  }
);

AccessibleLoading.displayName = 'AccessibleLoading';

// Componente de loading com dots
export const AccessibleDotsLoading = forwardRef<HTMLDivElement, AccessibleLoadingProps>(
  ({ 
    className, 
    size = 'md', 
    variant = 'default',
    text = 'Carregando...',
    fullScreen = false,
    ...props 
  }, ref) => {
    const dotSize = {
      sm: 'w-1 h-1',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    }[size];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center space-y-2',
          fullScreen && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={text}
        {...props}
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full animate-bounce',
                dotSize,
                loadingVariants({ variant })
              )}
              style={{
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
        
        {text && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {text}
          </p>
        )}
        
        <span className="sr-only">{text}</span>
      </div>
    );
  }
);

AccessibleDotsLoading.displayName = 'AccessibleDotsLoading';

export { AccessibleLoading, loadingVariants };
