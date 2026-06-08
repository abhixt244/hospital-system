'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users, Search, Plus, Filter, X, ChevronLeft, ChevronRight,
  AlertTriangle, Eye, LogOut, ArrowRightLeft, RefreshCw,
  FileText, Clock, Activity,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

/**
 * Patient Management page
 * - Search, filter by status & priority
 * - Admit patient modal (Admin/Doctor)
 * - Patient table with View/Discharge/Transfer actions
 * - Pagination
 */
export default function PatientsPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [dischargeConfirmOpen, setDischargeConfirmOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Admit form
  const [admitForm, setAdmitForm] = useState({
    name: '', age: '', gender: 'MALE', contactNumber: '',
    emergencyContact: '', diagnosis: '', priority: 'MEDIUM',
    bedId: '', doctorNotes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Available beds for admit/transfer
  const [availableBeds, setAvailableBeds] = useState([]);

  // Transfer state
  const [transferBedId, setTransferBedId] = useState('');

  const userRole = session?.user?.role;
  const canAdmit = userRole === 'ADMIN' || userRole === 'DOCTOR';

  // Fetch patients
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      if (filterPriority) params.set('priority', filterPriority);
      params.set('page', page.toString());
      params.set('limit', pageSize.toString());

      const res = await fetch(`/api/patients?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch patients');
      const data = await res.json();
      setPatients(data.patients || data);
      setTotalCount(data.total || (data.patients || data).length);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterPriority, page]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Fetch available beds
  const fetchAvailableBeds = async () => {
    try {
      const res = await fetch('/api/beds?status=AVAILABLE');
      if (res.ok) {
        const data = await res.json();
        setAvailableBeds(data);
      }
    } catch (err) {
      console.error('Failed to fetch available beds:', err);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // Admit patient handler
  const handleAdmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...admitForm,
          age: parseInt(admitForm.age),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to admit patient');
      }

      addToast('Patient admitted successfully', 'success');
      setAdmitModalOpen(false);
      setAdmitForm({
        name: '', age: '', gender: 'MALE', contactNumber: '',
        emergencyContact: '', diagnosis: '', priority: 'MEDIUM',
        bedId: '', doctorNotes: '',
      });
      fetchPatients();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Discharge patient handler
  const handleDischarge = async () => {
    if (!selectedPatient) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/patients/${selectedPatient.id}/discharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to discharge patient');
      }

      addToast(`${selectedPatient.name} has been discharged`, 'success');
      setDischargeConfirmOpen(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Transfer patient handler
  const handleTransfer = async () => {
    if (!selectedPatient || !transferBedId) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/patients/${selectedPatient.id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bedId: transferBedId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to transfer patient');
      }

      addToast(`${selectedPatient.name} transferred successfully`, 'success');
      setTransferModalOpen(false);
      setSelectedPatient(null);
      setTransferBedId('');
      fetchPatients();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Priority badge colors
  const getPriorityStyle = (priority) => {
    const styles = {
      CRITICAL: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
      HIGH: { bg: 'rgba(249,115,22,0.15)', color: '#f97316', border: 'rgba(249,115,22,0.3)' },
      MEDIUM: { bg: 'rgba(234,179,8,0.15)', color: '#eab308', border: 'rgba(234,179,8,0.3)' },
      LOW: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
    };
    return styles[priority] || styles.MEDIUM;
  };

  const getStatusStyle = (status) => {
    const styles = {
      ADMITTED: { bg: 'rgba(45,212,191,0.15)', color: '#2dd4bf' },
      DISCHARGED: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
      TRANSFERRED: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
    };
    return styles[status] || styles.ADMITTED;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Loading skeleton
  if (loading && patients.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="skeleton" style={{ width: '240px', height: '28px', borderRadius: '8px' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="skeleton" style={{ flex: 1, height: '42px', borderRadius: '10px' }} />
          <div className="skeleton" style={{ width: '150px', height: '42px', borderRadius: '10px' }} />
          <div className="skeleton" style={{ width: '150px', height: '42px', borderRadius: '10px' }} />
        </div>
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '56px', margin: '0.5rem 1rem', borderRadius: '8px', animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title">
          <Users size={24} style={{ color: 'var(--accent-teal)' }} />
          Patient Management
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
            ({totalCount} patients)
          </span>
        </h1>
        {canAdmit && (
          <button
            className="btn btn-primary"
            onClick={() => { setAdmitModalOpen(true); fetchAvailableBeds(); }}
          >
            <Plus size={16} /> Admit Patient
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{
          flex: 1,
          minWidth: '200px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '0.875rem',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search patients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-input"
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="select-input"
        >
          <option value="">All Status</option>
          <option value="ADMITTED">Admitted</option>
          <option value="DISCHARGED">Discharged</option>
          <option value="TRANSFERRED">Transferred</option>
        </select>

        {/* Priority filter */}
        <select
          value={filterPriority}
          onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
          className="select-input"
        >
          <option value="">All Priority</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <AlertTriangle size={32} style={{ color: 'var(--status-critical)', marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--text-primary)', margin: '0 0 1rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchPatients}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Patient table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                {['Name', 'Age/Gender', 'Diagnosis', 'Priority', 'Status', 'Bed', 'Actions'].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: '0.875rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.length > 0 ? patients.map((patient, i) => {
                const priorityStyle = getPriorityStyle(patient.priority);
                const statusStyle = getStatusStyle(patient.status);
                return (
                  <tr
                    key={patient.id}
                    style={{
                      borderBottom: '1px solid var(--border-primary)',
                      transition: 'background 0.15s ease',
                      animation: `fadeIn 0.3s ease ${i * 0.03}s both`,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        {patient.name}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {patient.age} / {patient.gender?.charAt(0)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {patient.diagnosis || '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: priorityStyle.bg,
                        color: priorityStyle.color,
                        border: `1px solid ${priorityStyle.border}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}>
                        {patient.priority === 'CRITICAL' && <AlertTriangle size={10} />}
                        {patient.priority}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                      }}>
                        {patient.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {patient.bed?.bedNumber || '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        {/* View */}
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '0.375rem', fontSize: '0.75rem' }}
                          onClick={() => { setSelectedPatient(patient); setViewModalOpen(true); }}
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        {/* Discharge (only if admitted) */}
                        {patient.status === 'ADMITTED' && canAdmit && (
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '0.375rem', fontSize: '0.75rem', color: 'var(--status-critical)' }}
                            onClick={() => { setSelectedPatient(patient); setDischargeConfirmOpen(true); }}
                            title="Discharge"
                          >
                            <LogOut size={14} />
                          </button>
                        )}
                        {/* Transfer (only if admitted) */}
                        {patient.status === 'ADMITTED' && canAdmit && (
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '0.375rem', fontSize: '0.75rem', color: 'var(--accent-purple)' }}
                            onClick={() => { setSelectedPatient(patient); setTransferModalOpen(true); fetchAvailableBeds(); }}
                            title="Transfer"
                          >
                            <ArrowRightLeft size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center' }}>
                    <Users size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.4 }} />
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>No patients found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.875rem 1rem',
            borderTop: '1px solid var(--border-primary)',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Page {page} of {totalPages} ({totalCount} total)
            </span>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ padding: '0.375rem 0.625rem' }}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{ padding: '0.375rem 0.625rem' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODALS ===== */}

      {/* View Patient Modal */}
      {viewModalOpen && selectedPatient && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '1rem',
          }}
          onClick={() => setViewModalOpen(false)}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: '520px', padding: '2rem', maxHeight: '80vh', overflowY: 'auto', animation: 'slideUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.2rem' }}>Patient Details</h2>
              <button onClick={() => setViewModalOpen(false)} style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            {[
              { label: 'Name', value: selectedPatient.name },
              { label: 'Age', value: selectedPatient.age },
              { label: 'Gender', value: selectedPatient.gender },
              { label: 'Contact', value: selectedPatient.contactNumber || '—' },
              { label: 'Emergency Contact', value: selectedPatient.emergencyContact || '—' },
              { label: 'Diagnosis', value: selectedPatient.diagnosis || '—' },
              { label: 'Priority', value: selectedPatient.priority },
              { label: 'Status', value: selectedPatient.status },
              { label: 'Bed', value: selectedPatient.bed?.bedNumber || '—' },
              { label: 'Ward', value: selectedPatient.bed?.ward?.name || '—' },
              { label: 'Admitted', value: selectedPatient.admissionDate ? new Date(selectedPatient.admissionDate).toLocaleDateString() : '—' },
              { label: 'Doctor Notes', value: selectedPatient.doctorNotes || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-primary)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admit Patient Modal */}
      {admitModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '1rem',
          }}
          onClick={() => setAdmitModalOpen(false)}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: '560px', padding: '2rem', maxHeight: '85vh', overflowY: 'auto', animation: 'slideUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.2rem' }}>Admit New Patient</h2>
              <button onClick={() => setAdmitModalOpen(false)} style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Full Name *</label>
                <input type="text" className="text-input" required value={admitForm.name} onChange={(e) => setAdmitForm(f => ({ ...f, name: e.target.value }))} placeholder="Patient full name" />
              </div>

              {/* Age & Gender row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Age *</label>
                  <input type="number" className="text-input" required min="0" max="150" value={admitForm.age} onChange={(e) => setAdmitForm(f => ({ ...f, age: e.target.value }))} placeholder="Age" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Gender *</label>
                  <select className="select-input" value={admitForm.gender} onChange={(e) => setAdmitForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Contact & Emergency Contact row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Contact Number</label>
                  <input type="text" className="text-input" value={admitForm.contactNumber} onChange={(e) => setAdmitForm(f => ({ ...f, contactNumber: e.target.value }))} placeholder="Phone number" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Emergency Contact</label>
                  <input type="text" className="text-input" value={admitForm.emergencyContact} onChange={(e) => setAdmitForm(f => ({ ...f, emergencyContact: e.target.value }))} placeholder="Emergency phone" />
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Diagnosis</label>
                <input type="text" className="text-input" value={admitForm.diagnosis} onChange={(e) => setAdmitForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="Initial diagnosis" />
              </div>

              {/* Priority & Bed row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Priority *</label>
                  <select className="select-input" value={admitForm.priority} onChange={(e) => setAdmitForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Assign Bed</label>
                  <select className="select-input" value={admitForm.bedId} onChange={(e) => setAdmitForm(f => ({ ...f, bedId: e.target.value }))}>
                    <option value="">Select bed...</option>
                    {availableBeds.map(bed => (
                      <option key={bed.id} value={bed.id}>
                        {bed.bedNumber} - {bed.ward?.name} ({bed.type?.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctor Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Doctor Notes</label>
                <textarea
                  className="text-input"
                  rows={3}
                  value={admitForm.doctorNotes}
                  onChange={(e) => setAdmitForm(f => ({ ...f, doctorNotes: e.target.value }))}
                  placeholder="Additional notes..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Submit */}
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '0.5rem' }}>
                {submitting ? 'Admitting...' : 'Admit Patient'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Discharge Confirmation Modal */}
      {dischargeConfirmOpen && selectedPatient && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '1rem',
          }}
          onClick={() => setDischargeConfirmOpen(false)}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: '420px', padding: '2rem', animation: 'slideUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(239,68,68,0.15)', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
              }}>
                <LogOut size={24} style={{ color: '#ef4444' }} />
              </div>
              <h2 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem', fontSize: '1.15rem' }}>Discharge Patient</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
                Are you sure you want to discharge <strong style={{ color: 'var(--text-primary)' }}>{selectedPatient.name}</strong>?
                This will free up their assigned bed.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setDischargeConfirmOpen(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleDischarge}
                disabled={submitting}
                style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', padding: '0.625rem', cursor: 'pointer', fontWeight: 600 }}
              >
                {submitting ? 'Discharging...' : 'Confirm Discharge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Patient Modal */}
      {transferModalOpen && selectedPatient && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '1rem',
          }}
          onClick={() => setTransferModalOpen(false)}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: '460px', padding: '2rem', animation: 'slideUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.15rem' }}>Transfer Patient</h2>
              <button onClick={() => setTransferModalOpen(false)} style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem' }}>
              Transfer <strong style={{ color: 'var(--text-primary)' }}>{selectedPatient.name}</strong> to a new bed:
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>Select Available Bed *</label>
              <select
                className="select-input"
                value={transferBedId}
                onChange={(e) => setTransferBedId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Choose a bed...</option>
                {availableBeds.map(bed => (
                  <option key={bed.id} value={bed.id}>
                    {bed.bedNumber} - {bed.ward?.name} ({bed.type?.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
              {availableBeds.length === 0 && (
                <p style={{ color: 'var(--status-critical)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  No available beds found
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setTransferModalOpen(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleTransfer}
                disabled={submitting || !transferBedId}
                style={{ flex: 1 }}
              >
                {submitting ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </div>
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
