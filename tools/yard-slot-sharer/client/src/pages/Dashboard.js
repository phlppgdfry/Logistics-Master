import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import './Dashboard.css';

export default function Dashboard() {
  const { company } = useAuth();
  const [stats, setStats] = useState({ listings: 0, requests: 0, deals: 0 });
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.listings.mine(),
      api.requests.received(),
      api.deals.list(),
      api.listings.list({ limit: 5 }),
    ]).then(([mine, received, deals, recent]) => {
      setStats({
        listings: mine.filter(l => l.status === 'active').length,
        requests: received.filter(r => r.status === 'pending').length,
        deals: deals.filter(d => d.status === 'confirmed' || d.status === 'in_progress').length,
      });
      setRecentListings(recent.slice(0, 4));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Laden...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Welkom terug, {company?.alias}</h1>
        <p>Zeehaven Zeebrugge — Capaciteitsmarkt</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon yard">📦</div>
          <div className="stat-value">{stats.listings}</div>
          <div className="stat-label">Actieve listings</div>
          <Link to="/my-listings" className="stat-link">Bekijk →</Link>
        </div>
        <div className="stat-card">
          <div className="stat-icon request">📨</div>
          <div className="stat-value">{stats.requests}</div>
          <div className="stat-label">Openstaande aanvragen</div>
          <Link to="/requests" className="stat-link">Bekijk →</Link>
        </div>
        <div className="stat-card">
          <div className="stat-icon deal">🤝</div>
          <div className="stat-value">{stats.deals}</div>
          <div className="stat-label">Actieve deals</div>
          <Link to="/deals" className="stat-link">Bekijk →</Link>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recente marktaanbiedingen</h2>
          <Link to="/market" className="btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
            Alles bekijken →
          </Link>
        </div>
        {recentListings.length === 0 ? (
          <div className="card empty-state">
            <h3>Geen aanbiedingen</h3>
            <p>Er zijn momenteel geen actieve listings op de markt.</p>
          </div>
        ) : (
          <div className="recent-listings">
            {recentListings.map(l => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-cta">
        <div className="card cta-card">
          <h3>Ruimte vrij? Zet hem online.</h3>
          <p>Verhuur uw overkapaciteit anoniem aan andere Zeebrugge-terminals en vermijd leegstand.</p>
          <Link to="/my-listings?new=1" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            + Nieuwe listing plaatsen
          </Link>
        </div>
      </div>
    </div>
  );
}

function ListingCard({ listing }) {
  const typeLabel = { yard: 'Terrein', slot_truck: 'Truck-slot', slot_vessel: 'Vessel-slot' };
  const typeClass = { yard: 'badge-blue', slot_truck: 'badge-orange', slot_vessel: 'badge-green' };

  return (
    <div className="card listing-mini">
      <div className="listing-mini-top">
        <span className={`badge ${typeClass[listing.type] || 'badge-gray'}`}>
          {typeLabel[listing.type] || listing.type}
        </span>
        <span className="listing-mini-alias">{listing.provider_alias}</span>
      </div>
      <div className="listing-mini-capacity">
        {listing.capacity} {listing.unit}
      </div>
      <div className="listing-mini-zone">📍 {listing.zone}</div>
      {listing.price_per_unit && (
        <div className="listing-mini-price">€{listing.price_per_unit}/{listing.unit}</div>
      )}
      <Link to={`/market/${listing.id}`} className="listing-mini-action">Aanvragen →</Link>
    </div>
  );
}
