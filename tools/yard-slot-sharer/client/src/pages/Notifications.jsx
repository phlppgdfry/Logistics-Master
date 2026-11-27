import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const TYPE_ICONS = {
  new_listing: '📦',
  new_request: '📨',
  request_accepted: '✅',
  request_rejected: '❌',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.notifications.list()
      .then(data => {
        setNotifications(data);
        const unread = data.filter(n => !n.read).map(n => n.id);
        if (unread.length > 0) api.notifications.markRead(unread);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleClick(n) {
    if (n.related_listing_id) navigate(`/market/${n.related_listing_id}`);
    else if (n.related_request_id) navigate('/requests');
  }

  return (
    <div>
      <div className="page-header">
        <h1>Meldingen</h1>
        <p>Notificaties over uw listings, aanvragen en deals</p>
      </div>

      {loading ? (
        <div className="loading">Laden...</div>
      ) : notifications.length === 0 ? (
        <div className="card empty-state">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
          <h3>Geen meldingen</h3>
          <p>Nieuwe activiteit verschijnt hier.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              className="card"
              onClick={() => handleClick(n)}
              style={{
                cursor: (n.related_listing_id || n.related_request_id) ? 'pointer' : 'default',
                background: n.read ? 'white' : 'var(--blue-light)',
                borderLeft: n.read ? 'none' : '4px solid var(--blue)',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>{TYPE_ICONS[n.type] || '🔔'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>{n.body}</div>}
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.375rem' }}>
                    {new Date(n.created_at).toLocaleString('nl-BE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: '0.375rem' }} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
