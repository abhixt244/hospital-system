'use client';

import { useRef, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Plugin to draw center text
const centerTextPlugin = {
  id: 'centerText',
  beforeDraw(chart) {
    const { ctx, width, height } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data || meta.data.length === 0) return;

    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((a, b) => a + b, 0);
    const occupied = dataset.data[1] || 0; // index 1 = occupied
    const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Percentage
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillStyle = '#f2f2f2';
    ctx.fillText(`${percent}%`, width / 2, height / 2 - 8);

    // Label
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#999';
    ctx.fillText('Occupied', width / 2, height / 2 + 16);

    ctx.restore();
  },
};

export default function OccupancyChart({ data }) {
  if (!data) return null;

  const chartData = {
    labels: ['Available', 'Occupied', 'Maintenance', 'Reserved'],
    datasets: [{
      data: [
        data.available || 0,
        data.occupied || 0,
        data.maintenance || 0,
        data.reserved || 0,
      ],
      backgroundColor: [
        'hsl(145, 65%, 45%)',
        'hsl(0, 75%, 55%)',
        'hsl(40, 90%, 55%)',
        'hsl(220, 70%, 55%)',
      ],
      borderColor: 'hsl(222, 30%, 8%)',
      borderWidth: 3,
      hoverBorderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'hsl(220, 15%, 65%)',
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { size: 12, family: 'Inter, sans-serif' },
        },
      },
      tooltip: {
        backgroundColor: 'hsla(222, 25%, 16%, 0.95)',
        borderColor: 'hsla(0, 0%, 100%, 0.1)',
        borderWidth: 1,
        titleColor: '#f2f2f2',
        bodyColor: '#aaa',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? Math.round((ctx.raw / total) * 100) : 0;
            return ` ${ctx.label}: ${ctx.raw} beds (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
    }}>
      <h3 style={{
        fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)',
        margin: '0 0 20px 0',
      }}>
        Bed Occupancy Overview
      </h3>
      <div style={{ height: '280px', position: 'relative' }}>
        <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
      </div>
    </div>
  );
}
