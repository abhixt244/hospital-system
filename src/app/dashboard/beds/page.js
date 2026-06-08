'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  BedDouble, Filter, Search, X, ChevronDown,
  CheckCircle, AlertTriangle, Wrench, Shield,
  User, RefreshCw,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

/**
 * Bed Management page
 * - Filter bar: Ward, Status, Bed Type
 * - BedGrid grouped by ward
 * - Bed detail modal with status change actions
 * - Summary stats at top
 */
export default function BedsPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [beds, setBeds] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterWard, setFilterWard] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // Modal
  const [selectedBed, setSelectedBed] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const userRole = session?.user?.role;
  const isAdmin = userRole === 'ADMIN';

  // Fetch wards
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const res = await fetch('/api/wards');
        if (res.ok) {
          const data = await res.json();
          setWards(data);
        }
      } catch (err) {
        console.error('Failed to fetch wards:', err);
      }
    };
    fetchWards();
  }, []);

  // Fetch beds with filters
  const fetchBeds = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterWard) params.set('wardId', filterWard);
      if (filterStatus) params.set('status', filterStatus);
      if (filterType) params.set('type', filterType);

      const res = await fetch(`/api/beds?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch beds');
      const data = await res.json();
      setBeds(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterWard, filterStatus, filterType]);

  useEffect(() => {
    fetchBeds();
  }, [fetchBeds]);

  // Status change handler
  const handleStatusChange = async () => {
    if (!selectedBed || !newStatus) return;

    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/beds/${selectedBed.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update bed status');
      }

      addToast(`Bed ${selectedBed.bedNumber} status updated to ${newStatus}`, 'success');
      setModalOpen(false);
      setSelectedBed(null);
      fetchBeds();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openBedModal = (bed) => {
    setSelectedBed(bed);
    setNewStatus(bed.status);
    setModalOpen(true);
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return { color: 'var(--status-available)', icon: <CheckCircle size={14} />, label: 'Available' };
      case 'OCCUPIED':
        return { color: 'var(--status-occupied)', icon: <User size={14} />, label: 'Occupied' };
      case 'MAINTENANCE':
        return { color: 'var(--status-maintenance)', icon: <Wrench size={14} />, label: 'Maintenance' };
      case 'RESERVED':
        return { color: 'var(--status-reserved)', icon: <Shield size={14} />, label: 'Reserved' };
      default:
        return { color: 'var(--text-muted)', icon: null, label: status };
    }
  };

  // Summary stats
  const statCounts = {
    available: beds.filter(b => b.status === 'AVAILABLE').length,
    occupied: beds.filter(b => b.status === 'OCCUPIED').length,
    maintenance: beds.filter(b => b.status === 'MAINTENANCE').length,
    reserved: beds.filter(b => b.status === 'RESERVED').length,
  };

  // Group beds by ward
  const bedsByWard = beds.reduce((acc, bed) => {
    const wardName = bed.ward?.name || 'Unassigned';
    if (!acc[wardName]) acc[wardName] = [];
    acc[wardName].push(bed);
    return acc;
  }, {});

  const bedTypes = ['GENERAL', 'SEMI_PRIVATE', 'PRIVATE', 'ICU', 'NICU', 'EMERGENCY'];
  const bedStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'];

  // Loading skeleton
  if (loading && beds.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="skeleton" style={{ width: '200px', height: '28px', borderRadius: '8px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '48px', borderRadius: '12px' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px', animationDelay: `${i * 0.03}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">
          <BedDouble size={24} style={{ color: 'var(--accent-teal)' }} />
          Bed Management
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 400,
            color: 'var(--text-muted)',
            marginLeft: '0.5rem',
          }}>
            ({beds.length} beds)
          </span>
        </h1>
      </div>

      {/* Summary stats badges */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
      }}>
        {[
          { label: 'Available', count: statCounts.available, color: 'var(--status-available)' },
          { label: 'Occupied', count: statCounts.occupied, color: 'var(--status-occupied)' },
          { label: 'Maintenance', count: statCounts.maintenance, color: 'var(--status-maintenance)' },
          { label: 'Reserved', count: statCounts.reserved, color: 'var(--status-reserved)' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-primary)',
              borderRadius: '20px',
              fontSize: '0.8rem',
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: stat.color,
            }} />
            <span style={{ color: 'var(--text-secondary)' }}>{stat.label}:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />

        {/* Ward filter */}
        <select
          value={filterWard}
          onChange={(e) => setFilterWard(e.target.value)}
          className="select-input"
        >
          <option value="">All Wards</option>
          {wards.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="select-input"
        >
          <option value="">All Status</option>
          {bedStatuses.map(s => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="select-input"
        >
          <option value="">All Types</option>
          {bedTypes.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>

        {/* Clear filters */}
        {(filterWard || filterStatus || filterType) && (
          <button
            className="btn btn-ghost"
            onClick={() => { setFilterWard(''); setFilterStatus(''); setFilterType(''); }}
            style={{ fontSize: '0.8rem' }}
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <AlertTriangle size={32} style={{ color: 'var(--status-critical)', marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--text-primary)', margin: '0 0 1rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchBeds}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Bed grid grouped by ward */}
      {Object.keys(bedsByWard).length > 0 ? (
        Object.entries(bedsByWard).map(([wardName, wardBeds]) => (
          <div key={wardName} style={{ marginBottom: '2rem' }}>
            <h3 style={{
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontWeight: 600,
              margin: '0 0 0.75rem',
              padding: '0.5rem 0',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              {wardName}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({wardBeds.length} beds)
              </span>
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '0.75rem',
            }}>
              {wardBeds.map((bed) => {
                const statusInfo = getStatusInfo(bed.status);
                return (
                  <button
                    key={bed.id}
                    onClick={() => openBedModal(bed)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      padding: '1rem 0.5rem',
                      background: 'var(--glass-bg)',
                      border: `1px solid ${bed.status === 'OCCUPIED' ? 'rgba(239,68,68,0.3)' : 'var(--border-primary)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 4px 16px ${statusInfo.color}22`;
                      e.currentTarget.style.borderColor = statusInfo.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = bed.status === 'OCCUPIED' ? 'rgba(239,68,68,0.3)' : 'var(--border-primary)';
                    }}
                  >
                    {/* Status indicator dot */}
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: statusInfo.color,
                      boxShadow: `0 0 6px ${statusInfo.color}`,
                    }} />

                    <BedDouble size={20} style={{ color: statusInfo.color }} />
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}>
                      {bed.bedNumber}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      color: statusInfo.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {statusInfo.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <BedDouble size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.4 }} />
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No beds found with the current filters.</p>
        </div>
      )}

      {/* Bed detail modal */}
      {modalOpen && selectedBed && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '2rem',
              animation: 'slideUp 0.3s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem', fontSize: '1.25rem' }}>
                  Bed {selectedBed.bedNumber}
                </h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>
                  {selectedBed.ward?.name || 'Unassigned Ward'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Bed details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--border-primary)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  color: getStatusInfo(selectedBed.status).color,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}>
                  {getStatusInfo(selectedBed.status).icon}
                  {getStatusInfo(selectedBed.status).label}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--border-primary)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Type</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                  {selectedBed.type?.replace(/_/g, ' ') || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--border-primary)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ward</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                  {selectedBed.ward?.name || 'N/A'}
                </span>
              </div>
              {selectedBed.patient && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--border-primary)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Patient</span>
                  <span style={{ color: 'var(--accent-teal)', fontSize: '0.85rem', fontWeight: 500 }}>
                    {selectedBed.patient.name}
                  </span>
                </div>
              )}
            </div>

            {/* Admin actions: Change status */}
            {isAdmin && (
              <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Change Status
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="select-input"
                    style={{ flex: 1 }}
                  >
                    {bedStatuses.map(s => (
                      <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={handleStatusChange}
                    disabled={updatingStatus || newStatus === selectedBed.status}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {updatingStatus ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
}
