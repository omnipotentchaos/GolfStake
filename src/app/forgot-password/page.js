'use client';

import { useState } from 'react';
import styles from '../login/auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Error sending reset link');
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
          <h1 className={styles.authTitle}>Reset Password</h1>
          
          {submitted ? (
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Check your email</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <button 
                className={`btn btn-secondary ${styles.authBtn}`} 
                style={{ marginTop: '2rem', width: '100%' }}
                onClick={() => window.location.href = '/login'}
              >
                Return to Login
              </button>
            </div>
          ) : (
            <>
              <p className={styles.authSubtitle}>Enter your email to receive reset instructions</p>
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
                <button type="submit" className={`btn btn-primary ${styles.authBtn}`}>
                  Send Reset Link
                </button>
              </form>
              <p className={styles.authFooter}>
                Remember your password? <a href="/login">Sign in →</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
