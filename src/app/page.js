'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Root page - redirects based on authentication status
 * Shows a branded loading spinner while checking session
 */
export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Full-screen loading spinner while session resolves
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      gap: '1.5rem',
    }}>
      {/* Animated logo */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse 2s ease-in-out infinite',
        boxShadow: '0 0 40px rgba(45, 212, 191, 0.3)',
      }}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>

      {/* Brand name */}
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '700',
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0,
      }}>
        MedAlloc
      </h1>

      {/* Loading spinner */}
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--border-primary)',
        borderTopColor: 'var(--accent-teal)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        margin: 0,
      }}>
        Loading your workspace...
      </p>

      {/* Inline keyframes for animations */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
