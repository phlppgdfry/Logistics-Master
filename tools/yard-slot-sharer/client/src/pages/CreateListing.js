import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const ZONES = ['Albert II-dok Noord','Albert II-dok Zuid','Wielingendok','Zuidelijk Insteekdok','LNG-terminal','Brittaniadok','Tijdok','Nieuwe Vissershaven','Oude Vissershaven','RORO-terminal'];
const UNITS_BY_TYPE = { yard: ['m²', 'TEU'], slot_truck: ['slots', 'slots/dag'], slot_vessel: ['slots', 'berths'] };

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'yard', capacity: '', unit: 'm²', zone: '',
    available_from: '', available_until: '', price_per_unit: '', description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleTypeChange(type) {
    setForm(f => ({ ...f, type, unit: UNITS_BY_TYPE[type][0] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.listings.create(form);
      navigate('/my-listings');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Capaciteit aanbieden</h1>
        <p>Uw listing wordt anoniem gepubliceerd op de marktplaats</p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Type capaciteit</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[['yard','📦 Terrein (m²)'], ['slot_truck','🚛 Truck-slot'], ['slot_vessel','🚢 Vessel-slot']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => handleTypeChange(val)} style={{
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1.5px solid',
                  borderColor: form.type === val ? 'var(--blue)' : 'var(--gray-200)',
                  background: form.type === val ? 'var(--blue-light)' : 'white',
                  color: form.type === val ? 'var(--blue)' : 'var(--gray-800)',
                  fontWeight: form.type === val ? 600 : 400, cursor: 'pointer', fontSize: '0.875rem',
                }}>{label}</button>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Hoeveelheid</label>
              <input type="number" min="1" value={form.capacity}
                onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Eenheid</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                {UNITS_BY_TYPE[form.type].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Zone</label>
            <select value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} required>
              <option value="">Kies zone...</option>
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Beschikbaar vanaf</label>
              <input type="date" value={form.available_from}
                onChange={e => setForm(f => ({ ...f, available_from: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Beschikbaar tot</label>
              <input type="date" min={form.available_from} value={form.available_until}
                onChange={e => setForm(f => ({ ...f, available_until: e.target.value }))} required />
            </div>
          </div>

          <div className="form-group">
            <label>Vraagprijs per eenheid (€) — leeg = onderhandelbaar</label>
            <input type="number" step="0.01" min="0" placeholder="bv. 12.50"
              value={form.price_per_unit} onChange={e => setForm(f => ({ ...f, price_per_unit: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>Beschrijving (optioneel)</label>
            <textarea rows="3" placeholder="Toegang, beperkingen, bijkomende info..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>

          {error && <div style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '0.875rem', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Publiceren...' : 'Listing publiceren'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/my-listings')}>
              Annuleer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
