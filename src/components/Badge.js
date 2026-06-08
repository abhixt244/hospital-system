'use client';

// Color map keyed by badge type → { bg (translucent), text, border }
const TYPE_COLORS = {
  available:    { bg: 'rgba(34, 197, 94, 0.12)',  text: '#4ade80',  border: 'rgba(34, 197, 94, 0.25)' },
  occupied:     { bg: 'rgba(239, 68, 68, 0.12)',  text: '#f87171',  border: 'rgba(239, 68, 68, 0.25)' },
  maintenance:  { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24',  border: 'rgba(245, 158, 11, 0.25)' },
  reserved:     { bg: 'rgba(59, 130, 246, 0.12)',  text: '#60a5fa',  border: 'rgba(59, 130, 246, 0.25)' },
  critical:     { bg: 'rgba(239, 68, 68, 0.15)',  text: '#f87171',  border: 'rgba(239, 68, 68, 0.3)' },
  high:         { bg: 'rgba(249, 115, 22, 0.12)', text: '#fb923c',  border: 'rgba(249, 115, 22, 0.25)' },
  medium:       { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24',  border: 'rgba(245, 158, 11, 0.25)' },
  low:          { bg: 'rgba(34, 197, 94, 0.12)',  text: '#4ade80',  border: 'rgba(34, 197, 94, 0.25)' },
  admitted:     { bg: 'rgba(59, 130, 246, 0.12)',  text: '#60a5fa',  border: 'rgba(59, 130, 246, 0.25)' },
  discharged:   { bg: 'rgba(148, 163, 184, 0.12)',text: '#94a3b8',  border: 'rgba(148, 163, 184, 0.25)' },
  transferred:  { bg: 'rgba(168, 85, 247, 0.12)', text: '#c084fc',  border: 'rgba(168, 85, 247, 0.25)' },
  admin:        { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc',  border: 'rgba(168, 85, 247, 0.3)' },
  doctor:       { bg: 'rgba(59, 130, 246, 0.15)',  text: '#60a5fa',  border: 'rgba(59, 130, 246, 0.3)' },
  nurse:        { bg: 'rgba(20, 184, 166, 0.15)',  text: '#2dd4bf',  border: 'rgba(20, 184, 166, 0.3)' },
};

// Default fallback color
const DEFAULT_COLOR = { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.25)' };

// Size presets → { padding, fontSize }
const SIZE_MAP = {
  xs: { padding: '1px 8px', fontSize: '0.6rem' },
  sm: { padding: '3px 10px', fontSize: '0.7rem' },
  md: { padding: '4px 14px', fontSize: '0.8rem' },
};

export default function Badge({ label, type, size = 'sm' }) {
  const colorKey = type?.toLowerCase();
  const colors = TYPE_COLORS[colorKey] || DEFAULT_COLOR;
  const sizeStyle = SIZE_MAP[size] || SIZE_MAP.sm;

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizeStyle.padding,
    fontSize: sizeStyle.fontSize,
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.03em',
    textTransform: 'capitalize',
    borderRadius: '20px',
    background: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  return <span style={style}>{label}</span>;
}
