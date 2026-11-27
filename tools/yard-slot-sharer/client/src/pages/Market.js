import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import './Market.css';

const TYPE_LABELS = { yard: 'Terrein (m²)', slot_truck: 'Truck-slot', slot_vessel: 'Vessel-slot' };
const TYPE_EMOJI = { yard: '📦', slot_truck: '🚛', slot_vessel: '🚢' };

export default function Market() {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({ type: '', zone: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.listings.list(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)))
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <div className="page-header">
        <h1>Marktplaats</h1>
        <p>Anonieme capaciteitsaanbiedingen van Zeebrugge-terminals</p>
      </div>

      <div className="market-filters card">
        <div className="filter-row">
          <div className="form-group">
            <label>Type capaciteit</label>
            <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
              <option value="">Alle types</option>
              <option value="yard">Terrein (m²)</option>
              <option value="slot_truck">Truck-slot</option>
              <option value="slot_vessel">Vessel-slot</option>
            </select>
          </div>
          <div className="form-group">
            <label>Zone</label>
            <input
              placeholder="Filter op zone..."
              value={filters.zone}
              onChange={e => setFilters(f => ({ ...f, zone: e.target.value }))}
            />
          </div>
          <button className="btn-secondary" onClick={() => setFilters({ type: '', zone: '' })}>
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Laden...</div>
      ) : listings.length === 0 ? (
        <div className="card empty-state">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <h3>Geen aanbiedingen gevonden</h3>
          <p>Pas uw filters aan of kom later terug.</p>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map(l => (
            <ListingCard key={l.id} listing={l} onClick={() => navigate(`/market/${l.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing, onClick }) {
  const from = new Date(listing.available_from).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short' });
  const until = new Date(listing.available_until).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short' });

  return (
    <div className="card listing-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="listing-card-top">
        <div className="listing-type-badge">
          <span>{TYPE_EMOJI[listing.type]}</span>
          <span>{TYPE_LABELS[listing.type] || listing.type}</span>
        </div>
        {listing.is_own && <span className="badge badge-gray">Eigen</span>}
      </div>

      <div className="listing-capacity">
        <span className="capacity-value">{listing.capacity}</span>
        <span className="capacity-unit">{listing.unit}</span>
      </div>

      <div className="listing-meta">
        <div className="meta-item">📍 {listing.zone}</div>
        <div className="meta-item">📅 {from} – {until}</div>
        <div className="meta-item">🏭 {listing.provider_alias}</div>
      </div>

      <div className="listing-footer">
        {listing.price_per_unit ? (
          <div className="listing-price">
            €{listing.price_per_unit}<span>/{listing.unit}</span>
          </div>
        ) : (
          <div className="listing-price negotiable">Open voor onderhandeling</div>
        )}
        {!listing.is_own && (
          <button className="btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
            Aanvragen
          </button>
        )}
      </div>

      {listing.description && (
        <div className="listing-description">{listing.description}</div>
      )}
    </div>
  );
}
