'use client';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('success')) setSuccess('Subscription successful! Welcome to the club.');
      if (params.get('cancelled')) setSuccess('Checkout cancelled.');
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle();
        setSubscription(data);
      } catch (err) {
        console.error('Error loading subscription:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSubscribe = async (planType, price) => {
    setProcessing(true);
    setSuccess('');
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Subscription failed: ' + err.message);
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose entry to upcoming draws.')) return;
    
    setProcessing(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscription.id)
        .select()
        .single();
        
      if (error) throw error;
      setSubscription(data);
      setSuccess('Subscription cancelled.');
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Subscription</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Manage your subscription to participate in draws and support your chosen charity.
      </p>

      {success && <div className="toast toast-success" style={{ marginBottom: '2rem' }}>{success}</div>}
      {processing && <div className="toast toast-info" style={{ marginBottom: '2rem' }}>Processing transaction... Please wait.</div>}

      {subscription?.status === 'active' ? (
        <div className="card" style={{ border: '1px solid var(--color-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-success">ACTIVE</span>
              {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
            </h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>£{subscription.price_paid}</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Start Date</div>
              <div>{new Date(subscription.start_date).toLocaleDateString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Next Renewal</div>
              <div>{new Date(subscription.renewal_date).toLocaleDateString()}</div>
            </div>
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Payment Info</div>
              <div>💳 Managed securely via Stripe</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button className="btn" style={{ color: 'var(--color-error)' }} onClick={handleCancel} disabled={processing}>Cancel Plan</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Monthly Plan */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Monthly</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>£9.99<span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>/mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', gap: '0.5rem', display: 'flex', flexDirection: 'column', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              <li>✓ Monthly prize draw entry</li>
              <li>✓ Score tracking</li>
              <li>✓ Charity support</li>
              <li>✓ Cancel anytime</li>
            </ul>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={() => handleSubscribe('monthly', 9.99)}
              disabled={processing}
            >
              Subscribe Monthly
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--color-secondary)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.25rem 1rem', background: 'var(--color-secondary)', color: 'var(--color-bg)', fontSize: '0.75rem', fontWeight: 'bold', borderBottomLeftRadius: 'var(--radius-md)' }}>
              SAVE 17%
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Yearly</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-secondary)' }}>£99.99<span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>/yr</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', gap: '0.5rem', display: 'flex', flexDirection: 'column', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              <li>✓ Everything in Monthly</li>
              <li>✓ 2 months free</li>
              <li>✓ Priority support</li>
              <li>✓ Exclusive draws</li>
            </ul>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={() => handleSubscribe('yearly', 99.99)}
              disabled={processing}
            >
              Subscribe Yearly
            </button>
          </div>
        </div>
      )}
      
      {subscription?.status === 'cancelled' && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.3)', borderRadius: '8px', color: 'var(--color-error)' }}>
          Your subscription is cancelled. You will not be entered into upcoming draws until you resubscribe.
        </div>
      )}
    </div>
  );
}
