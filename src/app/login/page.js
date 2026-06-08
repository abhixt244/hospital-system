'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Activity, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const demoAccounts = [
    { role: 'Admin', email: 'admin@hospital.com', password: 'password123', color: 'var(--accent-purple)' },
    { role: 'Doctor', email: 'doctor@hospital.com', password: 'password123', color: 'var(--accent-teal)' },
    { role: 'Nurse', email: 'nurse@hospital.com', password: 'password123', color: 'var(--accent-blue)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className={styles.page}>
      {/* Decorative orbs */}
      <div className={styles.orbDecor} />
      <div className={styles.orbDecorSmall} />

      {/* Login card */}
      <div className={styles.card}>
        {/* Logo and branding */}
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <Activity size={28} strokeWidth={2.5} color="white" />
          </div>
          <h1 className={styles.logoTitle}>MedAlloc</h1>
          <p className={styles.logoSubtitle}>Hospital Bed & Resource Allocation System</p>
        </div>

        {/* Error message */}
        {error && (
          <div className={styles.error}>
            <svg className={styles.errorIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: '4px', display: 'flex',
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.btnSpinner} />
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className={styles.demoHint}>
          <p className={styles.demoHintTitle}>Demo Accounts</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                onClick={() => fillDemoCredentials(account)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: 'hsla(0, 0%, 100%, 0.04)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  transition: 'all 150ms ease', fontSize: '0.8rem',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = account.color;
                  e.currentTarget.style.background = 'hsla(0, 0%, 100%, 0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-glass)';
                  e.currentTarget.style.background = 'hsla(0, 0%, 100%, 0.04)';
                }}
              >
                <span style={{ fontWeight: '600', color: account.color }}>{account.role}</span>
                <span style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {account.email}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
