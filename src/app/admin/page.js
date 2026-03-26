'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    charityTotal: 0,
    prizePoolTotal: 0,
    pendingWinners: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Run aggregate queries here
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        
        const { data: subs } = await supabase.from('subscriptions').select('*').eq('status', 'active');
        const activeSubsCount = subs?.length || 0;
        const revenue = subs?.reduce((acc, sub) => acc + Number(sub.price_paid), 0) || 0;
        
        const { count: pendingCount } = await supabase
          .from('winners')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        // Combine with DB results
        setStats({
          totalUsers: usersCount || 0,
          activeSubscriptions: activeSubsCount,
          monthlyRevenue: revenue,
          charityTotal: revenue * 0.15, // 15% goes to charity
          prizePoolTotal: revenue * 0.50, // 50% goes to pool
          pendingWinners: pendingCount || 0,
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="spinner"></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(77, 166, 255, 0.05) 0%, rgba(17, 13, 26, 0.4) 100%)', borderColor: 'rgba(77, 166, 255, 0.1)' }}>
          <div className="stat-label">Total Registered Users</div>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(0, 200, 150, 0.05) 0%, rgba(17, 13, 26, 0.4) 100%)', borderColor: 'rgba(0, 200, 150, 0.1)' }}>
          <div className="stat-label">Active Subscriptions</div>
          <div className="stat-value">{stats.activeSubscriptions}</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: '0.25rem' }}>↗ +12% this month</p>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(155, 81, 224, 0.05) 0%, rgba(17, 13, 26, 0.4) 100%)', borderColor: 'rgba(155, 81, 224, 0.1)' }}>
          <div className="stat-label">MRR (Monthly Revenue)</div>
          <div className="stat-value">₹{stats.monthlyRevenue.toFixed(2)}</div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(255, 179, 71, 0.05) 0%, rgba(17, 13, 26, 0.4) 100%)', borderColor: 'rgba(255, 179, 71, 0.1)' }}>
          <div className="stat-label">Pending Verifications</div>
          <div className="stat-value">{stats.pendingWinners}</div>
          {stats.pendingWinners > 0 && (
            <Link href="/admin/winners" style={{ display: 'inline-block', fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '0.5rem' }}>
              Action required →
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Draw Overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Current Draw Cycle</h3>
            <Link href="/admin/draws" className="btn btn-secondary btn-sm">Manage Draws</Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Target Date</div>
              <div style={{ fontWeight: '600' }}>Last day of month</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Status</div>
              <div className="badge badge-info">SCHEDULING</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Estimated Prize Pool</div>
              <div style={{ fontWeight: '600', color: 'var(--color-secondary)' }}>₹{stats.prizePoolTotal.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Eligible Participants</div>
              <div style={{ fontWeight: '600' }}>{Math.floor(stats.activeSubscriptions * 0.8)}</div>
            </div>
          </div>
        </div>

        {/* Charity Impact */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Charity Impact</h3>
            <Link href="/admin/charities" className="btn btn-secondary btn-sm">Manage Charities</Link>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem 0 2rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Raised</div>
            <div style={{ fontSize: '3rem', fontWeight: '800', background: 'linear-gradient(135deg, #00C896, #4DA6FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ₹{stats.charityTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Mocked top charities */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>1. Green Future Foundation</span>
              <span style={{ fontWeight: 'bold' }}>35%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '35%', height: '100%', background: 'var(--color-secondary)' }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <span>2. Mental Health Links</span>
              <span style={{ fontWeight: 'bold' }}>28%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '28%', height: '100%', background: '#4DA6FF' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
