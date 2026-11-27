import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [form, setForm] = useState({ quantity_needed: '', requested_from: '', requested_until: '', offered_price: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listings.get(id).then(setListing).catch(() => navigate('/market'));
  }, [id, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.requests.create({ listing_id: id, ...form });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!listing) return <div className="loading">Laden...</div>;

  const TYPE_LABELS = { yard: 'Terreinruimte', slot_truck: 'Truck-slot', slot_vessel: 'Vessel-slot' };
  const from = new Date(listing.available_from).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' });
  const until = new Date(listing.available_until).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ maxWidth: 640 }}>
      <button className="btn-secondary" style={{ marginBottom: '1.5rem' }} onClick={() => navigate('/market')}>
        ← Terug naar markt
      </button>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <span className="badge badge-blue">{TYPE_LABELS[listing.type] || listing.type}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{listing.provider_alias}</span>
        </div>

        <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {listing.capacity} {listing.unit}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0', color: 'var(--gray-600)', fontSize: '0.875rem' }}>
          <div>📍 Zone: <strong>{listing.zone}</strong></div>
          <div>📅 Beschikbaar: {from} tot {until}</div>
          {listing.price_per_unit && (
            <div>💶 Prijs: <strong style={{ color: 'var(--green)' }}>€{listing.price_per_unit} / {listing.unit}</strong></div>
          )}
        </div>

        {listing.description && (
          <div style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.875rem', borderLeft: '3px solid var(--blue-light)', color: 'var(--gray-600)' }}>
            {listing.description}
          </div>
        )}
      </div>

      {listing.is_own ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--gray-600)', padding: '2rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏭</div>
          <p>Dit is uw eigen listing. Andere terminals kunnen hier een aanvraag voor doen.</p>
        </div>
      ) : success ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Aanvraag ingediend!</h3>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            De aanbieder ontvangt anoniem uw aanvraag en reageert zo snel mogelijk.
          </p>
          <button className="btn-primary" onClick={() => navigate('/requests')}>
            Mijn aanvragen bekijken →
          </button>
        </div>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Aanvraag indienen</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label>Gewenste hoeveelheid ({listing.unit})</label>
                <input
                  type="number"
                  min="1"
                  max={listing.capacity}
                  value={form.quantity_needed}
                  onChange={e => setForm(f => ({ ...f, quantity_needed: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Bod prijs (€/{listing.unit})</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={listing.price_per_unit || 'Onderhandelbaar'}
                  value={form.offered_price}
                  onChange={e => setForm(f => ({ ...f, offered_price: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Gewenste startdatum</label>
                <input
                  type="date"
                  min={listing.available_from?.split('T')[0]}
                  max={listing.available_until?.split('T')[0]}
                  value={form.requested_from}
                  onChange={e => setForm(f => ({ ...f, requested_from: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gewenste einddatum</label>
                <input
                  type="date"
                  min={form.requested_from || listing.available_from?.split('T')[0]}
                  max={listing.available_until?.split('T')[0]}
                  value={form.requested_until}
                  onChange={e => setForm(f => ({ ...f, requested_until: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Bericht (optioneel)</label>
              <textarea
                rows="3"
                placeholder="Extra informatie of vragen..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>

            {error && <div style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>{error}</div>}

            <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '0.875rem' }}>
              {submitting ? 'Bezig...' : 'Aanvraag indienen'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
