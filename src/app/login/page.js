'use client';

/**
 * Login Page
 * Clean, modern login form with Supabase Auth integration.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import styles from './auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
      await signIn({ email: cleanEmail, password });
      // Hard navigation flushes stale Next.js RSC caching and forces the server 
      // cookie validation on the protected dashboard routes.
      window.location.href = '/dashboard';
      return; 
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authGlow}></div>
      <div className={styles.authContainer}>
        <a href="/" className={styles.authLogo}>
          <span className={styles.logoIcon}>⬡</span>
          <span>GolfStake</span>
        </a>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Welcome Back</h1>
          <p className={styles.authSubtitle}>Sign in to your account to continue</p>

          {error && <div className={styles.authError}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.authBtn}`} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            <div style={{ flex: 1, borderTop: '1px solid var(--color-border)' }}></div>
            <span>OR</span>
            <div style={{ flex: 1, borderTop: '1px solid var(--color-border)' }}></div>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ width: '100%', display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}
            onClick={async () => {
              const { supabase } = await import('@/lib/supabase');
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` }
              });
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className={styles.authFooter}>
            Don't have an account? <a href="/signup">Create one →</a>
          </p>

          {/* Demo credentials */}
          {/* <div className={styles.demoCredentials}>
            <p className={styles.demoTitle}>Demo Credentials</p>
            <div className={styles.demoRow}>
              <button className={styles.demoBtn} onClick={() => { setEmail('user@greenstake.com'); setPassword('demo1234'); }}>
                👤 User Login
              </button>
              <button className={styles.demoBtn} onClick={() => { setEmail('admin@greenstake.com'); setPassword('admin1234'); }}>
                🔧 Admin Login
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
