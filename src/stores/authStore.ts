import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminSession } from '@/lib/types';
import { api } from '@/lib/api';

interface AuthState {
  session: AdminSession | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const session = await api.adminLogin(email, password);
          set({ session, loading: false });
          return true;
        } catch (e) {
          set({ error: e instanceof Error ? e.message : 'Error de autenticación', loading: false });
          return false;
        }
      },

      logout: () => set({ session: null }),
      isAuthenticated: () => get().session !== null,
    }),
    {
      name: 'vertice-admin-session',
      partialize: (s) => ({ session: s.session }),
    },
  ),
);
