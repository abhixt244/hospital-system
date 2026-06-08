'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Search,
  Bell,
  Check,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export default function Header({ sidebarWidth = 260 }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const userName = session?.user?.name || 'User';
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications on mount
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // Silently fail – notifications are non-critical
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // fail silently
    }
  };

  // Icon for notification type
  const NotificationIcon = ({ type }) => {
    if (type === 'ALERT' || type === 'EMERGENCY') return <AlertTriangle size={14} color="#f59e0b" />;
    return <Info size={14} color="#60a5fa" />;
  };

  // Relative time helper
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Greeting based on time
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  /* ---- Styles ---- */
  const styles = {
    header: {
      position: 'fixed',
      top: 0,
      right: 0,
      left: `${sidebarWidth}px`,
      height: '70px',
      background: 'hsla(222, 30%, 8%, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-glass)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      zIndex: 90,
      transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    searchWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      padding: '8px 14px',
      width: '320px',
      transition: 'border-color 0.2s ease',
    },

    searchInput: {
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: 'var(--text-primary, #f1f5f9)',
      fontSize: '0.85rem',
      width: '100%',
      fontFamily: 'inherit',
    },

    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },

    bellWrapper: {
      position: 'relative',
    },

    bellBtn: {
      position: 'relative',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      padding: '8px',
      cursor: 'pointer',
      color: 'var(--text-secondary, #94a3b8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    },

    badge: {
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: '#fff',
      fontSize: '0.6rem',
      fontWeight: 700,
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid var(--bg-primary, #0a0f1e)',
    },

    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 12px)',
      right: 0,
      width: '360px',
      background: 'var(--bg-secondary)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      overflow: 'hidden',
      zIndex: 200,
      animation: 'fadeIn 0.2s ease',
    },

    dropdownHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    },

    dropdownTitle: {
      fontSize: '0.9rem',
      fontWeight: 600,
      color: 'var(--text-primary, #f1f5f9)',
    },

    notifItem: (read) => ({
      display: 'flex',
      gap: '12px',
      padding: '12px 18px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      cursor: 'pointer',
      background: read ? 'transparent' : 'rgba(20, 184, 166, 0.04)',
      transition: 'background 0.15s ease',
    }),

    notifDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: 'var(--primary, #14b8a6)',
      flexShrink: 0,
      marginTop: '6px',
    },

    notifContent: {
      flex: 1,
      minWidth: 0,
    },

    notifMessage: {
      fontSize: '0.8rem',
      color: 'var(--text-primary, #f1f5f9)',
      lineHeight: 1.4,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    notifTime: {
      fontSize: '0.7rem',
      color: 'var(--text-secondary, #94a3b8)',
      marginTop: '4px',
    },

    emptyNotif: {
      padding: '28px 18px',
      textAlign: 'center',
      color: 'var(--text-secondary, #94a3b8)',
      fontSize: '0.85rem',
    },

    greeting: {
      fontSize: '0.875rem',
      color: 'var(--text-secondary, #94a3b8)',
    },

    greetingName: {
      color: 'var(--text-primary, #f1f5f9)',
      fontWeight: 600,
    },
  };

  const latestNotifications = notifications.slice(0, 5);

  return (
    <header style={styles.header}>
      {/* Search */}
      <div style={styles.searchWrapper}>
        <Search size={16} color="var(--text-secondary, #94a3b8)" />
        <input
          type="text"
          placeholder="Search patients, beds, resources…"
          style={styles.searchInput}
        />
      </div>

      {/* Right side */}
      <div style={styles.rightSection}>
        {/* Greeting */}
        <span style={styles.greeting}>
          {getGreeting()},{' '}
          <span style={styles.greetingName}>{userName}</span>
        </span>

        {/* Notification bell */}
        <div style={styles.bellWrapper} ref={dropdownRef}>
          <button
            style={styles.bellBtn}
            onClick={() => setShowDropdown((v) => !v)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={styles.badge}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <span style={styles.dropdownTitle}>Notifications</span>
                <button
                  onClick={() => setShowDropdown(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {latestNotifications.length === 0 ? (
                <div style={styles.emptyNotif}>No notifications yet</div>
              ) : (
                latestNotifications.map((n) => (
                  <div
                    key={n.id}
                    style={styles.notifItem(n.read)}
                    onClick={() => markAsRead(n.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = n.read
                        ? 'transparent'
                        : 'rgba(20, 184, 166, 0.04)';
                    }}
                  >
                    {!n.read && <div style={styles.notifDot} />}
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>
                      <NotificationIcon type={n.type} />
                    </div>
                    <div style={styles.notifContent}>
                      <div style={styles.notifMessage}>{n.message}</div>
                      <div style={styles.notifTime}>{timeAgo(n.createdAt)}</div>
                    </div>
                    {!n.read && (
                      <Check
                        size={14}
                        color="var(--primary, #14b8a6)"
                        style={{ flexShrink: 0, marginTop: '4px', cursor: 'pointer' }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
