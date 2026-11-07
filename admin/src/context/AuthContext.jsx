import { createContext, useContext, useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page load, use the saved token to find out who is logged in
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api('/auth/me')
      .then((data) => {
        if (data.user.role === 'ADMIN') setAdmin(data.user);
        else clearToken();
      })
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api('/auth/admin/login', { method: 'POST', body: { email, password } });
    setToken(data.token);
    setAdmin(data.user);
  }

  function logout() {
    clearToken();
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
