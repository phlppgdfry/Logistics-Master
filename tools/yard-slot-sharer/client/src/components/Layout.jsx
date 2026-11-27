import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import './Layout.css';

export default function Layout({ children }) {
  const { company, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.notifications.unreadCount().then(d => setUnread(d.count)).catch(() => {});
    const interval = setInterval(() => {
      api.notifications.unreadCount().then(d => setUnread(d.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">⚓</div>
          <div>
            <div className="logo-title">YardEx</div>
            <div className="logo-sub">Zeebrugge</div>
          </div>
        </div>

        <div className="sidebar-company">
          <div className="company-avatar">{company?.alias?.[0] || '?'}</div>
          <div>
            <div className="company-alias">{company?.alias}</div>
            <div className="company-zone">{company?.zone || 'Zeehaven Zeebrugge'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/market" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span>🗺️</span> Marktplaats
          </NavLink>
          <NavLink to="/my-listings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span>📋</span> Mijn Listings
          </NavLink>
          <NavLink to="/requests" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span>📨</span> Aanvragen
          </NavLink>
          <NavLink to="/deals" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span>🤝</span> Deals
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span>🔔</span> Meldingen
            {unread > 0 && <span className="nav-badge">{unread}</span>}
          </NavLink>
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          ← Uitloggen
        </button>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
