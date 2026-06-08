'use client';

import { useState } from 'react';
import {
  Wind, Cylinder, Zap, Accessibility, Droplets, HeartPulse, Droplet, Scissors,
  Package, Edit3, Check, X, Plus, Minus
} from 'lucide-react';

const iconMap = {
  'wind': Wind,
  'cylinder': Cylinder,
  'zap': Zap,
  'accessibility': Accessibility,
  'droplets': Droplets,
  'heart-pulse': HeartPulse,
  'droplet': Droplet,
  'scissors': Scissors,
};

export default function ResourceCard({ resource, onUpdate, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(resource.available);

  const percentage = Math.round((resource.available / resource.total) * 100);
  const getBarColor = () => {
    if (percentage > 60) return 'var(--status-available)';
    if (percentage > 30) return 'var(--status-maintenance)';
    return 'var(--status-occupied)';
  };

  const IconComponent = iconMap[resource.icon] || Package;

  const handleSave = () => {
    const val = Math.max(0, Math.min(resource.total, editValue));
    onUpdate(resource.id, val);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValue(resource.available);
    setEditing(false);
  };

  return (
    <div style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      transition: 'all var(--transition-normal)',
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-glass-hover)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-glass)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${getBarColor()}22, ${getBarColor()}44)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconComponent size={22} style={{ color: getBarColor() }} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              {resource.name}
            </h3>
            <span style={{
              fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
              color: 'var(--text-muted)', letterSpacing: '0.5px',
            }}>
              {resource.category}
            </span>
          </div>
        </div>

        {canEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              background: 'transparent', border: '1px solid var(--border-glass)',
              borderRadius: '8px', padding: '6px', cursor: 'pointer',
              color: 'var(--text-secondary)', transition: 'all var(--transition-fast)',
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--accent-teal)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Edit3 size={14} />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          height: '8px', borderRadius: '4px',
          background: 'var(--bg-tertiary)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '4px',
            background: `linear-gradient(90deg, ${getBarColor()}, ${getBarColor()}cc)`,
            width: `${percentage}%`,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 0 8px ${getBarColor()}66`,
          }} />
        </div>
      </div>

      {/* Stats */}
      {!editing ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: '700', fontSize: '18px', color: getBarColor() }}>
              {resource.available}
            </span>
            {' / '}
            <span style={{ fontWeight: '500' }}>{resource.total}</span>
            {' available'}
          </span>
          <span style={{
            fontSize: '14px', fontWeight: '700', color: getBarColor(),
          }}>
            {percentage}%
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setEditValue(Math.max(0, editValue - 1))}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Minus size={14} />
          </button>
          <input
            type="number"
            value={editValue}
            onChange={e => setEditValue(parseInt(e.target.value) || 0)}
            min={0}
            max={resource.total}
            style={{
              width: '60px', textAlign: 'center', padding: '6px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px',
            }}
          />
          <button
            onClick={() => setEditValue(Math.min(resource.total, editValue + 1))}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Plus size={14} />
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
            <button onClick={handleSave} style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--status-available)', border: 'none',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={14} />
            </button>
            <button onClick={handleCancel} style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--status-occupied)', border: 'none',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
