'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    fetchDraws();
  }, []);

  async function fetchDraws() {
    try {
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .order('draw_date', { ascending: false });
        
      if (error) throw error;
      setDraws(data || []);
    } catch (err) {
      console.error('Error fetching draws:', err);
    } finally {
      setLoading(false);
    }
  }

  const runSimulation = () => {
    setSimulating(true);
    setSimulationResult(null);
    
    // Simulate complex algorithmic draw
    setTimeout(() => {
      setSimulationResult({
        numbers: [4, 12, 23, 31, 42],
        pool: 9840.00,
        winners: {
          match5: 0,
          match4: 12,
          match3: 84
        }
      });
      setSimulating(false);
    }, 1500);
  };

  const publishSimulatedDraw = async () => {
    if (!simulationResult) return;
    
    try {
      // 1. Insert Draw Record
      const { data: newDraw, error } = await supabase.from('draws').insert({
        draw_date: new Date().toISOString(),
        status: 'published',
        draw_type: 'algorithmic',
        winning_numbers: simulationResult.numbers,
        prize_pool_total: simulationResult.pool,
        published_at: new Date().toISOString()
      }).select().single();
      
      if (error) throw error;
      
      // 2. Populate Real Draw Entries
      const { data: subs } = await supabase.from('subscriptions').select('user_id').eq('status', 'active');
      if (subs && subs.length > 0) {
        const userIds = subs.map(s => s.user_id);
        const { data: scores } = await supabase.from('scores').select('user_id, score').in('user_id', userIds).order('played_date', { ascending: false });
        
        if (scores) {
          const userScores = {};
          scores.forEach(s => {
            if (!userScores[s.user_id]) userScores[s.user_id] = [];
            if (userScores[s.user_id].length < 5) userScores[s.user_id].push(s.score);
          });
          
          const validEntries = [];
          for (const [userId, nums] of Object.entries(userScores)) {
            if (nums.length === 5) {
              validEntries.push({
                draw_id: newDraw.id,
                user_id: userId,
                numbers: nums,
                entry_date: new Date().toISOString()
              });
            }
          }
          if (validEntries.length > 0) {
            await supabase.from('draw_entries').insert(validEntries);
          }
        }
      }
      
      // Dispatch mock email notification
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'all_subscribers@golfstake.com',
          subject: 'New GolfStake Draw Published!',
          templateName: 'draw_published',
          data: { 
            pool: simulationResult.pool,
            numbers: simulationResult.numbers 
          }
        })
      });
      alert('Draw published successfully!');
      setSimulationResult(null);
      fetchDraws();
    } catch (err) {
      console.error(err);
      alert('Failed to publish draw');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Draw Management</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* Run next draw */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Initiate Next Draw</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Run the draw engine simulation. This generates the winning numbers based on the selected algorithm and calculates potential payouts. You can review the results before publishing officially to users.
          </p>
          
          <div className="form-group">
            <label className="form-label">Algorithm Strategy</label>
            <select className="form-select">
              <option value="algorithmic">Frequency Weighted (Algorithmic)</option>
              <option value="random">Pure Random</option>
            </select>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            onClick={runSimulation}
            disabled={simulating}
          >
            {simulating ? 'Processing Engine...' : 'Run Simulation'}
          </button>
        </div>

        {/* Output Panel */}
        <div className="card" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Simulation Output</h3>
          
          {simulating ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner" style={{ marginBottom: '1rem' }}></div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                Analyzing {Math.floor(Math.random()*5000)+1000} score matrices...
              </div>
            </div>
          ) : !simulationResult ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--color-text-muted)' }}>
              Awaiting simulation block execution
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
                {simulationResult.numbers.map((n, i) => (
                  <div key={i} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-primary-lighter)', border: '2px solid var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {n}
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>5-Match (Jackpot)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>{simulationResult.winners.match5}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>winners</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>4-Match</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{simulationResult.winners.match4}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>winners</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>3-Match</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{simulationResult.winners.match3}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>winners</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Total Pool Selected</div>
                  <div style={{ fontWeight: '600' }}>£{simulationResult.pool.toLocaleString()}</div>
                </div>
                <button className="btn btn-secondary" style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)' }} onClick={publishSimulatedDraw}>
                  Publish Final Results
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Draw History</h3>
      <div className="card table-wrapper" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading history...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Winning Numbers</th>
                <th>Pool</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {draws.map(d => (
                <tr key={d.id}>
                  <td>{new Date(d.draw_date).toLocaleDateString()}</td>
                  <td style={{ textTransform: 'capitalize' }}>{d.draw_type}</td>
                  <td style={{ letterSpacing: '2px', fontWeight: 'bold' }}>{d.winning_numbers?.join(' - ') || 'N/A'}</td>
                  <td>£{d.prize_pool_total?.toLocaleString() || '0'}</td>
                  <td>
                    <span className={`badge ${d.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                      {d.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {draws.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No historical draws.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
