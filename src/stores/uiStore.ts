import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  cartOpen: boolean;
  searchOpen: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleSearch: () => void;
}

/** Aplica la clase `dark` al <html> y sincroniza la meta theme-color. */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // El tema inicial se lee del DOM (ya aplicado por el script anti-FOUC en index.html).
      theme: typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light',
      cartOpen: false,
      searchOpen: false,

      toggleTheme: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
      },
      setTheme: (t) => {
        applyTheme(t);
        set({ theme: t });
      },
      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
      toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
    }),
    {
      name: 'vertice-theme',
      partialize: (s) => ({ theme: s.theme }),
      // Reaplica el tema tras rehidratar desde localStorage.
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
