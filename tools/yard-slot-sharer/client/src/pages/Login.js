import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.auth.login(form);
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
          <h1>YardEx</h1>
          <p>Anonieme havenruimtebeurs — Zeebrugge</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mailadres</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="terminal@uw-bedrijf.be"
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Wachtwoord</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>
        </form>

        <p className="auth-footer">
          Nog geen account? <Link to="/register">Aanmelden</Link>
        </p>
      </div>
    </div>
  );
}
