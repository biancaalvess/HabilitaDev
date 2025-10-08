import { useState, useCallback } from 'react';
import { ToastType } from '@/components/ui/toast-notification';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const useToastNotification = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    return id;
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return show(message, 'success', duration);
  }, [show]);

  const error = useCallback((message: string, duration?: number) => {
    return show(message, 'error', duration);
  }, [show]);

  const warning = useCallback((message: string, duration?: number) => {
    return show(message, 'warning', duration);
  }, [show]);

  const info = useCallback((message: string, duration?: number) => {
    return show(message, 'info', duration);
  }, [show]);

  const close = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const closeAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    close,
    closeAll,
  };
};

