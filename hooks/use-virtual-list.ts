import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseVirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Quantos itens renderizar fora da viewport
}

interface VirtualListResult<T> {
  virtualItems: Array<{
    index: number;
    start: number;
    end: number;
    data: T;
  }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
}

/**
 * Hook para virtualização de listas grandes
 * Útil para renderizar apenas os itens visíveis na tela
 */
export function useVirtualList<T>(
  items: T[],
  options: UseVirtualListOptions
): VirtualListResult<T> {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  // Calcular itens visíveis
  const virtualItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );

    const visibleItems = [];
    for (let i = Math.max(0, startIndex - overscan); i <= endIndex; i++) {
      visibleItems.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight,
        data: items[i],
      });
    }

    return visibleItems;
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  const totalHeight = items.length * itemHeight;

  const scrollToIndex = useCallback((index: number) => {
    const newScrollTop = Math.max(0, index * itemHeight);
    setScrollTop(newScrollTop);
  }, [itemHeight]);

  const scrollToTop = useCallback(() => {
    setScrollTop(0);
  }, []);

  const scrollToBottom = useCallback(() => {
    setScrollTop(totalHeight - containerHeight);
  }, [totalHeight, containerHeight]);

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
  };
}

/**
 * Hook para scroll infinito
 * Útil para carregar mais itens conforme o usuário rola
 */
export function useInfiniteScroll<T>(
  items: T[],
  loadMore: () => void,
  hasMore: boolean,
  threshold: number = 100
) {
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    if (scrollHeight - scrollTop <= clientHeight + threshold && hasMore && !isLoading) {
      setIsLoading(true);
      loadMore();
    }
  }, [hasMore, isLoading, loadMore, threshold]);

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
  }, [items.length, isLoading]);

  return {
    handleScroll,
    isLoading,
  };
}
