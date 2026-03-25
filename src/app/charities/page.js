'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import styles from '../page.module.css';

export default function CharitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharities() {
      const { data } = await supabase.from('charities').select('*').order('name');
      setCharities(data || []);
      setLoading(false);
    }
    fetchCharities();
  }, []);

  const getIcon = (category) => {
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

  const filtered = charities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.page} style={{ minHeight: '100vh', padding: '6rem 0' }}>
      <div className="container" style={{ marginBottom: '3rem' }}>
        <a href="/" style={{ color: 'var(--color-text-muted)', display: 'inline-block', marginBottom: '2rem' }}>← Back to Home</a>
        <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Support a Cause</h1>
        <p className="section-subtitle" style={{ textAlign: 'left', maxWidth: '600px', margin: '1rem 0 2rem' }}>
          Explore the incredible organizations supported by our community. When you subscribe, you choose where your impact goes.
        </p>

        <input 
          type="text" 
          className="form-input" 
          placeholder="Search charities by name or category..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '400px', marginBottom: '3rem' }}
        />

        <div className={styles.charityGrid}>
          {loading ? (
             <div className="spinner" style={{ margin: '4rem auto', gridColumn: '1 / -1' }}></div>
          ) : filtered.length === 0 ? (
             <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', gridColumn: '1 / -1' }}>
               No charities currently listed. More coming soon!
             </p>
          ) : (
            filtered.map((charity) => (
              <div key={charity.id} className={`card ${styles.charityCard}`}>
                <div className={styles.charityIcon}>{getIcon(charity.category)}</div>
                <div className="badge badge-info" style={{ marginBottom: '1rem' }}>{charity.category || 'General'}</div>
                <h3 className={styles.charityName}>{charity.name}</h3>
                <p className={styles.charityDesc} style={{ flex: 1 }}>{charity.description}</p>
                <Link href={`/charities/${charity.id}`} className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  View Full Profile
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
