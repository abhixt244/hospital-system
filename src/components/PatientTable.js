'use client';

import { Eye, LogOut, ArrowRightLeft, Inbox } from 'lucide-react';
import Badge from './Badge';

export default function PatientTable({
  patients = [],
  onView,
  onDischarge,
  onTransfer,
  userRole = 'NURSE',
}) {
  // Check if user can perform actions
  const canDischarge = ['ADMIN', 'DOCTOR'].includes(userRole);
  const canTransfer = ['ADMIN', 'DOCTOR', 'NURSE'].includes(userRole);

  /* ---- Styles ---- */
  const styles = {
    wrapper: {
      width: '100%',
      overflowX: 'auto',
      borderRadius: '14px',
      border: '1px solid var(--glass-border, rgba(255,255,255,0.06))',
      background: 'var(--glass-bg, rgba(15, 23, 42, 0.5))',
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.84rem',
    },

    th: {
      padding: '14px 16px',
      textAlign: 'left',
      fontSize: '0.72rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--text-secondary, #94a3b8)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      whiteSpace: 'nowrap',
      background: 'rgba(255,255,255,0.02)',
    },

    td: {
      padding: '14px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      color: 'var(--text-primary, #f1f5f9)',
      whiteSpace: 'nowrap',
    },

    nameCell: {
      fontWeight: 600,
    },

    mutedText: {
      color: 'var(--text-secondary, #94a3b8)',
    },

    actions: {
      display: 'flex',
      gap: '6px',
    },

    actionBtn: (color) => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      border: `1px solid ${color}30`,
      background: `${color}10`,
      color: color,
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    }),

    empty: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      gap: '12px',
    },

    emptyIcon: {
      color: 'rgba(148,163,184,0.3)',
    },

    emptyText: {
      color: 'var(--text-secondary, #94a3b8)',
      fontSize: '0.9rem',
    },
  };

  // Empty state
  if (patients.length === 0) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.empty}>
          <Inbox size={48} style={styles.emptyIcon} />
          <span style={styles.emptyText}>No patients found</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Age</th>
            <th style={styles.th}>Gender</th>
            <th style={styles.th}>Diagnosis</th>
            <th style={styles.th}>Bed</th>
            <th style={styles.th}>Ward</th>
            <th style={styles.th}>Priority</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => {
            const isAdmitted = patient.status === 'ADMITTED';
            return (
              <tr
                key={patient.id}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <td style={{ ...styles.td, ...styles.nameCell }}>{patient.name}</td>
                <td style={styles.td}>{patient.age}</td>
                <td style={{ ...styles.td, ...styles.mutedText }}>{patient.gender}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      maxWidth: '180px',
                      display: 'inline-block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'middle',
                    }}
                    title={patient.diagnosis}
                  >
                    {patient.diagnosis}
                  </span>
                </td>
                <td style={styles.td}>{patient.bed?.bedNumber || '—'}</td>
                <td style={{ ...styles.td, ...styles.mutedText }}>
                  {patient.bed?.ward?.name || '—'}
                </td>
                <td style={styles.td}>
                  <Badge label={patient.priority} type={patient.priority?.toLowerCase()} size="xs" />
                </td>
                <td style={styles.td}>
                  <Badge label={patient.status} type={patient.status?.toLowerCase()} size="xs" />
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    {/* View */}
                    <button
                      style={styles.actionBtn('#60a5fa')}
                      title="View details"
                      onClick={() => onView?.(patient)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(96,165,250,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(96,165,250,0.06)';
                      }}
                    >
                      <Eye size={14} />
                    </button>

                    {/* Discharge */}
                    {isAdmitted && canDischarge && (
                      <button
                        style={styles.actionBtn('#f87171')}
                        title="Discharge"
                        onClick={() => onDischarge?.(patient)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(248,113,113,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(248,113,113,0.06)';
                        }}
                      >
                        <LogOut size={14} />
                      </button>
                    )}

                    {/* Transfer */}
                    {isAdmitted && canTransfer && (
                      <button
                        style={styles.actionBtn('#c084fc')}
                        title="Transfer"
                        onClick={() => onTransfer?.(patient)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(192,132,252,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(192,132,252,0.06)';
                        }}
                      >
                        <ArrowRightLeft size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
