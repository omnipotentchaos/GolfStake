'use client';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [subStatus, setSubStatus] = useState(null);
  const [checkingSub, setCheckingSub] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function checkSub() {
      if (!user) {
        setCheckingSub(false);
        return;
      }
      try {
        await Promise.race([
          (async () => {
            const { data } = await supabase
              .from('subscriptions')
              .select('status')
              .eq('user_id', user.id)
              .order('start_date', { ascending: false })
              .limit(1)
              .maybeSingle();
            setSubStatus(data?.status || 'inactive');
          })(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout checking subscription')), 5000))
        ]);
      } catch (e) {
        console.warn('Subscription fetch timeout or error:', e);
        setSubStatus('inactive');
      } finally {
        setCheckingSub(false);
      }
    }
    checkSub();
  }, [user]);

  if (loading || checkingSub || !user) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const isRestrictedRoute = pathname === '/dashboard/scores';
  const isLocked = isRestrictedRoute && subStatus !== 'active';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: '📊' },
    { label: 'My Scores', href: '/dashboard/scores', icon: '⛳' },
    { label: 'My Charity', href: '/dashboard/charity', icon: '💚' },
    { label: 'Monthly Draws', href: '/dashboard/draws', icon: '🎫' },
    { label: 'Subscription', href: '/dashboard/subscription', icon: '💳' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit' }}>
            <span className="logo-icon" style={{ 
              width: '32px', height: '32px', 
              background: 'var(--gradient-button)', 
              borderRadius: '8px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>⬡</span>
            GolfStake
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          
          {profile?.role === 'admin' && (
            <>
              <div className="sidebar-section-label" style={{ marginTop: '2rem' }}>Administration</div>
              <Link href="/admin" prefetch={false} className="sidebar-link">
                <span className="sidebar-icon">⚙️</span>
                Admin Panel
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user" style={{ marginBottom: '1rem' }}>
            <div style={{ 
              width: '36px', height: '36px', 
              borderRadius: '50%', 
              background: 'var(--color-primary-lighter)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {profile?.full_name || 'Golfer'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {user.email}
              </div>
            </div>
          </div>
          <button onClick={handleSignOut} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}>
            <span className="sidebar-icon">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 3rem', marginLeft: '260px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Dashboard</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Golfer'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/dashboard/scores" className="btn btn-primary btn-sm">
              + Enter Score
            </Link>
          </div>
        </header>

        {isLocked ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ marginBottom: '1rem' }}>Subscription Required</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              You need an active subscription to access the scoring engine and participate in monthly charity draws.
            </p>
            <Link href="/dashboard/subscription" className="btn btn-primary">
              View Subscription Plans
            </Link>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
