'use client';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function CharityPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [charities, setCharities] = useState([]);
  const [userSelection, setUserSelection] = useState({
    charity_id: '',
    contribution_percentage: 10
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        // Fetch all charities
        const { data: charitiesData } = await supabase
          .from('charities')
          .select('*')
          .order('name');
        setCharities(charitiesData || []);

        // Fetch user's current selection safely in case of multiple rows
        const { data: userSelectionData } = await supabase
          .from('user_charities')
          .select('*')
          .eq('user_id', user.id)
          .order('selected_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (userSelectionData) {
          setUserSelection({
            charity_id: userSelectionData.charity_id,
            contribution_percentage: userSelectionData.contribution_percentage
          });
        }
      } catch (err) {
        console.error('Error loading charity data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSave = async () => {
    if (!userSelection.charity_id) return;
    
    setSaving(true);
    setSuccess('');
    
    try {
      // Clean up any old selections to ensure exactly 1 constraint without requiring a schema unique index change
      await supabase.from('user_charities').delete().eq('user_id', user.id);
      
      const { error } = await supabase
        .from('user_charities')
        .insert({
          user_id: user.id,
          charity_id: userSelection.charity_id,
          contribution_percentage: userSelection.contribution_percentage,
          selected_at: new Date().toISOString()
        });
        
      if (error) throw error;
      setSuccess('Charity preferences updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to update charity selection');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>My Impact</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Manage which organization you're supporting. A portion of your subscription fee goes directly to them.
      </p>

      {success && <div className="toast toast-success" style={{ marginBottom: '2rem' }}>{success}</div>}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Contribution Settings</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '2rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Percentage of Subscription</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Choose how much of your monthly fee goes to charity (min 10%). The rest supports the platform and prize pool.
            </p>
          </div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <input 
                type="range" 
                min="10" max="50" step="5"
                value={userSelection.contribution_percentage}
                onChange={e => setUserSelection({...userSelection, contribution_percentage: parseInt(e.target.value)})}
                style={{ flex: 1 }}
              />
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-secondary)', width: '60px', textAlign: 'right' }}>
                {userSelection.contribution_percentage}%
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <span>10%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Select Organization</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {charities.length === 0 ? (
          <p>No charities found. Please check back later.</p>
        ) : (
          charities.map(charity => {
            const isSelected = userSelection.charity_id === charity.id;
            return (
              <div 
                key={charity.id} 
                className="card" 
                style={{ 
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
                  background: isSelected ? 'rgba(0, 200, 150, 0.05)' : 'var(--color-bg-card)',
                  transition: 'all 0.2s',
                  padding: '1.5rem'
                }}
                onClick={() => setUserSelection({...userSelection, charity_id: charity.id})}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{charity.name}</h4>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--color-secondary)' : 'var(--color-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-secondary)' }}></div>}
                  </div>
                </div>
                <div className="badge badge-info" style={{ marginBottom: '1rem' }}>{charity.category || 'General'}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                  {charity.description}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleSave} 
          disabled={saving || !userSelection.charity_id || charities.length === 0}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

    </div>
  );
}
