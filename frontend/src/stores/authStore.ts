import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api/authApi'

interface User {
  id: string
  email: string
  name: string
  tenantId: string
  role: 'ADMIN' | 'USER' | 'VIEWER'
  createdAt: string
  updatedAt: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  setLoading: (loading: boolean) => void
}

interface SignupData {
  email: string
  password: string
  name: string
  tenantName?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          const response = await authApi.login({ email, password })
          
          set({
            user: response.data.user,
            tokens: response.data.tokens,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signup: async (data: SignupData) => {
        try {
          set({ isLoading: true })
          const response = await authApi.signup(data)
          
          set({
            user: response.data.user,
            tokens: response.data.tokens,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      refreshToken: async () => {
        try {
          const { tokens } = get()
          if (!tokens?.refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await authApi.refreshToken(tokens.refreshToken)
          
          set({
            tokens: response.data,
          })
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
