'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { X } from 'lucide-react';

const SIZE_MAP = {
  sm: '400px',
  md: '520px',
  lg: '700px',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const [animState, setAnimState] = useState('closed'); // 'closed' | 'opening' | 'open' | 'closing'
  const overlayRef = useRef(null);

  // Handle open/close transitions
  useEffect(() => {
    if (isOpen) {
      setAnimState('opening');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimState('open'));
      });
    } else if (animState === 'open' || animState === 'opening') {
      setAnimState('closing');
      const timer = setTimeout(() => setAnimState('closed'), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key handler
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  // Click outside handler
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (animState === 'closed') return null;

  const isVisible = animState === 'open';

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.2s ease',
    },

    content: {
      width: '100%',
      maxWidth: SIZE_MAP[size] || SIZE_MAP.md,
      maxHeight: '85vh',
      background: 'var(--card-bg, rgba(30, 41, 59, 0.97))',
      border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
      borderRadius: '18px',
      boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      flexShrink: 0,
    },

    title: {
      fontSize: '1.1rem',
      fontWeight: 600,
      color: 'var(--text-primary, #f1f5f9)',
    },

    closeBtn: {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.04)',
      color: 'var(--text-secondary, #94a3b8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    },

    body: {
      padding: '24px',
      overflowY: 'auto',
      flex: 1,
    },
  };

  return (
    <div
      ref={overlayRef}
      style={styles.overlay}
      onClick={handleOverlayClick}
    >
      <div style={styles.content} role="dialog" aria-modal="true">
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button
            style={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'var(--text-primary, #f1f5f9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}
