import { create } from 'zustand'
import { User } from '../types'

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  setAuth: (user, token) => {
    localStorage.setItem('access_token', token)
    set({ user, accessToken: token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },
  setLoading: (loading) => set({ isLoading: loading }),
}))
