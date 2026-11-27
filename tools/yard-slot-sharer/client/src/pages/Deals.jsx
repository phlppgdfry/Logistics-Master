import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUS_LABELS = { confirmed: 'Bevestigd', in_progress: 'Lopend', completed: 'Afgerond', disputed: 'Betwist' };
const STATUS_BADGES = { confirmed: 'badge-blue', in_progress: 'badge-orange', completed: 'badge-green', disputed: 'badge-red' };

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.deals.list().then(setDeals).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleComplete(id) {
    try {
      await api.deals.complete(id);
      const updated = await api.deals.list();
      setDeals(updated);
    } catch (err) {
      alert(err.message);
    }
  }

  const active = deals.filter(d => d.status === 'confirmed' || d.status === 'in_progress');
  const past = deals.filter(d => d.status === 'completed' || d.status === 'disputed');

  return (
    <div>
      <div className="page-header">
        <h1>Deals</h1>
        <p>Overzicht van alle bevestigde capaciteitsuitwisselingen</p>
      </div>

      {loading ? (
        <div className="loading">Laden...</div>
      ) : deals.length === 0 ? (
        <div className="card empty-state">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤝</div>
          <h3>Nog geen deals</h3>
          <p>Zodra een aanvraag wordt geaccepteerd, verschijnt de deal hier.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actieve deals</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {active.map(d => <DealCard key={d.id} deal={d} onComplete={handleComplete} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Afgeronde deals</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {past.map(d => <DealCard key={d.id} deal={d} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DealCard({ deal, onComplete }) {
  const totalValue = (deal.agreed_quantity * deal.agreed_price).toFixed(2);
  const from = new Date(deal.period_from).toLocaleDateString('nl-BE');
  const until = new Date(deal.period_until).toLocaleDateString('nl-BE');
  const counterparty = deal.is_provider ? deal.requester_alias : deal.provider_alias;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
            <span className={`badge ${STATUS_BADGES[deal.status]}`}>{STATUS_LABELS[deal.status]}</span>
            <span className="badge badge-gray">{deal.is_provider ? '↑ Aanbieder' : '↓ Afnemer'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>met {counterparty}</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {deal.agreed_quantity} {deal.unit} — {deal.zone}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.375rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span>📅 {from} – {until}</span>
            <span>💶 €{deal.agreed_price}/{deal.unit}</span>
            <span style={{ fontWeight: 600, color: 'var(--blue)' }}>Totaal: €{totalValue}</span>
          </div>
        </div>
        {onComplete && (deal.status === 'confirmed' || deal.status === 'in_progress') && (
          <button className="btn-success" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }} onClick={() => onComplete(deal.id)}>
            ✓ Afronden
          </button>
        )}
      </div>
    </div>
  );
}
