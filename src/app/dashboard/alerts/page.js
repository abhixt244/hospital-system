'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AlertTriangle, Plus, Shield, Bell } from 'lucide-react';
import AlertCard from '@/components/AlertCard';
import Modal from '@/components/Modal';
import Badge from '@/components/Badge';
import { useToast } from '@/context/ToastContext';

export default function AlertsPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active'); // 'active' | 'resolved'
  const [showCreate, setShowCreate] = useState(false);
  const [wards, setWards] = useState([]);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '', message: '', priority: 'HIGH', wardId: '', patientId: '',
  });

  const userRole = session?.user?.role;
  const canCreate = userRole === 'ADMIN' || userRole === 'DOCTOR';
  const canResolve = userRole === 'ADMIN' || userRole === 'DOCTOR';

  useEffect(() => {
    fetchAlerts();
    fetchWards();
  }, [tab]);

  const fetchAlerts = async () => {
    try {
      const resolved = tab === 'resolved' ? 'true' : 'false';
      const res = await fetch(`/api/alerts?resolved=${resolved}`);
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast('Failed to load alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      const res = await fetch('/api/wards');
      const data = await res.json();
      setWards(data);
    } catch (err) {
      console.error('Failed to load wards:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      addToast('Title and message are required', 'warning');
      return;
    }
    setCreating(true);
    try {
      const body = {
        title: form.title,
        message: form.message,
        priority: form.priority,
      };
      if (form.wardId) body.wardId = parseInt(form.wardId);
      if (form.patientId) body.patientId = parseInt(form.patientId);

      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create alert');
      addToast('Emergency alert created', 'success');
      setShowCreate(false);
      setForm({ title: '', message: '', priority: 'HIGH', wardId: '', patientId: '' });
      setTab('active');
      fetchAlerts();
    } catch (err) {
      addToast('Failed to create alert', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleResolve = async (id) => {
    if (!confirm('Are you sure you want to resolve this alert?')) return;
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: true }),
      });
      if (!res.ok) throw new Error('Failed to resolve alert');
      addToast('Alert resolved successfully', 'success');
      fetchAlerts();
    } catch (err) {
      addToast('Failed to resolve alert', 'error');
    }
  };

  const activeCount = tab === 'active' ? alerts.length : 0;
  const criticalAlerts = alerts.filter(a => a.priority === 'CRITICAL' && !a.resolved);
  const otherAlerts = alerts.filter(a => !(a.priority === 'CRITICAL' && !a.resolved));

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    transition: 'border-color var(--transition-fast)',
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
    display: 'block',
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '28px', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)',
            margin: 0, display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <AlertTriangle size={28} style={{ color: 'var(--priority-critical)' }} />
            Emergency Alerts
            {tab === 'active' && alerts.length > 0 && (
              <span style={{
                fontSize: '14px', fontWeight: '600', padding: '4px 12px',
                borderRadius: '20px',
                background: 'var(--priority-critical)22',
                color: 'var(--priority-critical)',
              }}>
                {alerts.length} active
              </span>
            )}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Monitor and manage critical hospital alerts
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--priority-critical), var(--priority-high))',
              border: 'none', color: 'white',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: '0 4px 12px hsla(0, 85%, 55%, 0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px hsla(0, 85%, 55%, 0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px hsla(0, 85%, 55%, 0.3)'; }}
          >
            <Plus size={16} />
            Create Alert
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['active', 'resolved'].map(t => (
          <button
            key={t}
            onClick={() => { setLoading(true); setTab(t); }}
            style={{
              padding: '8px 20px', borderRadius: '10px',
              background: tab === t ? (t === 'active' ? 'var(--priority-critical)' : 'var(--status-available)') : 'var(--bg-glass)',
              border: `1px solid ${tab === t ? 'transparent' : 'var(--border-glass)'}`,
              color: tab === t ? 'white' : 'var(--text-secondary)',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              textTransform: 'capitalize',
            }}
          >
            {t === 'active' ? '🔴 Active' : '✅ Resolved'}
          </button>
        ))}
      </div>

      {/* Alert List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{
              height: '140px', borderRadius: 'var(--radius-lg)',
            }} />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)',
        }}>
          <Bell size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px', margin: '0 0 4px 0' }}>
            {tab === 'active' ? 'No active alerts' : 'No resolved alerts'}
          </p>
          <p style={{ fontSize: '13px' }}>
            {tab === 'active' ? 'All systems are running smoothly' : 'No resolved alerts to show'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Critical alerts first with glow */}
          {criticalAlerts.length > 0 && (
            <div style={{
              borderRadius: 'var(--radius-lg)', padding: '2px',
              background: 'linear-gradient(135deg, var(--priority-critical)33, transparent)',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {criticalAlerts.map((alert, idx) => (
                  <div key={alert.id} style={{ animation: `slideUp 0.4s ease ${idx * 0.05}s both` }}>
                    <AlertCard alert={alert} onResolve={handleResolve} canResolve={canResolve} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other alerts */}
          {otherAlerts.map((alert, idx) => (
            <div key={alert.id} style={{
              animation: `slideUp 0.4s ease ${(criticalAlerts.length + idx) * 0.05}s both`,
            }}>
              <AlertCard alert={alert} onResolve={handleResolve} canResolve={canResolve} />
            </div>
          ))}
        </div>
      )}

      {/* Create Alert Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Emergency Alert" size="md">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Alert title..."
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Message *</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Describe the emergency..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                style={inputStyle}
              >
                <option value="CRITICAL">🔴 Critical</option>
                <option value="HIGH">🟠 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">🟢 Low</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Ward (optional)</label>
              <select
                value={form.wardId}
                onChange={e => setForm({ ...form, wardId: e.target.value })}
                style={inputStyle}
              >
                <option value="">All Wards</option>
                {wards.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '10px',
              paddingTop: '12px', borderTop: '1px solid var(--border-glass)',
            }}>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                style={{
                  padding: '10px 20px', borderRadius: '10px',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '500',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: '10px 24px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--priority-critical), var(--priority-high))',
                  border: 'none', color: 'white',
                  fontSize: '14px', fontWeight: '600', cursor: creating ? 'not-allowed' : 'pointer',
                  opacity: creating ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <AlertTriangle size={15} />
                {creating ? 'Creating...' : 'Create Alert'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
