'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Package, Filter } from 'lucide-react';
import ResourceCard from '@/components/ResourceCard';
import { useToast } from '@/context/ToastContext';

export default function ResourcesPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const userRole = session?.user?.role;
  const canEdit = userRole === 'ADMIN' || userRole === 'NURSE';

  const categories = [
    { key: 'all', label: 'All Resources' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'supply', label: 'Supplies' },
  ];

  useEffect(() => {
    fetchResources();
  }, [activeCategory]);

  const fetchResources = async () => {
    try {
      const params = activeCategory !== 'all' ? `?category=${activeCategory}` : '';
      const res = await fetch(`/api/resources${params}`);
      const data = await res.json();
      setResources(data);
    } catch (err) {
      addToast('Failed to load resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, available) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available }),
      });
      if (!res.ok) throw new Error('Update failed');
      addToast('Resource updated successfully', 'success');
      fetchResources();
    } catch (err) {
      addToast('Failed to update resource', 'error');
    }
  };

  // Calculate overall utilization
  const totalAll = resources.reduce((sum, r) => sum + r.total, 0);
  const availableAll = resources.reduce((sum, r) => sum + r.available, 0);
  const utilizationPct = totalAll > 0 ? Math.round(((totalAll - availableAll) / totalAll) * 100) : 0;

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
            <Package size={28} style={{ color: 'var(--accent-teal)' }} />
            Resource Tracking
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Monitor and manage hospital resources and supplies
          </p>
        </div>

        {/* Overall Utilization */}
        <div style={{
          background: 'var(--bg-glass)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)',
          padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Overall Utilization</span>
          <span style={{
            fontSize: '20px', fontWeight: '700',
            color: utilizationPct > 70 ? 'var(--status-occupied)' : utilizationPct > 40 ? 'var(--status-maintenance)' : 'var(--status-available)',
          }}>
            {utilizationPct}%
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '24px',
      }}>
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => { setLoading(true); setActiveCategory(cat.key); }}
            style={{
              padding: '8px 20px', borderRadius: '10px',
              background: activeCategory === cat.key ? 'var(--accent-teal)' : 'var(--bg-glass)',
              border: `1px solid ${activeCategory === cat.key ? 'var(--accent-teal)' : 'var(--border-glass)'}`,
              color: activeCategory === cat.key ? 'white' : 'var(--text-secondary)',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton" style={{
              height: '160px', borderRadius: 'var(--radius-lg)',
            }} />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          color: 'var(--text-muted)',
        }}>
          <Package size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px' }}>No resources found</p>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {resources.map((resource, idx) => (
            <div key={resource.id} style={{
              animation: `slideUp 0.4s ease ${idx * 0.05}s both`,
            }}>
              <ResourceCard
                resource={resource}
                onUpdate={handleUpdate}
                canEdit={canEdit}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
