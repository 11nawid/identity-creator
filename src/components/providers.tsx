'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/theme-context';
import { ToastProvider } from '@/lib/toast-context';
import { ToastContainer } from '@/components/toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        {children}
        <ToastContainer />
      </ToastProvider>
    </ThemeProvider>
  );
}
