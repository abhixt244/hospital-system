'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  Package,
  BarChart3,
  AlertTriangle,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: null },
  { href: '/dashboard/beds', label: 'Bed Management', icon: BedDouble, roles: null },
  { href: '/dashboard/patients', label: 'Patients', icon: Users, roles: null },
  { href: '/dashboard/resources', label: 'Resources', icon: Package, roles: null },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN', 'DOCTOR'] },
  { href: '/dashboard/alerts', label: 'Emergency Alerts', icon: AlertTriangle, roles: null },
];

export default function Sidebar({ collapsed = false, onToggle }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [hoveredLink, setHoveredLink] = useState(null);

  const userRole = session?.user?.role || 'NURSE';
  const userName = session?.user?.name || 'User';

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const visibleLinks = navLinks.filter(
    (link) => !link.roles || link.roles.includes(userRole)
  );

  const roleBadgeColor = {
    ADMIN: { bg: 'hsla(270, 60%, 55%, 0.2)', text: 'hsl(270, 70%, 72%)', border: 'hsla(270, 60%, 55%, 0.3)' },
    DOCTOR: { bg: 'hsla(220, 70%, 55%, 0.2)', text: 'hsl(220, 80%, 72%)', border: 'hsla(220, 70%, 55%, 0.3)' },
    NURSE: { bg: 'hsla(174, 72%, 40%, 0.2)', text: 'hsl(174, 72%, 60%)', border: 'hsla(174, 72%, 40%, 0.3)' },
  };

  const currentRoleStyle = roleBadgeColor[userRole] || roleBadgeColor.NURSE;
  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: `${sidebarWidth}px`,
      background: 'hsl(222, 25%, 10%)',
      borderRight: '1px solid var(--border-glass)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 'var(--z-sidebar)',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
    }}>
      {/* Collapse toggle button */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'absolute',
          top: '26px',
          right: '-1px',
          width: '24px',
          height: '24px',
          borderRadius: '6px 0 0 6px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-glass)',
          borderRight: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 101,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-glass-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: collapsed ? '20px 17px' : '20px 24px',
        borderBottom: '1px solid var(--border-glass)',
        minHeight: '70px',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-blue))',
          boxShadow: '0 0 20px var(--accent-teal-glow)',
          flexShrink: 0,
        }}>
          <Heart size={20} color="#fff" />
        </div>
        {!collapsed && (
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-blue))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap',
          }}>
            MedAlloc
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '16px 0',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {!collapsed && (
          <div style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            padding: '8px 24px 12px',
          }}>
            Menu
          </div>
        )}

        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          const hovered = hoveredLink === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px 0' : '11px 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                margin: collapsed ? '2px 8px' : '2px 12px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: active
                  ? 'var(--accent-teal)'
                  : hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active
                  ? 'hsla(174, 72%, 40%, 0.12)'
                  : hovered ? 'hsla(0, 0%, 100%, 0.04)' : 'transparent',
                fontWeight: active ? 600 : 400,
                fontSize: '0.875rem',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                position: 'relative',
              }}
              onMouseEnter={() => setHoveredLink(link.href)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {/* Active indicator bar */}
              {active && !collapsed && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  bottom: '20%',
                  width: '3px',
                  borderRadius: '0 3px 3px 0',
                  background: 'var(--accent-teal)',
                }} />
              )}
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user section */}
      <div style={{
        borderTop: '1px solid var(--border-glass)',
        padding: collapsed ? '16px 8px' : '16px 16px',
        flexShrink: 0,
      }}>
        {/* User info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            flexShrink: 0,
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {userName}
              </div>
              <span style={{
                display: 'inline-block',
                fontSize: '0.6rem',
                fontWeight: 600,
                padding: '1px 8px',
                borderRadius: '20px',
                background: currentRoleStyle.bg,
                color: currentRoleStyle.text,
                border: `1px solid ${currentRoleStyle.border}`,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginTop: '2px',
              }}>
                {userRole}
              </span>
            </div>
          )}
        </div>

        {/* Sign out button */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            width: '100%',
            padding: '10px 12px',
            borderRadius: '10px',
            border: 'none',
            background: 'hsla(0, 75%, 55%, 0.08)',
            color: 'hsl(0, 80%, 70%)',
            fontSize: '0.825rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'hsla(0, 75%, 55%, 0.15)';
            e.currentTarget.style.color = 'hsl(0, 85%, 75%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'hsla(0, 75%, 55%, 0.08)';
            e.currentTarget.style.color = 'hsl(0, 80%, 70%)';
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
