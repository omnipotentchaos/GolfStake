'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    fetchCharities();
  }, []);

  async function fetchCharities() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setCharities(data || []);
    } catch (err) {
      console.error('Error fetching charities:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('charities').upsert({
        id: current.id,
        name: current.name,
        description: current.description,
        category: current.category,
        website_url: current.website_url,
      });
      if (error) throw error;
      setIsEditing(false);
      setCurrent(null);
      fetchCharities();
    } catch (err) {
      alert('Failed to save charity');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this charity?')) return;
    try {
      const { error } = await supabase.from('charities').delete().eq('id', id);
      if (error) throw error;
      fetchCharities();
    } catch (err) {
      alert('Failed to delete charity');
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Charities Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setCurrent({ name: '', description: '', category: '', website_url: '' });
            setIsEditing(true);
          }}
        >
          + Add Charity
        </button>
      </div>

      {isEditing ? (
        <div className="card animate-scale-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{current.id ? 'Edit Charity' : 'New Charity'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" className="form-input" required
                  value={current.name} onChange={e => setCurrent({...current, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input 
                  type="text" className="form-input" required
                  value={current.category} onChange={e => setCurrent({...current, category: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" rows="3" required
                  value={current.description} onChange={e => setCurrent({...current, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Website URL</label>
                <input 
                  type="url" className="form-input"
                  value={current.website_url || ''} onChange={e => setCurrent({...current, website_url: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Key Image Upload (Mock)</label>
                <input type="file" className="form-input" accept="image/*" />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Files upload directly to Supabase Storage</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Charity</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="card table-wrapper" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading charities...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Funds Raised</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {charities.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No charities established.</td>
                </tr>
              ) : (
                charities.map(charity => (
                  <tr key={charity.id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{charity.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px', whiteSpace: 'nowrap' }}>
                        {charity.description}
                      </div>
                    </td>
                    <td><span className="badge badge-info">{charity.category}</span></td>
                    <td>£{charity.total_received?.toLocaleString() || '0'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setCurrent(charity); setIsEditing(true); }}>Edit</button>
                        <button className="btn btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => handleDelete(charity.id)}>Delete</button>
                      </div>
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
