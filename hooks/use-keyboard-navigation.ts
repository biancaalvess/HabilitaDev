import { useEffect, useRef, useCallback } from 'react';

interface UseKeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: (e: KeyboardEvent) => void;
  onShiftTab?: (e: KeyboardEvent) => void;
  enabled?: boolean;
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    switch (e.key) {
      case 'Escape':
        onEscape?.();
        break;
      case 'Enter':
        onEnter?.();
        break;
      case 'ArrowUp':
        onArrowUp?.();
        break;
      case 'ArrowDown':
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        onArrowRight?.();
        break;
      case 'Tab':
        if (e.shiftKey) {
          onShiftTab?.(e);
        } else {
          onTab?.(e);
        }
        break;
    }
  }, [enabled, onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab, onShiftTab]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}

// Hook para gerenciar foco em modais
export function useModalFocus(isOpen: boolean) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Salvar elemento ativo anterior
      previousActiveElement.current = document.activeElement;
      
      // Focar no modal
      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        if (firstElement) {
          firstElement.focus();
        }
      }
    } else {
      // Restaurar foco para o elemento anterior
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  return modalRef;
}

// Hook para trap de foco (manter foco dentro de um elemento)
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isActive]);

  return containerRef;
}

// Hook para navegação por setas em listas
export function useArrowNavigation<T>(
  items: T[],
  onSelect: (item: T, index: number) => void,
  options: {
    enabled?: boolean;
    loop?: boolean;
    initialIndex?: number;
  } = {}
) {
  const { enabled = true, loop = false, initialIndex = 0 } = options;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleArrowDown = useCallback(() => {
    if (!enabled || items.length === 0) return;
    
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= items.length) {
        return loop ? 0 : prev;
      }
      return nextIndex;
    });
  }, [enabled, items.length, loop]);

  const handleArrowUp = useCallback(() => {
    if (!enabled || items.length === 0) return;
    
    setCurrentIndex(prev => {
      const prevIndex = prev - 1;
      if (prevIndex < 0) {
        return loop ? items.length - 1 : prev;
      }
      return prevIndex;
    });
  }, [enabled, items.length, loop]);

  const handleEnter = useCallback(() => {
    if (!enabled || items.length === 0) return;
    
    const item = items[currentIndex];
    if (item) {
      onSelect(item, currentIndex);
    }
  }, [enabled, items, currentIndex, onSelect]);

  useKeyboardNavigation({
    onArrowDown: handleArrowDown,
    onArrowUp: handleArrowUp,
    onEnter: handleEnter,
    enabled,
  });

  return {
    currentIndex,
    setCurrentIndex,
  };
}
