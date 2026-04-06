import { createContext, useState, useEffect } from 'react';
import { login as loginApi } from '../api/authApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await loginApi(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('admin', JSON.stringify(data.admin));
    setAdmin(data.admin);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}