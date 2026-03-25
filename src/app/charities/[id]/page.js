import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  const { data: charity } = await supabase.from('charities').select('name, description').eq('id', id).maybeSingle();
  return {
    title: `${charity?.name || 'Charity'} | GolfStake`,
    description: charity?.description || 'Support a great cause through GolfStake.'
  };
}

export default async function CharityProfilePage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  const { data: charity, error } = await supabase
    .from('charities')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !charity) {
    return (
      <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Charity Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>The organization you are looking for does not exist.</p>
        <Link href="/charities" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>Back to Directory</Link>
      </div>
    );
  }

  const upcomingEvents = Array.isArray(charity.upcoming_events) ? charity.upcoming_events : [];
  
  // Emoji mapper fallback from the public page
  const getCategoryEmoji = (category) => {
    const map = {
      'Health': '⚕️',
      'Education': '📚',
      'Environment': '🌿',
      'Children': '🧸',
      'Animals': '🐾',
      'Community': '🤝'
    };
    return map[category] || '🎗️';
  };

  return (
    <div style={{ padding: '6rem 2rem 4rem' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link href="/charities" style={{ display: 'inline-block', marginBottom: '2rem', color: 'var(--color-text-muted)', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Back to Directory
        </Link>
        
        <div className="card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '10rem', opacity: '0.03', transform: 'rotate(15deg)', pointerEvents: 'none' }}>
            {getCategoryEmoji(charity.category)}
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="badge badge-info" style={{ marginBottom: '1rem', display: 'inline-block' }}>
              {charity.category || 'General'}
            </div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>{charity.name}</h1>
            
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--color-text-secondary)', marginBottom: '3rem' }}>
              {charity.description}
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
              <Link href="/signup" className="btn btn-primary btn-lg">
                Support via Subscription
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg" style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
                Login to Donate Directly
              </Link>
            </div>
            
            {upcomingEvents.length > 0 && (
              <>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Upcoming Events</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {upcomingEvents.map((event, i) => (
                    <div key={i} style={{ padding: '1.5rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{event.name || 'Charity Event'}</h4>
                        <span className="badge badge-warning">{event.date || 'TBA'}</span>
                      </div>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>{event.description || 'Details coming soon.'}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {upcomingEvents.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No upcoming events scheduled at this time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
