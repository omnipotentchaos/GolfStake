'use client';

/**
 * Signup Page
 * Registration form with charity selection and subscription plan choice.
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import styles from '../login/auth.module.css';

const DEMO_CHARITIES = [
  { id: '1', name: 'Green Future Foundation' },
  { id: '2', name: 'Youth Sports Academy' },
  { id: '3', name: 'Mental Health Links' },
  { id: '4', name: 'Community Builders' },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    plan: 'monthly',
    charityId: '',
    charityPercentage: 10,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan === 'yearly' || plan === 'monthly') {
      setFormData(prev => ({ ...prev, plan }));
    }
  }, [searchParams]);

  function updateField(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!formData.charityId) {
        setError('Please select a charity');
        return;
      }
      setStep(3);
      return;
    }

    // Step 3: Final submission
    setLoading(true);
    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        country: formData.country,
      });

      // Create subscription and charity selection (handled by API)
      router.push('/dashboard?welcome=true');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authGlow}></div>
      <div className={styles.authContainer}>
        <a href="/" className={styles.authLogo}>
          <span className={styles.logoIcon}>⬡</span>
          <span>GreenStake</span>
        </a>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>
            {step === 1 ? 'Create Account' : step === 2 ? 'Choose a Charity' : 'Select Your Plan'}
          </h1>
          <p className={styles.authSubtitle}>
            {step === 1
              ? 'Join the community of golfers making a difference'
              : step === 2
              ? 'At least 10% of your subscription supports a cause you care about'
              : 'Choose a subscription plan to get started'
            }
          </p>

          {/* Progress Steps */}
          <div className={styles.progressSteps}>
            {[1, 2, 3].map(s => (
              <div key={s} className={`${styles.progressStep} ${s <= step ? styles.progressActive : ''}`}>
                <div className={styles.progressDot}>{s <= step ? '✓' : s}</div>
                <span>{s === 1 ? 'Account' : s === 2 ? 'Charity' : 'Plan'}</span>
              </div>
            ))}
          </div>

          {error && <div className={styles.authError}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Info */}
            {step === 1 && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Full Name</label>
                  <input id="fullName" type="text" className="form-input" placeholder="John Doe" value={formData.fullName} onChange={e => updateField('fullName', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-email">Email</label>
                  <input id="signup-email" type="email" className="form-input" placeholder="you@example.com" value={formData.email} onChange={e => updateField('email', e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="password">Password</label>
                    <input id="password" type="password" className="form-input" placeholder="••••••••" value={formData.password} onChange={e => updateField('password', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">Confirm</label>
                    <input id="confirmPassword" type="password" className="form-input" placeholder="••••••••" value={formData.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone (optional)</label>
                    <input id="phone" type="tel" className="form-input" placeholder="+44 ..." value={formData.phone} onChange={e => updateField('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="country">Country</label>
                    <select id="country" className="form-select" value={formData.country} onChange={e => updateField('country', e.target.value)}>
                      <option value="">Select</option>
                      <option value="UK">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="IE">Ireland</option>
                      <option value="AU">Australia</option>
                      <option value="CA">Canada</option>
                      <option value="IN">India</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Charity Selection */}
            {step === 2 && (
              <>
                <div className={styles.charityOptions}>
                  {DEMO_CHARITIES.map(charity => (
                    <label key={charity.id} className={`${styles.charityOption} ${formData.charityId === charity.id ? styles.charitySelected : ''}`}>
                      <input type="radio" name="charity" value={charity.id} checked={formData.charityId === charity.id} onChange={e => updateField('charityId', e.target.value)} />
                      <span className={styles.charityOptionName}>{charity.name}</span>
                    </label>
                  ))}
                </div>
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="form-label">
                    Charity Contribution: <strong style={{ color: 'var(--color-secondary)' }}>{formData.charityPercentage}%</strong> of subscription
                  </label>
                  <input type="range" className="range-slider" min="10" max="50" value={formData.charityPercentage} onChange={e => updateField('charityPercentage', parseInt(e.target.value))} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    <span>10% (min)</span><span>50%</span>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Plan Selection */}
            {step === 3 && (
              <div className={styles.planOptions}>
                <label className={`${styles.planOption} ${formData.plan === 'monthly' ? styles.planSelected : ''}`}>
                  <input type="radio" name="plan" value="monthly" checked={formData.plan === 'monthly'} onChange={e => updateField('plan', e.target.value)} />
                  <div>
                    <div className={styles.planName}>Monthly</div>
                    <div className={styles.planPrice}>£9.99<span>/month</span></div>
                  </div>
                </label>
                <label className={`${styles.planOption} ${formData.plan === 'yearly' ? styles.planSelected : ''}`}>
                  <input type="radio" name="plan" value="yearly" checked={formData.plan === 'yearly'} onChange={e => updateField('plan', e.target.value)} />
                  <div>
                    <div className={styles.planName}>Yearly <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>SAVE 17%</span></div>
                    <div className={styles.planPrice}>£99.99<span>/year</span></div>
                  </div>
                </label>
              </div>
            )}

            <div className={styles.authBtnRow}>
              {step > 1 && (
                <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>← Back</button>
              )}
              <button type="submit" className={`btn btn-primary ${styles.authBtn}`} disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Creating account...' : step < 3 ? 'Continue →' : 'Start My Journey →'}
              </button>
            </div>
          </form>

          <p className={styles.authFooter}>
            Already have an account? <a href="/login">Sign in →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
