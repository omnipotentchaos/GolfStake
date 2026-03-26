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
      // Fetch real winners from the database including profile names and draw dates
      const { data, error } = await supabase
        .from('winners')
        .select(`
          *,
          profiles:profiles!winners_user_id_fkey(full_name),
          draws(draw_date)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setWinners(data || []);
    } catch (err) {
      console.error('Error fetching winners:', err);
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('winners')
        .update({ verification_status: newStatus })
        .eq('id', id);
      if (error) throw error;
      
      setWinners(winners.map(w => w.id === id ? { ...w, verification_status: newStatus } : w));
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
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
                      <div style={{ fontWeight: '600' }}>{winner.profiles?.full_name || 'Golfer'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{winner.profiles?.email}</div>
                    </td>
                    <td>
                      <div>{winner.draws?.draw_date ? new Date(winner.draws.draw_date).toLocaleDateString() : 'N/A'}</div>
                      <div className="badge badge-warning" style={{ marginTop: '0.25rem' }}>{winner.match_type}</div>
                    </td>
                    <td style={{ fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                      ₹{winner.prize_amount?.toLocaleString() || '0'}
                    </td>
                    <td>
                      {winner.proof_image_url ? (
                        <a href={winner.proof_image_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                          View Image 📷
                        </a>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Awaiting upload</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        winner.verification_status === 'approved' ? 'badge-success' : 
                        winner.verification_status === 'rejected' ? 'badge-error' : 'badge-info'
                      }`}>
                        {winner.verification_status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      {winner.verification_status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-sm" style={{ background: 'var(--color-success)', color: 'white' }} onClick={() => updateStatus(winner.id, 'approved')}>Approve</button>
                          <button className="btn btn-sm" style={{ background: 'var(--color-error)', color: 'white' }} onClick={() => updateStatus(winner.id, 'rejected')}>Reject</button>
                        </div>
                      ) : winner.verification_status === 'approved' && winner.payment_status === 'pending' ? (
                        <button className="btn btn-secondary btn-sm" onClick={async () => {
                          await supabase.from('winners').update({ payment_status: 'paid', paid_at: new Date().toISOString() }).eq('id', winner.id);
                          
                          // Dispatch mock email notification
                          await fetch('/api/notify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              to: winner.profiles?.email || 'winner@golfstake.com',
                              subject: 'Your GolfStake Prize is on its way!',
                              templateName: 'prize_paid',
                              data: { amount: winner.prize_amount }
                            })
                          });
                          
                          fetchWinners();
                        }}>Mark as Paid 💰</button>
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
