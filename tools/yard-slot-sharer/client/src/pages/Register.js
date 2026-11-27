import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import './Auth.css';

const ZONES = [
  'Albert II-dok Noord',
  'Albert II-dok Zuid',
  'Wielingendok',
  'Zuidelijk Insteekdok',
  'LNG-terminal',
  'Brittaniadok',
  'Tijdok',
  'Nieuwe Vissershaven',
  'Oude Vissershaven',
  'RORO-terminal',
];

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', alias: '', zone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn');
      return;
    }
    setLoading(true);
    try {
      const data = await api.auth.register(form);
      login(data.token, data.company);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">⚓</div>
          <h1>Account aanmaken</h1>
          <p>Kies een anonieme alias — andere terminals zien alleen deze naam</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Anonieme alias</label>
            <input
              value={form.alias}
              onChange={e => setForm(f => ({ ...f, alias: e.target.value }))}
              placeholder="bv. Terminal Alfa"
              required
            />
            <span className="form-hint">Deze naam is zichtbaar voor andere terminals</span>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Zone in Zeebrugge</label>
            <select value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}>
              <option value="">Kies uw zone...</option>
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>E-mailadres (privé)</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="intern@uw-bedrijf.be"
              required
            />
            <span className="form-hint">Nooit zichtbaar voor andere terminals</span>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Wachtwoord</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Minimaal 8 tekens"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Aanmelden...' : 'Account aanmaken'}
          </button>
        </form>

        <p className="auth-footer">
          Al een account? <Link to="/login">Inloggen</Link>
        </p>
      </div>
    </div>
  );
}
