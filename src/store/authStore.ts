import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LoginResponse } from '@/lib/api';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userName: string | null;
  id: string | null;
  setUser: (token: string, userName: string, id: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      userName: null,
      id: null,
      setUser: (token: string, userName: string, id: string) => {
        localStorage.setItem('authToken', token);
        set({ token, isAuthenticated: true, userName, id });
      },
      clearAuth: () => {
        localStorage.removeItem('authToken');
        set({ token: null, isAuthenticated: false, userName: null, id: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
