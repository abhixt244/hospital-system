'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

/* ---- Context ---- */
const ToastContext = createContext(null);

/* ---- Toast type → icon + color ---- */
const TOAST_CONFIG = {
  success: { icon: CheckCircle, color: '#22c55e', label: 'Success' },
  error:   { icon: XCircle,     color: '#ef4444', label: 'Error' },
  warning: { icon: AlertTriangle, color: '#f59e0b', label: 'Warning' },
  info:    { icon: Info,         color: '#3b82f6', label: 'Info' },
};

let toastIdCounter = 0;

/* ---- Single Toast component ---- */
function Toast({ toast, onRemove }) {
  const { id, message, type, duration } = toast;
  const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;
  const Icon = config.icon;
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  // Auto-dismiss
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(id), 300);
    }, duration);

    return () => clearTimeout(timerRef.current);
  }, [id, duration, onRemove]);

  // Manual close
  const handleClose = () => {
    clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => onRemove(id), 300);
  };

  const styles = {
    toast: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      minWidth: '320px',
      maxWidth: '420px',
      padding: '14px 16px',
      background: 'var(--card-bg, rgba(30, 41, 59, 0.97))',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderLeft: `4px solid ${config.color}`,
      borderRadius: '12px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      position: 'relative',
      overflow: 'hidden',
      transform: exiting ? 'translateX(120%)' : 'translateX(0)',
      opacity: exiting ? 0 : 1,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'slideInRight 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    iconWrapper: {
      width: '28px',
      height: '28px',
      borderRadius: '8px',
      background: `${config.color}18`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    content: {
      flex: 1,
      minWidth: 0,
    },

    label: {
      fontSize: '0.72rem',
      fontWeight: 600,
      color: config.color,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '2px',
    },

    message: {
      fontSize: '0.84rem',
      color: 'var(--text-primary, #f1f5f9)',
      lineHeight: 1.45,
      wordBreak: 'break-word',
    },

    closeBtn: {
      background: 'none',
      border: 'none',
      color: 'var(--text-secondary, #94a3b8)',
      cursor: 'pointer',
      padding: '2px',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      transition: 'color 0.15s ease',
    },

    progressBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '3px',
      background: config.color,
      borderRadius: '0 0 0 12px',
      animation: `progressShrink ${duration}ms linear forwards`,
    },
  };

  return (
    <div style={styles.toast}>
      <div style={styles.iconWrapper}>
        <Icon size={15} color={config.color} />
      </div>

      <div style={styles.content}>
        <div style={styles.label}>{config.label}</div>
        <div style={styles.message}>{message}</div>
      </div>

      <button
        style={styles.closeBtn}
        onClick={handleClose}
        aria-label="Dismiss"
        onMouseEnter={(e) => (e.currentTarget.style.color = '#f1f5f9')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
      >
        <X size={14} />
      </button>

      <div style={styles.progressBar} />
    </div>
  );
}

/* ---- Provider ---- */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const containerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 9999,
    pointerEvents: 'none',
  };

  const toastWrapperStyle = {
    pointerEvents: 'auto',
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Inject keyframe animations once */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes progressShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      {/* Toast container */}
      <div style={containerStyle}>
        {toasts.map((toast) => (
          <div key={toast.id} style={toastWrapperStyle}>
            <Toast toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ---- Hook ---- */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
