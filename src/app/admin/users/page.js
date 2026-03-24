'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.phone?.toLowerCase().includes(search.toLowerCase()) ||
    u.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
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
                        <button className="btn btn-secondary btn-sm" onClick={() => alert('User detail edit view mock')}>
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
