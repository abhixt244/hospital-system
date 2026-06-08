'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon, trend, trendLabel, subtitle, color = '#14b8a6', delay = 0, index = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [visible, setVisible] = useState(false);
  const animatedRef = useRef(false);

  // Staggered entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay || index * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  // Animated count-up effect
  useEffect(() => {
    if (animatedRef.current) return;
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    animatedRef.current = true;
    const duration = 1200; // ms
    const startTime = performance.now();
    const startValue = 0;
    const endValue = value;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    // Start animation after entrance delay
    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay + 200);

    return () => clearTimeout(timer);
  }, [value, delay]);

  // Determine trend direction
  const isTrendPositive = trend > 0;
  const trendColor = isTrendPositive ? '#34d399' : '#f87171';

  const styles = {
    card: {
      background: 'var(--glass-bg, rgba(15, 23, 42, 0.6))',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
      borderLeft: `4px solid ${color}`,
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '16px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    },

    glowBg: {
      position: 'absolute',
      top: '-40px',
      right: '-40px',
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      background: color,
      opacity: 0.06,
      filter: 'blur(40px)',
      pointerEvents: 'none',
    },

    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      zIndex: 1,
    },

    title: {
      fontSize: '0.8rem',
      fontWeight: 500,
      color: 'var(--text-secondary, #94a3b8)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },

    value: {
      fontSize: '2rem',
      fontWeight: 700,
      color: 'var(--text-primary, #f1f5f9)',
      lineHeight: 1.2,
      fontVariantNumeric: 'tabular-nums',
    },

    trendRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '4px',
    },

    trendBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: trendColor,
      background: isTrendPositive ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
      padding: '2px 8px',
      borderRadius: '20px',
    },

    trendLabel: {
      fontSize: '0.72rem',
      color: 'var(--text-secondary, #94a3b8)',
    },

    iconBadge: {
      width: '48px',
      height: '48px',
      borderRadius: '14px',
      background: `${color}15`,
      border: `1px solid ${color}30`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: `0 0 20px ${color}15`,
      zIndex: 1,
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.glowBg} />

      <div style={styles.content}>
        <span style={styles.title}>{title}</span>
        <span style={styles.value}>{displayValue}</span>

        {trend !== undefined && trend !== null && (
          <div style={styles.trendRow}>
            <span style={styles.trendBadge}>
              {isTrendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}%
            </span>
            {trendLabel && <span style={styles.trendLabel}>{trendLabel}</span>}
          </div>
        )}
        {subtitle && !trend && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>{subtitle}</span>
        )}
      </div>

      {icon && (
        <div style={styles.iconBadge}>
          {typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)
            ? (typeof icon === 'function' ? React.createElement(icon, { size: 22, color }) : React.cloneElement(icon, { color }))
            : icon
          }
        </div>
      )}
    </div>
  );
}
