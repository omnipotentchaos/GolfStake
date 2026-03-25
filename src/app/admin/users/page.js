'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [userScores, setUserScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [newScore, setNewScore] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, phone, country, role,
          subscriptions(status, plan)
        `)
        .order('full_name', { ascending: true });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleManageUser = async (user) => {
    setSelectedUser(user);
    setLoadingScores(true);
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('played_date', { ascending: false });
      if (error) throw error;
      setUserScores(data || []);
    } catch (err) {
      alert('Error fetching scores: ' + err.message);
    } finally {
      setLoadingScores(false);
    }
  };

  const handleAddScore = async (e) => {
    e.preventDefault();
    if (!newScore || isNaN(newScore) || newScore < 1 || newScore > 45) {
      alert('Score must be between 1 and 45');
      return;
    }
    
    try {
      const { error } = await supabase.from('scores').insert([
        { user_id: selectedUser.id, score: parseInt(newScore), played_date: new Date().toISOString() }
      ]);
      if (error) throw error;
      
      setNewScore('');
      handleManageUser(selectedUser); // Refresh scores
    } catch (err) {
      alert('Error adding score: ' + err.message);
    }
  };

  const handleDeleteScore = async (scoreId) => {
    if (!confirm('Are you sure you want to delete this score?')) return;
    try {
      const { error } = await supabase.from('scores').delete().eq('id', scoreId);
      if (error) throw error;
      handleManageUser(selectedUser); // Refresh scores
    } catch (err) {
      alert('Error deleting score: ' + err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.phone?.toLowerCase().includes(search.toLowerCase()) ||
    u.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Modal Overlay */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Manage User: {selectedUser.full_name}</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text)' }}
              >×</button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }}>Player Scores</h4>
              
              <form onSubmit={handleAddScore} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <input 
                  type="number" 
                  min="1" max="45" 
                  className="form-input" 
                  placeholder="Points (1-45)" 
                  value={newScore}
                  onChange={e => setNewScore(e.target.value)}
                  style={{ width: '150px' }}
                />
                <button type="submit" className="btn btn-primary">Add Score</button>
              </form>

              {loadingScores ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading scores...</div>
              ) : userScores.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  User has no active scores.
                </div>
              ) : (
                <table className="table" style={{ marginTop: '1rem' }}>
                  <thead>
                    <tr>
                      <th>Points</th>
                      <th>Date Logged</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userScores.map((s, i) => (
                      <tr key={s.id} style={{ opacity: i >= 5 ? 0.5 : 1 }}>
                        <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{s.score}</td>
                        <td>{new Date(s.played_date).toLocaleDateString()} {i >= 5 && <span className="badge badge-warning" style={{marginLeft: '8px'}}>Dropped</span>}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteScore(s.id)}
                            className="btn btn-sm" 
                            style={{ background: 'var(--color-error)', color: 'white' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Users & Subscriptions</h2>
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          className="form-input" 
          style={{ width: '300px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card table-wrapper" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading users...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Subscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const sub = user.subscriptions?.[0] || { status: 'inactive' };
                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{user.full_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{user.phone || user.country || user.id.slice(0, 8) + '...'}</div>
                      </td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-info'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${sub.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                          {sub.status.toUpperCase()}
                        </span>
                        {sub.plan && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{sub.plan} plan</div>}
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleManageUser(user)}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
