'use client';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function ScoresPage() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newScore, setNewScore] = useState('');
  const [playedDate, setPlayedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadScores() {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('scores')
          .select('*')
          .eq('user_id', user.id)
          .order('played_date', { ascending: false })
          .order('created_at', { ascending: false });
        
        setScores(data || []);
      } catch (err) {
        console.error('Error loading scores:', err);
      } finally {
        setLoading(false);
      }
    }
    loadScores();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const scoreVal = parseInt(newScore);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      setError('Score must be a valid Stableford score between 1 and 45.');
      return;
    }

    setSubmitting(true);
    try {
      // Add a safety timeout so the UI never gets permanently stuck
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out. Please check your connection.')), 8000)
      );

      const submitPromise = async () => {
        // 1. Insert new score
        const { data: inserted, error: insertError } = await supabase
          .from('scores')
          .insert({
            user_id: user.id,
            score: scoreVal,
            played_date: playedDate
          })
          .select()
          .single();
          
        if (insertError) throw insertError;

        // 2. Fetch updated scores
        const { data: updatedScores } = await supabase
          .from('scores')
          .select('*')
          .eq('user_id', user.id)
          .order('played_date', { ascending: false })
          .order('created_at', { ascending: false });

        // 3. Keep only top 5 recent scores
        if (updatedScores && updatedScores.length > 5) {
          const idsToDelete = updatedScores.slice(5).map(s => s.id);
          await supabase.from('scores').delete().in('id', idsToDelete);
          setScores(updatedScores.slice(0, 5));
        } else {
          setScores(updatedScores || []);
        }
      };

      await Promise.race([submitPromise(), timeoutPromise]);

      setSuccess('Score submitted successfully! Your lottery numbers have been updated.');
      setNewScore('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message === 'Request timed out. Please check your connection.' 
        ? err.message 
        : 'Failed to submit score. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteScore = async (id) => {
    if (!confirm('Are you sure you want to delete this score?')) return;
    try {
      const { error: delErr } = await supabase.from('scores').delete().eq('id', id);
      if (delErr) throw delErr;
      setScores(scores.filter(s => s.id !== id));
      setSuccess('Score deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to delete score');
    }
  };

  if (loading) return <div className="spinner"></div>;

  const activeScores = scores.slice(0, 5);
  const pastScores = scores.slice(5); // In reality, we delete them, but keeping UI design flexible

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>My Scores</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Log your Stableford scores here. Your 5 most recent rounds are your numbers for the monthly prize draw.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Input Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Log a Round</h3>
          
          {error && <div className="toast toast-error" style={{ position: 'relative', top: 0, right: 0, marginBottom: '1rem' }}>{error}</div>}
          {success && <div className="toast toast-success" style={{ position: 'relative', top: 0, right: 0, marginBottom: '1rem' }}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="score">Stableford Points (1-45)</label>
              <input
                id="score"
                type="number"
                min="1" max="45"
                className="form-input"
                placeholder="e.g. 36"
                value={newScore}
                onChange={e => setNewScore(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date Played</label>
              <input
                id="date"
                type="date"
                className="form-input"
                value={playedDate}
                onChange={e => setPlayedDate(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Score'}
            </button>
          </form>
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <span>ℹ️</span>
            <span>Remember to keep your physical scorecards if you score a winning combination! We'll need a photo of them to verify your prize claim.</span>
          </div>
        </div>

        {/* Active Numbers */}
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Your Active Numbers</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeScores.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>You haven't logged any scores yet.</p>
            ) : (
              activeScores.map((score, idx) => (
                <div key={score.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', position: 'relative' }}>
                  <button 
                    onClick={() => handleDeleteScore(score.id)}
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                    title="Delete Score"
                  >
                    🗑️
                  </button>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {new Date(score.played_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    {idx === 0 && <div className="badge badge-success" style={{ marginTop: '0.25rem' }}>NEWEST</div>}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                    {score.score}
                  </div>
                </div>
              ))
            )}
            
            {/* Empty slots placeholders */}
            {Array.from({ length: Math.max(0, 5 - activeScores.length) }).map((_, i) => (
              <div key={`empty-${i}`} style={{ 
                border: '1px dashed var(--color-border)', 
                borderRadius: 'var(--radius-lg)', 
                padding: '1rem', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                color: 'var(--color-text-muted)',
                height: '76px'
              }}>
                Awaiting Score
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
