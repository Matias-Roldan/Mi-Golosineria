import { create } from 'zustand';
import { login as loginApi } from '../api/authApi';

const storedAdmin = localStorage.getItem('admin');

export const useAuthStore = create((set) => ({
  admin: storedAdmin ? JSON.parse(storedAdmin) : null,
  loading: false,

  login: async (email, password) => {
    const { data } = await loginApi(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('admin', JSON.stringify(data.admin));
    set({ admin: data.admin });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    set({ admin: null });
  },
}));
