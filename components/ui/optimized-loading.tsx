import { memo } from 'react';
import { Skeleton } from './skeleton';
import { Loader2 } from 'lucide-react';

interface OptimizedLoadingProps {
  type?: 'skeleton' | 'spinner' | 'dots';
  count?: number;
  className?: string;
}

// Componente de loading com skeleton
const SkeletonLoading = memo(({ count = 6, className = '' }: { count: number; className: string }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-6 border rounded-lg animate-pulse">
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
));

SkeletonLoading.displayName = 'SkeletonLoading';

// Componente de loading com spinner
const SpinnerLoading = memo(({ className = '' }: { className: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
      <p className="text-white/80">Carregando...</p>
    </div>
  </div>
));

SpinnerLoading.displayName = 'SpinnerLoading';

// Componente de loading com dots
const DotsLoading = memo(({ className = '' }: { className: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="flex space-x-2">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  </div>
));

DotsLoading.displayName = 'DotsLoading';

// Componente principal
export const OptimizedLoading = memo(function OptimizedLoading({
  type = 'skeleton',
  count = 6,
  className = '',
}: OptimizedLoadingProps) {
  switch (type) {
    case 'spinner':
      return <SpinnerLoading className={className} />;
    case 'dots':
      return <DotsLoading className={className} />;
    case 'skeleton':
    default:
      return <SkeletonLoading count={count} className={className} />;
  }
});

OptimizedLoading.displayName = 'OptimizedLoading';
