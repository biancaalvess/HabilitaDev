"use client";

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastNotificationProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300);

    const closeTimer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-500 text-green-900 dark:bg-green-900/20 dark:text-green-100',
    error: 'bg-red-50 border-red-500 text-red-900 dark:bg-red-900/20 dark:text-red-100',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100',
    info: 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100',
  };

  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg
        min-w-[300px] max-w-[500px]
        transition-all duration-300 ease-in-out
        ${colors[toast.type]}
        ${
          isExiting
            ? 'translate-x-full opacity-0'
            : 'translate-x-0 opacity-100'
        }
      `}
      role="alert"
      aria-live="polite"
    >
      <div className={`flex-shrink-0 ${iconColors[toast.type]}`}>
        {icons[toast.type]}
      </div>
      
      <div className="flex-1 text-sm font-medium">
        {toast.message}
      </div>
      
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(toast.id), 300);
        }}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ToastNotification;

