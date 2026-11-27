import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import MyListings from './pages/MyListings';
import Requests from './pages/Requests';
import Deals from './pages/Deals';
import Notifications from './pages/Notifications';
import ListingDetail from './pages/ListingDetail';

function PrivateRoute({ children }) {
  const { company, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--gray-400)' }}>Laden...</div>;
  if (!company) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { company, loading } = useAuth();
  if (loading) return null;
  if (company) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/market" element={<PrivateRoute><Market /></PrivateRoute>} />
        <Route path="/market/:id" element={<PrivateRoute><ListingDetail /></PrivateRoute>} />
        <Route path="/my-listings" element={<PrivateRoute><MyListings /></PrivateRoute>} />
        <Route path="/requests" element={<PrivateRoute><Requests /></PrivateRoute>} />
        <Route path="/deals" element={<PrivateRoute><Deals /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
