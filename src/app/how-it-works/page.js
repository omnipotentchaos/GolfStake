'use client';

import styles from '../page.module.css';
import { useRouter } from 'next/navigation';

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div className={styles.page} style={{ minHeight: '100vh', padding: '6rem 0' }}>
      <div className="container" style={{ marginBottom: '3rem' }}>
        <a href="/" style={{ color: 'var(--color-text-muted)', display: 'inline-block', marginBottom: '2rem' }}>← Back to Home</a>
        <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>How GolfStake Works</h1>
        <p className="section-subtitle" style={{ textAlign: 'left', maxWidth: '800px', margin: '1rem 0 3rem' }}>
          Play your game, enter your scores, and win prizes while making a tangible difference to charities worldwide. Here's exactly how our platform operates.
        </p>

        <div style={{ display: 'grid', gap: '4rem', marginTop: '2rem' }}>
          
          <div className="card glass-card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-secondary)' }}>1. Subscribe & Choose Charity</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
              Select a monthly (£9.99) or yearly (£99.99) subscription. During signup, you choose a verified charity from our directory. A minimum of 10% (up to 50% if you choose) of your subscription goes directly to that charity every single month. Real impact, automatically.
            </p>
          </div>

          <div className="card glass-card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-secondary)' }}>2. Enter Your Golf Scores</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
              After a round of golf, enter your score in Stableford format (1-45). We keep your 5 most recent scores active. If you play a 6th round, your oldest score drops off. These 5 active scores act as your "lottery numbers" for the monthly draw.
            </p>
          </div>

          <div className="card glass-card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-secondary)' }}>3. The Monthly Draw</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
              On the final day of each month, our automated draw engine selects 5 random winning numbers. We match your 5 active scores against these numbers. The prize pool is funded by a portion of all active subscriptions.
            </p>
            <ul style={{ marginTop: '1rem', color: 'var(--color-text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li><strong>Match 5:</strong> Wins 40% of the pool (Jackpot - rolls over if no winner)</li>
              <li><strong>Match 4:</strong> Shares 35% of the pool</li>
              <li><strong>Match 3:</strong> Shares 25% of the pool</li>
            </ul>
          </div>

          <div className="card glass-card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-secondary)' }}>4. Verification & Payouts</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
              If you win a prize, you'll be notified via your dashboard. To claim the prize, you must upload photographic proof of the scorecards that match the winning numbers. Once our admin team verifies the scorecards, the prize money is transferred directly to your account.
            </p>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
            Join GolfStake Today →
          </button>
        </div>
      </div>
    </div>
  );
}
