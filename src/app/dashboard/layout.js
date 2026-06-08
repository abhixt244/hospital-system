'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex', minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <div style={{
          width: '260px', background: 'hsl(222, 25%, 10%)',
          borderRight: '1px solid var(--border-glass)', padding: '20px',
          flexShrink: 0,
        }}>
          <div className="skeleton" style={{ width: '140px', height: '30px', borderRadius: '8px', marginBottom: '40px' }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{
              width: '100%', height: '40px', borderRadius: '8px',
              marginBottom: '8px', animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ padding: '90px 32px 28px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px',
            }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{
                  height: '120px', borderRadius: 'var(--radius-lg)',
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      <Header sidebarWidth={sidebarWidth} />
      <main style={{
        flex: 1,
        marginLeft: `${sidebarWidth}px`,
        paddingTop: '70px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
      }}>
        <div style={{
          padding: '28px 32px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}
