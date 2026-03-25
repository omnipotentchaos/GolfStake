'use client';

/**
 * Homepage — Landing Page
 * Emotion-driven design leading with charitable impact, not sport.
 * Sections: Hero, How It Works, Featured Charities, Prize Pool, Pricing, CTA
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [prizePool, setPrizePool] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [charityTotal, setCharityTotal] = useState(0);
  const [featuredCharities, setFeaturedCharities] = useState([]);

  // Animate counters on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    const targets = { prize: 24850, members: 1247, charity: 18320 };
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      setPrizePool(Math.floor(targets.prize * eased));
      setMembersCount(Math.floor(targets.members * eased));
      setCharityTotal(Math.floor(targets.charity * eased));
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  // Fetch featured charities from DB
  useEffect(() => {
    async function loadCharities() {
      try {
        const { data: featured } = await supabase.from('charities').select('*').eq('is_featured', true).limit(4);
        if (featured && featured.length > 0) {
          setFeaturedCharities(featured);
        } else {
          // Fallback to fetch any charities if none are marked featured yet
          const { data: anyCharities } = await supabase.from('charities').select('*').limit(4);
          setFeaturedCharities(anyCharities || []);
        }
      } catch (err) {
        console.error('Error loading featured charities:', err);
      }
    }
    loadCharities();
  }, []);

  const getCategoryEmoji = (category) => {
    switch ((category || '').toLowerCase()) {
      case 'environment': return '🌍';
      case 'education': return '⛳';
      case 'health': return '🧠';
      case 'community': return '🏘️';
      case 'animals': return '🦊';
      case 'support': return '🎖️';
      default: return '❤️';
    }
  };

  return (
    <div className={styles.page}>
      {/* ─── Navigation ─── */}
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⬡</span>
            <span>GolfStake</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#how-it-works">How It Works</a>
            <a href="#charities">Charities</a>
            <a href="#prizes">Prizes</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className={styles.navActions}>
            {user ? (
              <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>
                Dashboard
              </button>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => router.push('/login')}>
                  Sign In
                </button>
                <button className="btn btn-primary" onClick={() => router.push('/signup')}>
                  Get Started
                </button>
              </>
            )}
          </div>
          <button className={styles.mobileMenuBtn} id="mobile-menu-toggle">☰</button>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroGlow2}></div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            Monthly draws now live
          </div>
          <h1 className={styles.heroTitle}>
            Play. <span className={styles.heroAccent}>Win.</span> Give.
          </h1>
          <p className={styles.heroSubtitle}>
            Enter your golf scores, compete in monthly prize draws, and make a real impact by supporting charities you care about — all from one subscription.
          </p>
          <div className={styles.heroCTA}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
              Start Your Journey →
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
              See How It Works
            </button>
          </div>
          
          {/* Live Stats */}
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>£{prizePool.toLocaleString()}</span>
              <span className={styles.heroStatLabel}>Current Prize Pool</span>
            </div>
            <div className={styles.heroStatDivider}></div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{membersCount.toLocaleString()}</span>
              <span className={styles.heroStatLabel}>Active Members</span>
            </div>
            <div className={styles.heroStatDivider}></div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>£{charityTotal.toLocaleString()}</span>
              <span className={styles.heroStatLabel}>Donated to Charities</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="section" id="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to play, win, and give back</p>
          <div className={styles.stepsGrid}>
            <div className={`${styles.step} animate-fade-in-up delay-1`}>
              <div className={styles.stepNumber}>01</div>
              <div className={styles.stepIcon}>🎯</div>
              <h3 className={styles.stepTitle}>Enter Your Scores</h3>
              <p className={styles.stepDesc}>Submit your latest 5 golf scores in Stableford format. Your scores are your lottery numbers for the monthly draw.</p>
            </div>
            <div className={`${styles.step} animate-fade-in-up delay-2`}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepIcon}>🏆</div>
              <h3 className={styles.stepTitle}>Win Prizes</h3>
              <p className={styles.stepDesc}>Every month, a draw matches your scores against randomly selected numbers. Match 3, 4, or all 5 to win from the prize pool.</p>
            </div>
            <div className={`${styles.step} animate-fade-in-up delay-3`}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepIcon}>💚</div>
              <h3 className={styles.stepTitle}>Give Back</h3>
              <p className={styles.stepDesc}>A portion of your subscription goes directly to the charity you choose. See the real impact your membership creates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Prize Pool Section ─── */}
      <section className={`section ${styles.prizeSection}`} id="prizes">
        <div className="container">
          <h2 className="section-title">Prize Pool Breakdown</h2>
          <p className="section-subtitle">A portion of every subscription feeds the monthly prize pool. Match numbers to win big.</p>
          <div className={styles.prizeGrid}>
            <div className={`${styles.prizeCard} ${styles.prizeJackpot}`}>
              <div className={styles.prizeLabel}>JACKPOT</div>
              <div className={styles.prizeMatch}>5-Number Match</div>
              <div className={styles.prizeShare}>40%</div>
              <div className={styles.prizeDesc}>of the pool — rolls over if unclaimed</div>
              <div className={styles.prizeGlow}></div>
            </div>
            <div className={styles.prizeCard}>
              <div className={styles.prizeMatch}>4-Number Match</div>
              <div className={styles.prizeShare}>35%</div>
              <div className={styles.prizeDesc}>of the pool — shared equally among winners</div>
            </div>
            <div className={styles.prizeCard}>
              <div className={styles.prizeMatch}>3-Number Match</div>
              <div className={styles.prizeShare}>25%</div>
              <div className={styles.prizeDesc}>of the pool — shared equally among winners</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Charities Section ─── */}
      <section className="section" id="charities">
        <div className="container">
          <h2 className="section-title">Impact That Matters</h2>
          <p className="section-subtitle">Choose a charity you believe in. At least 10% of your subscription directly supports their mission.</p>
          <div className={styles.charityGrid}>
            {featuredCharities.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading featured charities...</div>
            ) : (
              featuredCharities.map((charity, i) => (
                <div key={charity.id} className={`card ${styles.charityCard} animate-fade-in-up delay-${(i%4)+1}`}>
                  <div className={styles.charityIcon}>{getCategoryEmoji(charity.category)}</div>
                  <h3 className={styles.charityName}>{charity.name}</h3>
                  <p className={styles.charityDesc}>{charity.description}</p>
                  <div className={styles.charityRaised}>
                    <span className={styles.charityRaisedValue}>£{charity.total_received?.toLocaleString() || '0'}</span>
                    <span className={styles.charityRaisedLabel}>raised so far</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
            <button className="btn btn-secondary" onClick={() => router.push('/charities')}>
              View All Charities →
            </button>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className={`section ${styles.pricingSection}`} id="pricing">
        <div className="container">
          <h2 className="section-title">Simple, Fair Pricing</h2>
          <p className="section-subtitle">Choose a plan that works for you. Every pound counts — for your wins and your charity.</p>
          <div className={styles.pricingGrid}>
            <div className={`${styles.pricingCard}`}>
              <div className={styles.pricingPlan}>Monthly</div>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingCurrency}>£</span>
                <span className={styles.pricingAmount}>9.99</span>
                <span className={styles.pricingPeriod}>/month</span>
              </div>
              <ul className={styles.pricingFeatures}>
                <li>✦ Monthly prize draw entry</li>
                <li>✦ Score tracking dashboard</li>
                <li>✦ Choose your charity</li>
                <li>✦ Winner verification</li>
                <li>✦ Cancel anytime</li>
              </ul>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => router.push('/signup?plan=monthly')}>
                Subscribe Monthly
              </button>
            </div>
            <div className={`${styles.pricingCard} ${styles.pricingFeatured}`}>
              <div className={styles.pricingSave}>SAVE 17%</div>
              <div className={styles.pricingPlan}>Yearly</div>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingCurrency}>£</span>
                <span className={styles.pricingAmount}>99.99</span>
                <span className={styles.pricingPeriod}>/year</span>
              </div>
              <ul className={styles.pricingFeatures}>
                <li>✦ Everything in Monthly</li>
                <li>✦ 2 months free</li>
                <li>✦ Priority support</li>
                <li>✦ Exclusive draws</li>
                <li>✦ Early access features</li>
              </ul>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => router.push('/signup?plan=yearly')}>
                Subscribe Yearly →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className={`section ${styles.ctaSection}`}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className={styles.ctaTitle}>Ready to Make Every Round Count?</h2>
          <p className={styles.ctaSubtitle}>Join a community of golfers who play with purpose. Your scores. Your prizes. Your impact.</p>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/signup')}>
            Start Your Journey →
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>⬡</span>
              <span>GolfStake</span>
            </div>
            <p className={styles.footerDesc}>A golf subscription platform combining performance tracking, monthly prize draws, and charitable giving.</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerCol}>
              <h4>Platform</h4>
              <a href="#how-it-works">How It Works</a>
              <a href="#prizes">Prizes</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Community</h4>
              <a href="#charities">Charities</a>
              <a href="/login">Sign In</a>
              <a href="/signup">Join Now</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2026 GolfStake. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
