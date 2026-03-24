'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWinners();
  }, []);

  async function fetchWinners() {
    try {
      // Mocking winners since full table relation simulation is complex for demo
      // In reality: supabase.from('winners').select('*, profiles(full_name, email), draws(draw_date)')
      const { data, error } = await supabase
        .from('winners')
        .select('*');
        
      if (error) throw error;
      setWinners(data || [
        { id: '1', user_name: 'John Doe', match_type: '5-match', prize_amount: 4250.00, status: 'pending', date: new Date().toISOString() },
        { id: '2', user_name: 'Jane Smith', match_type: '4-match', prize_amount: 320.50, status: 'approved', date: new Date().toISOString() }
      ]);
    } catch (err) {
      console.error('Error fetching winners:', err);
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = (id, newStatus) => {
    setWinners(winners.map(w => w.id === id ? { ...w, status: newStatus } : w));
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Winner Verification</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Review photographic proof of scorecards submitted by winners before releasing prize funds.
      </p>

      <div className="card table-wrapper" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading winners...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Winner</th>
                <th>Draw / Match</th>
                <th>Prize Amount</th>
                <th>Proof Upload</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {winners.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No winners pending verification.</td>
                </tr>
              ) : (
                winners.map(winner => (
                  <tr key={winner.id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{winner.user_name || 'Golfer'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ID: {winner.id.substring(0,8)}</div>
                    </td>
                    <td>
                      <div>{new Date(winner.date).toLocaleDateString()}</div>
                      <div className="badge badge-warning" style={{ marginTop: '0.25rem' }}>{winner.match_type}</div>
                    </td>
                    <td style={{ fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                      £{winner.prize_amount?.toLocaleString() || '0'}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => alert('Mock image modal opens')}>
                        View Image 📷
                      </button>
                    </td>
                    <td>
                      <span className={`badge ${
                        winner.status === 'approved' ? 'badge-success' : 
                        winner.status === 'rejected' ? 'badge-error' : 'badge-info'
                      }`}>
                        {winner.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {winner.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: 'white' }} onClick={() => updateStatus(winner.id, 'approved')}>Approve</button>
                          <button className="btn btn-sm" style={{ background: 'var(--color-error)', color: 'white' }} onClick={() => updateStatus(winner.id, 'rejected')}>Reject</button>
                        </div>
                      ) : winner.status === 'approved' ? (
                        <button className="btn btn-secondary btn-sm">Mark as Paid 💰</button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
