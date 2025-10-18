"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { AccessibleToast } from './accessible-toast';
import { useAccessibleNotifications } from '@/hooks/use-accessible-notifications';

export function NotificationContainer() {
  const { notifications, removeNotification } = useAccessibleNotifications();

  return (
    <div
      className="fixed top-4 right-4 z-50 flex max-h-screen w-full max-w-sm flex-col space-y-2 overflow-hidden"
      role="region"
      aria-label="Notificações"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: 'easeOut',
            }}
            className="w-full"
          >
            <AccessibleToast
              variant={notification.variant}
              title={notification.title}
              description={notification.description}
              onClose={() => removeNotification(notification.id)}
              action={notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="rounded-md bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {notification.action.label}
                </button>
              )}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
