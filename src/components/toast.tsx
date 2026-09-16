'use client';

import { useToast } from '@/lib/toast-context';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const icons = {
    success: <CheckCircle className="h-4 w-4 text-success" />,
    error: <AlertCircle className="h-4 w-4 text-destructive" />,
    info: <Info className="h-4 w-4 text-muted-foreground" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 shadow-lg min-w-[280px]"
          >
            {icons[toast.type]}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
