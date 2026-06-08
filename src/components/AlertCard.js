'use client';

import { AlertTriangle, CheckCircle2, Clock, Shield } from 'lucide-react';
import Badge from './Badge';
import { timeAgo } from '@/lib/utils';

export default function AlertCard({ alert, onResolve, canResolve }) {
  const priorityColors = {
    CRITICAL: 'var(--priority-critical)',
    HIGH: 'var(--priority-high)',
    MEDIUM: 'var(--priority-medium)',
    LOW: 'var(--priority-low)',
  };

  const borderColor = priorityColors[alert.priority] || 'var(--border-glass)';
  const isCritical = alert.priority === 'CRITICAL' && !alert.resolved;

  return (
    <div style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-glass)',
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      transition: 'all var(--transition-normal)',
      animation: isCritical ? 'pulse 3s ease-in-out infinite' : 'none',
      opacity: alert.resolved ? 0.7 : 1,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-glass-hover)';
        e.currentTarget.style.borderLeftColor = borderColor;
        e.currentTarget.style.boxShadow = `var(--shadow-md), 0 0 12px ${borderColor}33`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-glass)';
        e.currentTarget.style.borderLeftColor = borderColor;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: `${borderColor}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {alert.resolved
              ? <CheckCircle2 size={18} style={{ color: 'var(--status-available)' }} />
              : <AlertTriangle size={18} style={{ color: borderColor }} />
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{
              fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)',
              margin: 0, lineHeight: 1.3,
            }}>
              {alert.title}
            </h3>
          </div>
        </div>
        <Badge
          label={alert.priority}
          type={alert.priority.toLowerCase()}
          size="xs"
        />
      </div>

      {/* Message */}
      <p style={{
        fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6,
        margin: '0 0 14px 0',
      }}>
        {alert.message}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '12px', borderTop: '1px solid var(--border-glass)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={13} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {timeAgo(alert.createdAt)}
          </span>
        </div>

        {alert.resolved ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={13} style={{ color: 'var(--status-available)' }} />
            <span style={{ fontSize: '12px', color: 'var(--status-available)' }}>
              Resolved {alert.resolvedAt ? timeAgo(alert.resolvedAt) : ''}
            </span>
          </div>
        ) : canResolve ? (
          <button
            onClick={() => onResolve(alert.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '8px',
              background: 'var(--status-available)22',
              border: '1px solid var(--status-available)44',
              color: 'var(--status-available)',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--status-available)44';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--status-available)22';
            }}
          >
            <Shield size={13} />
            Resolve
          </button>
        ) : null}
      </div>
    </div>
  );
}
