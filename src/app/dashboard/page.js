'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  BedDouble, Users, CheckCircle, AlertTriangle,
  Activity, Clock, TrendingUp, ArrowUp, ArrowDown,
  RefreshCw,
} from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import OccupancyChart from '@/components/OccupancyChart';

/**
 * Dashboard home page
 * - Top: 4 stats cards (Total, Occupied, Available, Critical)
 * - Middle: Occupancy donut chart + Ward breakdown
 * - Bottom: Recent activity feed
 * - Auto-refreshes every 30 seconds
 */
export default function DashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchDashboard(true), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // Relative time helper
  const getRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
  };

  // Activity icon based on action type
  const getActivityIcon = (action) => {
    switch (action) {
      case 'ADMISSION': return <ArrowDown size={16} style={{ color: 'var(--accent-teal)' }} />;
      case 'DISCHARGE': return <ArrowUp size={16} style={{ color: 'var(--accent-purple)' }} />;
      case 'TRANSFER': return <RefreshCw size={16} style={{ color: 'var(--accent-blue)' }} />;
      case 'BED_STATUS_CHANGE': return <BedDouble size={16} style={{ color: 'var(--status-maintenance)' }} />;
      default: return <Activity size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="skeleton" style={{ width: '200px', height: '28px', borderRadius: '8px' }} />
        </div>

        {/* Stats skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card skeleton" style={{ height: '140px', animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>

        {/* Charts skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="glass-card skeleton" style={{ height: '340px' }} />
          <div className="glass-card skeleton" style={{ height: '340px' }} />
        </div>

        {/* Activity skeleton */}
        <div className="glass-card skeleton" style={{ height: '300px' }} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertTriangle size={48} style={{ color: 'var(--status-critical)', marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Failed to Load Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => { setLoading(true); fetchDashboard(); }}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    totalBeds = 0,
    occupiedBeds = 0,
    availableBeds = 0,
    maintenanceBeds = 0,
    criticalPatients = 0,
    wardStats = [],
    recentActivity = [],
  } = dashboardData || {};

  // Transform ward data for display
  const wardBreakdown = wardStats.map(ward => ({
    ...ward,
    occupiedBeds: ward.OCCUPIED || 0,
  }));

  // Calculate overall bed status breakdown for the chart
  const bedStatusBreakdown = {
    available: availableBeds || 0,
    occupied: occupiedBeds || 0,
    maintenance: maintenanceBeds || 0,
    reserved: (totalBeds - availableBeds - occupiedBeds - maintenanceBeds) || 0,
  };

  // Transform activity data
  const recentActivities = recentActivity.map(activity => ({
    ...activity,
    description: activity.details || activity.action,
    performedBy: activity.userId ? `User ${activity.userId}` : '',
  }));

  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">
            Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Welcome back, {session?.user?.name || 'User'}. Here&apos;s your hospital overview.
          </p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Middle section: Chart + Ward breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Occupancy donut chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>
            Bed Occupancy Overview
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '260px' }}>
            <OccupancyChart data={bedStatusBreakdown} />
          </div>
        </div>

        {/* Ward breakdown */}
        <div className="glass-card" style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '400px' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>
            Ward-wise Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {wardBreakdown.length > 0 ? wardBreakdown.map((ward, i) => {
              const wardOccupancy = ward.totalBeds > 0
                ? Math.round((ward.occupiedBeds / ward.totalBeds) * 100)
                : 0;
              return (
                <div
                  key={ward.id || i}
                  style={{
                    padding: '0.875rem 1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-primary)',
                    animation: `fadeSlideUp 0.4s ease-out ${i * 0.05}s both`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {ward.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {ward.occupiedBeds}/{ward.totalBeds} beds
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'var(--bg-primary)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${wardOccupancy}%`,
                      height: '100%',
                      background: wardOccupancy > 85
                        ? 'var(--status-critical)'
                        : wardOccupancy > 60
                          ? 'var(--status-maintenance)'
                          : 'var(--accent-teal)',
                      borderRadius: '3px',
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '0.25rem',
                  }}>
                    <span style={{
                      fontSize: '0.7rem',
                      color: wardOccupancy > 85 ? 'var(--status-critical)' : 'var(--text-muted)',
                      fontWeight: wardOccupancy > 85 ? 600 : 400,
                    }}>
                      {wardOccupancy}% occupied
                    </span>
                  </div>
                </div>
              );
            }) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                No ward data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section: Recent Activity feed */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            <Clock size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Recent Activity
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Auto-updates every 30s
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {recentActivities.length > 0 ? recentActivities.map((activity, i) => (
            <div
              key={activity.id || i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'var(--bg-tertiary)',
                borderRadius: '10px',
                border: '1px solid var(--border-primary)',
                animation: `fadeSlideUp 0.3s ease-out ${i * 0.05}s both`,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            >
              {/* Activity icon */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {getActivityIcon(activity.action)}
              </div>

              {/* Activity text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {activity.description}
                </p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {activity.performedBy && `by ${activity.performedBy}`}
                </p>
              </div>

              {/* Relative time */}
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {getRelativeTime(activity.createdAt)}
              </span>
            </div>
          )) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--text-muted)',
            }}>
              <Activity size={32} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Inline animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}} />
    </div>
  );
}
