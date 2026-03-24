'use client';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeScores: 0,
    totalWon: 0,
    charitySelected: null,
    charityPercentage: 10,
    subscriptionStatus: 'inactive',
  });
  const [recentScores, setRecentScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;

      try {
        // 1. Fetch scores
        const { data: scores } = await supabase
          .from('scores')
          .select('*')
          .eq('user_id', user.id)
          .order('played_date', { ascending: false })
          .limit(5);

        // 2. Fetch subscription safely
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        // 3. Fetch charity if needed securely
        const { data: userCharity } = await supabase
          .from('user_charities')
          .select('*, charities(name)')
          .eq('user_id', user.id)
          .order('selected_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setStats({
          activeScores: scores?.length || 0,
          totalWon: 0, // Would query winners table
          charitySelected: userCharity?.charities?.name || 'None selected',
          charityPercentage: userCharity?.contribution_percentage || 10,
          subscriptionStatus: sub?.status || 'inactive',
        });
        
        setRecentScores(scores || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-label">Active Scores</div>
          <div className="stat-value">{stats.activeScores} / 5</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            {5 - stats.activeScores} more needed for next draw
          </p>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Subscription</div>
          <div className="stat-value" style={{ textTransform: 'capitalize' }}>
            {stats.subscriptionStatus === 'active' ? (
              <span style={{ color: 'var(--color-success)' }}>Active</span>
            ) : (
              <span style={{ color: 'var(--color-warning)' }}>Inactive</span>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            {stats.subscriptionStatus === 'active' ? 'You are entered in the next draw' : 'Subscribe to enter draws'}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Won</div>
          <div className="stat-value">£{stats.totalWon.toFixed(2)}</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Lifetime prize winnings
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-label">Supporting Charity</div>
          <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{stats.charitySelected}</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            {stats.charityPercentage}% of monthly fee
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Recent Scores */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Your "Lottery Numbers"</h3>
            <Link href="/dashboard/scores" style={{ fontSize: '0.9rem', color: 'var(--color-secondary)' }}>View All →</Link>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            Your 5 most recent Stableford scores are your numbers for the next monthly draw.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {Array.from({ length: 5 }).map((_, i) => {
              const score = recentScores[i];
              return (
                <div key={i} style={{ 
                  width: '64px', height: '64px', 
                  borderRadius: '12px',
                  background: score ? 'var(--color-primary-lighter)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${score ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: score ? 'var(--shadow-glow)' : 'none'
                }}>
                  {score ? (
                    <>
                      <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-text)' }}>{score.score}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>pts</span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>?</span>
                  )}
                </div>
              );
            })}
          </div>

          {!stats.activeScores || stats.activeScores < 5 ? (
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255, 179, 71, 0.1)', border: '1px solid rgba(255, 179, 71, 0.3)', borderRadius: '8px', color: 'var(--color-warning)', fontSize: '0.9rem' }}>
              ⚠️ You need {5 - stats.activeScores} more score(s) to be eligible for the next prize draw.
            </div>
          ) : null}
        </div>

        {/* Next Draw Info */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 1.5rem' }}>Next Draw</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Date</div>
              <div style={{ fontWeight: '600' }}>Last day of the month</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Estimated Jackpot Pool</div>
              <div style={{ fontWeight: '600', color: 'var(--color-secondary)', fontSize: '1.2rem' }}>£9,840</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Your Status</div>
              {stats.subscriptionStatus === 'active' && stats.activeScores === 5 ? (
                <div className="badge badge-success">READY</div>
              ) : (
                <div className="badge badge-warning">ACTION REQUIRED</div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
