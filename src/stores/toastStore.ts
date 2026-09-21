import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';
export interface Toast { id: string; type: ToastType; message: string }

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Helper imperativo para lanzar toasts desde cualquier parte. */
export const toast = {
  success: (message: string) => useToast.getState().push({ type: 'success', message }),
  error: (message: string) => useToast.getState().push({ type: 'error', message }),
  info: (message: string) => useToast.getState().push({ type: 'info', message }),
};
