'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BarChart3, Calendar } from 'lucide-react';
import TrendChart from '@/components/TrendChart';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Tooltip, Legend, Filler
);

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');

  const userRole = session?.user?.role;

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (userRole && userRole !== 'ADMIN' && userRole !== 'DOCTOR') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '60vh', color: 'var(--text-muted)', fontSize: '16px',
      }}>
        You do not have permission to view analytics.
      </div>
    );
  }

  // Build chart data
  const admissionTrendData = analytics ? {
    labels: analytics.admissionsByDay?.map(d => d.date) || [],
    datasets: [
      {
        label: 'Admissions',
        data: analytics.admissionsByDay?.map(d => d.count) || [],
        borderColor: 'hsl(174, 72%, 40%)',
        backgroundColor: 'hsla(174, 72%, 40%, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'hsl(174, 72%, 40%)',
        pointBorderColor: 'hsl(222, 30%, 8%)',
        pointBorderWidth: 2,
      },
      {
        label: 'Discharges',
        data: analytics.dischargesByDay?.map(d => d.count) || [],
        borderColor: 'hsl(270, 60%, 55%)',
        backgroundColor: 'hsla(270, 60%, 55%, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'hsl(270, 60%, 55%)',
        pointBorderColor: 'hsl(222, 30%, 8%)',
        pointBorderWidth: 2,
      },
    ],
  } : null;

  const wardOccupancyData = analytics ? {
    labels: analytics.occupancyByWard?.map(w => w.ward) || [],
    datasets: [{
      label: 'Occupancy %',
      data: analytics.occupancyByWard?.map(w => w.percentage) || [],
      backgroundColor: [
        'hsla(174, 72%, 40%, 0.7)',
        'hsla(220, 70%, 55%, 0.7)',
        'hsla(270, 60%, 55%, 0.7)',
        'hsla(40, 90%, 55%, 0.7)',
        'hsla(0, 75%, 55%, 0.7)',
      ],
      borderColor: [
        'hsl(174, 72%, 40%)',
        'hsl(220, 70%, 55%)',
        'hsl(270, 60%, 55%)',
        'hsl(40, 90%, 55%)',
        'hsl(0, 75%, 55%)',
      ],
      borderWidth: 1,
      borderRadius: 6,
    }],
  } : null;

  const priorityData = analytics ? {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [
        analytics.priorityBreakdown?.CRITICAL || 0,
        analytics.priorityBreakdown?.HIGH || 0,
        analytics.priorityBreakdown?.MEDIUM || 0,
        analytics.priorityBreakdown?.LOW || 0,
      ],
      backgroundColor: [
        'hsl(0, 85%, 55%)',
        'hsl(25, 90%, 55%)',
        'hsl(40, 90%, 55%)',
        'hsl(145, 65%, 45%)',
      ],
      borderColor: 'hsl(222, 30%, 8%)',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  } : null;

  const bedTypeData = analytics ? {
    labels: analytics.bedTypeUtilization?.map(b => b.type) || [],
    datasets: [
      {
        label: 'Occupied',
        data: analytics.bedTypeUtilization?.map(b => b.occupied) || [],
        backgroundColor: 'hsla(0, 75%, 55%, 0.7)',
        borderColor: 'hsl(0, 75%, 55%)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Available',
        data: analytics.bedTypeUtilization?.map(b => b.total - b.occupied) || [],
        backgroundColor: 'hsla(145, 65%, 45%, 0.7)',
        borderColor: 'hsl(145, 65%, 45%)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  } : null;

  const ranges = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
  ];

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
            <BarChart3 size={28} style={{ color: 'var(--accent-purple)' }} />
            Analytics & Reports
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Hospital performance metrics and trends
          </p>
        </div>

        {/* Range Selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {ranges.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                background: range === r.key ? 'var(--accent-purple)' : 'var(--bg-glass)',
                border: `1px solid ${range === r.key ? 'var(--accent-purple)' : 'var(--border-glass)'}`,
                color: range === r.key ? 'white' : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Calendar size={13} />
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      {loading ? (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '20px',
        }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{
              height: '360px', borderRadius: 'var(--radius-lg)',
            }} />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '20px',
        }}>
          {/* Admissions & Discharges Trend */}
          <div style={{ animation: 'slideUp 0.4s ease both' }}>
            {admissionTrendData && (
              <TrendChart
                type="line"
                data={admissionTrendData}
                title="Admissions & Discharges Trend"
              />
            )}
          </div>

          {/* Ward Occupancy */}
          <div style={{ animation: 'slideUp 0.4s ease 0.1s both' }}>
            {wardOccupancyData && (
              <TrendChart
                type="bar"
                data={wardOccupancyData}
                title="Bed Occupancy by Ward"
                options={{
                  indexAxis: 'y',
                  scales: {
                    x: {
                      max: 100,
                      grid: { color: 'hsla(0,0%,100%,0.04)', drawBorder: false },
                      ticks: { color: 'hsl(220,15%,55%)', callback: v => v + '%', font: { size: 11 } },
                      border: { display: false },
                    },
                    y: {
                      grid: { display: false },
                      ticks: { color: 'hsl(220,15%,65%)', font: { size: 12 } },
                      border: { display: false },
                    },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            )}
          </div>

          {/* Priority Breakdown */}
          <div style={{ animation: 'slideUp 0.4s ease 0.2s both' }}>
            <div style={{
              background: 'var(--bg-glass)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)',
              padding: '24px',
            }}>
              <h3 style={{
                fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)',
                margin: '0 0 20px 0',
              }}>
                Patient Priority Breakdown
              </h3>
              <div style={{ height: '280px', position: 'relative' }}>
                {priorityData && (
                  <Doughnut
                    data={priorityData}
                    options={{
                      responsive: true, maintainAspectRatio: false, cutout: '65%',
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: 'hsl(220,15%,65%)', padding: 16, usePointStyle: true,
                            font: { size: 12, family: 'Inter, sans-serif' },
                          },
                        },
                        tooltip: {
                          backgroundColor: 'hsla(222,25%,16%,0.95)',
                          borderColor: 'hsla(0,0%,100%,0.1)', borderWidth: 1,
                          titleColor: '#f2f2f2', bodyColor: '#aaa',
                          padding: 12, cornerRadius: 8,
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bed Type Utilization */}
          <div style={{ animation: 'slideUp 0.4s ease 0.3s both' }}>
            {bedTypeData && (
              <TrendChart
                type="bar"
                data={bedTypeData}
                title="Bed Type Utilization"
                options={{
                  scales: {
                    x: {
                      stacked: true,
                      grid: { display: false },
                      ticks: { color: 'hsl(220,15%,65%)', font: { size: 11 } },
                      border: { display: false },
                    },
                    y: {
                      stacked: true,
                      grid: { color: 'hsla(0,0%,100%,0.04)', drawBorder: false },
                      ticks: { color: 'hsl(220,15%,55%)', font: { size: 11 } },
                      border: { display: false },
                      beginAtZero: true,
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
