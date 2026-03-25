'use client';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function DrawsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeDraws, setActiveDraws] = useState([]);
  const [pastDraws, setPastDraws] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    async function loadDraws() {
      if (!user) return;
      try {
        // Fetch all published/scheduled draws
        const { data: drawsData, error: drawsError } = await supabase
          .from('draws')
          .select('*')
          .order('draw_date', { ascending: false });
          
        if (drawsError) throw drawsError;
        
        const draws = drawsData || [];
        const now = new Date();
        
        setActiveDraws(draws.filter(d => d.status === 'scheduled' || new Date(d.draw_date) > now));
        setPastDraws(draws.filter(d => d.status === 'published' && new Date(d.draw_date) <= now));

        // Fetch user's winnings
        const { data: winningsData } = await supabase
          .from('winners')
          .select('*, draws(draw_date)')
          .eq('user_id', user.id);
        
        setWinnings(winningsData || []);
      } catch (err) {
        console.error('Error loading draws:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDraws();
  }, [user]);

  const handleUpload = async (e, winnerId) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingId(winnerId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${winnerId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(fileName, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('proofs')
        .getPublicUrl(fileName);
        
      const { error: updateError } = await supabase
        .from('winners')
        .update({ proof_image_url: publicUrl, verification_status: 'pending' })
        .eq('id', winnerId);
        
      if (updateError) throw updateError;
      
      setWinnings(winnings.map(w => w.id === winnerId ? { ...w, proof_image_url: publicUrl, verification_status: 'pending' } : w));
      alert('Proof uploaded successfully!');
    } catch (err) {
      alert('Error uploading: ' + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Monthly Draws</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        View upcoming draws and past results. Make sure you have an active subscription and 5 logged scores to participate.
      </p>

      {/* Your Winnings */}
      {winnings.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>🎉 Your Winnings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {winnings.map(win => (
              <div key={win.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem', border: '1px solid var(--color-accent)' }}>
                <div style={{ minWidth: '120px' }}>
                  <div style={{ fontWeight: '600' }}>{win.draws?.draw_date ? new Date(win.draws.draw_date).toLocaleDateString() : 'Draw'}</div>
                  <div className="badge badge-warning" style={{ marginTop: '0.5rem' }}>{win.match_type}</div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>£{win.prize_amount?.toLocaleString() || '0'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Status: {win.payment_status?.toUpperCase() || 'PENDING'}</div>
                </div>
                
                <div>
                  {win.proof_image_url ? (
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-success)' }}>✓ Proof Submitted ({win.verification_status})</div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--color-warning)' }}>Action Required: Upload Proof</div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        id={`upload-${win.id}`}
                        style={{ display: 'none' }}
                        onChange={(e) => handleUpload(e, win.id)}
                      />
                      <label 
                        htmlFor={`upload-${win.id}`} 
                        className="btn btn-primary btn-sm"
                        style={{ cursor: 'pointer', display: 'inline-block' }}
                      >
                        {uploadingId === win.id ? 'Uploading...' : 'Upload Scorecard'}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Draws */}
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Upcoming Draws</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {activeDraws.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📅</div>
            <h4>No draws scheduled yet</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Check back later for the next scheduled draw.</p>
          </div>
        ) : (
          activeDraws.map(draw => (
            <div key={draw.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem 1rem', background: 'rgba(0, 200, 150, 0.1)', color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: 'bold', borderBottomLeftRadius: 'var(--radius-md)' }}>
                ACTIVE
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-secondary)', marginBottom: '0.25rem' }}>
                £{draw.prize_pool_total?.toLocaleString() || '0'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Estimated Prize Pool</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div>
                  <div style={{ color: 'var(--color-text-muted)' }}>Draw Date</div>
                  <div style={{ fontWeight: '600' }}>{new Date(draw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--color-text-muted)' }}>Jackpot Rollover</div>
                  <div style={{ fontWeight: '600', color: 'var(--color-accent)' }}>£{draw.jackpot_rollover?.toLocaleString() || '0'}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Past Results */}
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Past Results</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {pastDraws.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No past draws available.</p>
        ) : (
          pastDraws.map(draw => (
            <div key={draw.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem' }}>
              <div style={{ minWidth: '120px' }}>
                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{new Date(draw.draw_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Total Pool: £{draw.prize_pool_total?.toLocaleString()}</div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Winning Numbers</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {draw.winning_numbers?.map((num, i) => (
                    <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary-lighter)', border: '1px solid var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                      {num}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <button className="btn btn-secondary btn-sm" onClick={() => alert('Detailed results view would open here')}>
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
