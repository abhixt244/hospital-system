'use client';

import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Tooltip, Legend, Filler
);

export default function TrendChart({ type = 'line', data, options: customOptions, title }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          color: 'hsla(0, 0%, 100%, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: 'hsl(220, 15%, 55%)',
          font: { size: 11, family: 'Inter, sans-serif' },
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        grid: {
          color: 'hsla(0, 0%, 100%, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: 'hsl(220, 15%, 55%)',
          font: { size: 11, family: 'Inter, sans-serif' },
          padding: 8,
        },
        border: { display: false },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: 'hsl(220, 15%, 65%)',
          usePointStyle: true,
          pointStyleWidth: 8,
          padding: 16,
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
      },
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...customOptions,
    scales: {
      ...defaultOptions.scales,
      ...(customOptions?.scales || {}),
    },
    plugins: {
      ...defaultOptions.plugins,
      ...(customOptions?.plugins || {}),
    },
  };

  const ChartComponent = type === 'bar' ? Bar : Line;

  return (
    <div style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
    }}>
      {title && (
        <h3 style={{
          fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)',
          margin: '0 0 20px 0',
        }}>
          {title}
        </h3>
      )}
      <div style={{ height: '280px', position: 'relative' }}>
        <ChartComponent data={data} options={mergedOptions} />
      </div>
    </div>
  );
}
