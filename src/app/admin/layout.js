'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (profile && profile.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !user || profile?.role !== 'admin') {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: '📈' },
    { label: 'Users & Subscriptions', href: '/admin/users', icon: '👥' },
    { label: 'Draw Management', href: '/admin/draws', icon: '🎲' },
    { label: 'Charities', href: '/admin/charities', icon: '🏛️' },
    { label: 'Winner Verification', href: '/admin/winners', icon: '🏆' },
  ];

  return (
    <div className="dashboard-layout" style={{ '--color-primary-lighter': '#2A1F3F' }}>
      {/* Admin Sidebar */}
      <aside className="sidebar" style={{ background: '#110D1A', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="sidebar-logo">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit' }}>
            <span className="logo-icon" style={{ 
              width: '32px', height: '32px', 
              background: 'linear-gradient(135deg, #FF6B6B, #9B51E0)', 
              borderRadius: '8px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>⬡</span>
            <div>
              <div style={{ lineHeight: 1 }}>GolfStake</div>
              <div style={{ fontSize: '0.6rem', color: '#FF6B6B', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Workspace</div>
            </div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Management</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                style={isActive ? { background: 'rgba(155, 81, 224, 0.1)', color: '#D2A1FF', borderColor: 'rgba(155, 81, 224, 0.2)' } : {}}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          
          <div className="sidebar-section-label" style={{ marginTop: '2rem' }}>User Portal</div>
          <Link href="/dashboard" className="sidebar-link">
            <span className="sidebar-icon">↩️</span>
            Return to Dashboard
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <button onClick={() => { signOut(); router.push('/'); }} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}>
            <span className="sidebar-icon">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 3rem', marginLeft: '260px' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Administrator Control Panel</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage users, configure draws, and verify winners.
          </p>
        </header>

        {children}
      </main>
    </div>
  );
}
