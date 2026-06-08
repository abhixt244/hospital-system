'use client';

import { useMemo } from 'react';
import { User, Wrench } from 'lucide-react';

/* ---- Status → color map ---- */
const STATUS_COLORS = {
  AVAILABLE:   { bg: 'rgba(34, 197, 94, 0.12)',  border: '#22c55e', text: '#4ade80', hoverBg: 'rgba(34, 197, 94, 0.2)' },
  OCCUPIED:    { bg: 'rgba(239, 68, 68, 0.12)',  border: '#ef4444', text: '#f87171', hoverBg: 'rgba(239, 68, 68, 0.2)' },
  MAINTENANCE: { bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', text: '#fbbf24', hoverBg: 'rgba(245, 158, 11, 0.2)' },
  RESERVED:    { bg: 'rgba(59, 130, 246, 0.12)',  border: '#3b82f6', text: '#60a5fa', hoverBg: 'rgba(59, 130, 246, 0.2)' },
};

const DEFAULT_STATUS_COLOR = STATUS_COLORS.AVAILABLE;

export default function BedGrid({ beds = [], onBedClick, selectedWard }) {
  // Group beds by ward
  const wardGroups = useMemo(() => {
    const filtered = selectedWard
      ? beds.filter((b) => b.ward?.id === selectedWard || b.wardId === selectedWard)
      : beds;

    const groups = {};
    filtered.forEach((bed) => {
      const wardName = bed.ward?.name || 'Unassigned';
      if (!groups[wardName]) groups[wardName] = [];
      groups[wardName].push(bed);
    });

    // Sort beds within each ward by bedNumber
    Object.values(groups).forEach((arr) =>
      arr.sort((a, b) => a.bedNumber.localeCompare(b.bedNumber, undefined, { numeric: true }))
    );

    return groups;
  }, [beds, selectedWard]);

  const wardNames = Object.keys(wardGroups).sort();

  /* ---- Styles ---- */
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
    },

    wardSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    },

    wardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },

    wardName: {
      fontSize: '1rem',
      fontWeight: 600,
      color: 'var(--text-primary, #f1f5f9)',
    },

    wardCount: {
      fontSize: '0.75rem',
      fontWeight: 500,
      color: 'var(--text-secondary, #94a3b8)',
      background: 'rgba(255,255,255,0.05)',
      padding: '2px 10px',
      borderRadius: '20px',
    },

    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
      gap: '10px',
    },

    empty: {
      textAlign: 'center',
      padding: '48px 20px',
      color: 'var(--text-secondary, #94a3b8)',
      fontSize: '0.9rem',
    },
  };

  if (wardNames.length === 0) {
    return <div style={styles.empty}>No beds to display</div>;
  }

  return (
    <div style={styles.container}>
      {wardNames.map((wardName) => (
        <div key={wardName} style={styles.wardSection}>
          {/* Ward header */}
          <div style={styles.wardHeader}>
            <span style={styles.wardName}>{wardName}</span>
            <span style={styles.wardCount}>
              {wardGroups[wardName].length} beds
            </span>
          </div>

          {/* Bed tiles grid */}
          <div style={styles.grid}>
            {wardGroups[wardName].map((bed) => (
              <BedTile
                key={bed.id}
                bed={bed}
                onClick={() => onBedClick?.(bed)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- Individual Bed Tile ---- */
function BedTile({ bed, onClick }) {
  const statusKey = bed.status?.toUpperCase() || 'AVAILABLE';
  const colors = STATUS_COLORS[statusKey] || DEFAULT_STATUS_COLOR;
  const isOccupied = statusKey === 'OCCUPIED';
  const isMaintenance = statusKey === 'MAINTENANCE';
  const isCritical = bed.patient?.priority === 'CRITICAL';

  const tileStyle = {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    background: colors.bg,
    border: `2px solid ${colors.border}40`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    animation: isCritical ? 'pulse 2s ease-in-out infinite' : 'none',
  };

  const bedNumStyle = {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: colors.text,
    lineHeight: 1,
  };

  const iconStyle = {
    opacity: 0.8,
  };

  return (
    <>
      {/* Inject pulse animation if critical */}
      {isCritical && (
        <style>{`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
            50%      { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          }
        `}</style>
      )}
      <div
        style={tileStyle}
        onClick={onClick}
        title={`${bed.bedNumber} – ${statusKey}${bed.patient ? ` (${bed.patient.name})` : ''}`}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.background = colors.hoverBg;
          e.currentTarget.style.borderColor = colors.border;
          e.currentTarget.style.boxShadow = `0 4px 16px ${colors.border}30`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = colors.bg;
          e.currentTarget.style.borderColor = `${colors.border}40`;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {isOccupied && <User size={14} color={colors.text} style={iconStyle} />}
        {isMaintenance && <Wrench size={14} color={colors.text} style={iconStyle} />}
        <span style={bedNumStyle}>{bed.bedNumber}</span>
      </div>
    </>
  );
}
