import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';

const ZONES = ['Albert II-dok Noord','Albert II-dok Zuid','Wielingendok','Zuidelijk Insteekdok','LNG-terminal','Brittaniadok','Tijdok','Nieuwe Vissershaven','Oude Vissershaven','RORO-terminal'];
const STATUS_LABELS = { active: 'Actief', reserved: 'Gereserveerd', completed: 'Afgerond', cancelled: 'Geannuleerd' };
const STATUS_BADGES = { active: 'badge-green', reserved: 'badge-orange', completed: 'badge-gray', cancelled: 'badge-red' };

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowForm(true);
  }, [searchParams]);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    try {
      const data = await api.listings.mine();
      setListings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm('Listing annuleren?')) return;
    try {
      await api.listings.cancel(id);
      loadListings();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Mijn Listings</h1>
          <p>Uw aangeboden capaciteit op de markt</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Sluiten' : '+ Nieuwe listing'}
        </button>
      </div>

      {showForm && <NewListingForm onCreated={() => { setShowForm(false); loadListings(); }} />}

      {loading ? (
        <div className="loading">Laden...</div>
      ) : listings.length === 0 ? (
        <div className="card empty-state">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
          <h3>Geen listings</h3>
          <p>Maak uw eerste listing aan om capaciteit aan te bieden.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {listings.map(l => (
            <div key={l.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`badge ${STATUS_BADGES[l.status] || 'badge-gray'}`}>{STATUS_LABELS[l.status]}</span>
                  <span style={{ fontWeight: 600 }}>{l.capacity} {l.unit} — {l.zone}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {l.pending_requests > 0 && (
                    <span className="badge badge-orange">{l.pending_requests} aanvraag{l.pending_requests > 1 ? 'en' : ''}</span>
                  )}
                  {l.status === 'active' && (
                    <button className="btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleCancel(l.id)}>
                      Annuleer
                    </button>
                  )}
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                <span>📅 {new Date(l.available_from).toLocaleDateString('nl-BE')} – {new Date(l.available_until).toLocaleDateString('nl-BE')}</span>
                {l.price_per_unit && <span>💶 €{l.price_per_unit}/{l.unit}</span>}
              </div>
              {l.description && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-600)' }}>{l.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewListingForm({ onCreated }) {
  const [form, setForm] = useState({
    type: 'yard', capacity: '', unit: 'm²', zone: '',
    available_from: '', available_until: '', price_per_unit: '', description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const unitsByType = { yard: ['m²', 'TEU'], slot_truck: ['slots', 'slots/dag'], slot_vessel: ['slots', 'berths'] };

  function handleTypeChange(type) {
    setForm(f => ({ ...f, type, unit: unitsByType[type][0] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.listings.create(form);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--blue)' }}>
      <h3 style={{ marginBottom: '1.25rem' }}>Nieuwe listing aanmaken</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Type capaciteit</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[['yard','📦 Terrein'], ['slot_truck','🚛 Truck-slot'], ['slot_vessel','🚢 Vessel-slot']].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => handleTypeChange(val)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)',
                  border: '1.5px solid',
                  borderColor: form.type === val ? 'var(--blue)' : 'var(--gray-200)',
                  background: form.type === val ? 'var(--blue-light)' : 'white',
                  color: form.type === val ? 'var(--blue)' : 'var(--gray-800)',
                  fontWeight: form.type === val ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Hoeveelheid</label>
            <input type="number" min="1" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Eenheid</label>
            <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
              {(unitsByType[form.type] || ['m²']).map(u => <option key={u} value={u}>{u}</option>)}
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
            <input type="date" value={form.available_from} onChange={e => setForm(f => ({ ...f, available_from: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Beschikbaar tot</label>
            <input type="date" min={form.available_from} value={form.available_until} onChange={e => setForm(f => ({ ...f, available_until: e.target.value }))} required />
          </div>
        </div>

        <div className="form-group">
          <label>Vraagprijs per eenheid (€) — leeg = onderhandelbaar</label>
          <input type="number" step="0.01" min="0" placeholder="bv. 12.50" value={form.price_per_unit} onChange={e => setForm(f => ({ ...f, price_per_unit: e.target.value }))} />
        </div>

        <div className="form-group">
          <label>Beschrijving (optioneel)</label>
          <textarea rows="2" placeholder="Bijkomende info over de ruimte of slot..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
        </div>

        {error && <div style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Aanmaken...' : 'Listing publiceren'}
          </button>
        </div>
      </form>
    </div>
  );
}
