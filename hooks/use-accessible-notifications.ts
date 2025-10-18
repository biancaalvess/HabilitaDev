import { useState, useCallback, useRef, useEffect } from 'react';

export interface Notification {
  id: string;
  title?: string;
  description: string;
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UseAccessibleNotificationsReturn {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
}

export function useAccessibleNotifications(): UseAccessibleNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      id,
      duration: 5000, // 5 segundos por padrão
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remover após a duração especificada
    if (newNotification.duration && newNotification.duration > 0) {
      const timeout = setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);

      timeoutsRef.current.set(id, timeout);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
    // Limpar timeout se existir
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const clearAllNotifications = useCallback(() => {
    // Limpar todos os timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
    
    setNotifications([]);
  }, []);

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, ...updates } : notification
      )
    );
  }, []);

  // Limpar timeouts quando o componente for desmontado
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    updateNotification,
  };
}

// Hook para notificações de sucesso
export function useSuccessNotification() {
  const { addNotification } = useAccessibleNotifications();
  
  return useCallback((message: string, title?: string) => {
    return addNotification({
      title,
      description: message,
      variant: 'success',
      duration: 3000,
    });
  }, [addNotification]);
}

// Hook para notificações de erro
export function useErrorNotification() {
  const { addNotification } = useAccessibleNotifications();
  
  return useCallback((message: string, title?: string) => {
    return addNotification({
      title,
      description: message,
      variant: 'destructive',
      duration: 7000, // Erros ficam mais tempo na tela
    });
  }, [addNotification]);
}

// Hook para notificações de aviso
export function useWarningNotification() {
  const { addNotification } = useAccessibleNotifications();
  
  return useCallback((message: string, title?: string) => {
    return addNotification({
      title,
      description: message,
      variant: 'warning',
      duration: 5000,
    });
  }, [addNotification]);
}

// Hook para notificações de informação
export function useInfoNotification() {
  const { addNotification } = useAccessibleNotifications();
  
  return useCallback((message: string, title?: string) => {
    return addNotification({
      title,
      description: message,
      variant: 'info',
      duration: 4000,
    });
  }, [addNotification]);
}
