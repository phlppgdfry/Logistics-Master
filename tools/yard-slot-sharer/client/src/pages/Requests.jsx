import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUS_LABELS = { pending: 'Wachtend', accepted: 'Goedgekeurd', rejected: 'Afgewezen', cancelled: 'Geannuleerd' };
const STATUS_BADGES = { pending: 'badge-orange', accepted: 'badge-green', rejected: 'badge-red', cancelled: 'badge-gray' };

export default function Requests() {
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.requests.received(), api.requests.sent()])
      .then(([r, s]) => { setReceived(r); setSent(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleAccept(id) {
    try {
      await api.requests.accept(id, {});
      const updated = await api.requests.received();
      setReceived(updated);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleReject(id) {
    if (!window.confirm('Aanvraag afwijzen?')) return;
    try {
      await api.requests.reject(id);
      const updated = await api.requests.received();
      setReceived(updated);
    } catch (err) {
      alert(err.message);
    }
  }

  const tabs = [
    { id: 'received', label: `Ontvangen (${received.filter(r => r.status === 'pending').length})` },
    { id: 'sent', label: `Verzonden (${sent.length})` },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Aanvragen</h1>
        <p>Beheer ontvangen en verzonden aanvragen</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius)',
              border: '1.5px solid',
              borderColor: tab === t.id ? 'var(--blue)' : 'var(--gray-200)',
              background: tab === t.id ? 'var(--blue)' : 'white',
              color: tab === t.id ? 'white' : 'var(--gray-800)',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Laden...</div>
      ) : tab === 'received' ? (
        received.length === 0 ? (
          <div className="card empty-state">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📨</div>
            <h3>Geen ontvangen aanvragen</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {received.map(r => (
              <div key={r.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className={`badge ${STATUS_BADGES[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>van {r.requester_alias}</span>
                    </div>
                    <div style={{ fontWeight: 600 }}>{r.quantity_needed} {r.unit} — {r.zone}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
                      📅 {new Date(r.requested_from).toLocaleDateString('nl-BE')} – {new Date(r.requested_until).toLocaleDateString('nl-BE')}
                      {r.offered_price && ` · 💶 €${r.offered_price}/${r.unit}`}
                    </div>
                    {r.message && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-600)', fontStyle: 'italic' }}>"{r.message}"</div>}
                  </div>
                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-success" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }} onClick={() => handleAccept(r.id)}>
                        ✓ Accepteren
                      </button>
                      <button className="btn-danger" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }} onClick={() => handleReject(r.id)}>
                        ✗ Afwijzen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        sent.length === 0 ? (
          <div className="card empty-state">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📤</div>
            <h3>Geen verzonden aanvragen</h3>
            <p>Ga naar de marktplaats om een aanvraag in te dienen.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {sent.map(r => (
              <div key={r.id} className="card">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className={`badge ${STATUS_BADGES[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>bij {r.provider_alias}</span>
                </div>
                <div style={{ fontWeight: 600 }}>{r.quantity_needed} {r.unit} — {r.zone}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
                  📅 {new Date(r.requested_from).toLocaleDateString('nl-BE')} – {new Date(r.requested_until).toLocaleDateString('nl-BE')}
                  {r.offered_price && ` · 💶 €${r.offered_price}/${r.unit}`}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
