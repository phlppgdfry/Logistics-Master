import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('yss_token');
    const stored = localStorage.getItem('yss_company');
    if (token && stored) {
      setCompany(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  function login(token, companyData) {
    localStorage.setItem('yss_token', token);
    localStorage.setItem('yss_company', JSON.stringify(companyData));
    setCompany(companyData);
  }

  function logout() {
    localStorage.removeItem('yss_token');
    localStorage.removeItem('yss_company');
    setCompany(null);
  }

  return (
    <AuthContext.Provider value={{ company, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
