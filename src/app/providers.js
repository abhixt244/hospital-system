'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/context/ToastContext';

/**
 * Global providers wrapper
 * - SessionProvider: NextAuth.js session management
 * - ToastProvider: App-wide toast notifications
 */
export function Providers({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
