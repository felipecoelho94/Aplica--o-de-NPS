import { apiClient } from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  name: string
  tenantName?: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: {
      id: string
      email: string
      name: string
      tenantId: string
      role: string
      createdAt: string
      updatedAt: string
    }
    tokens: {
      accessToken: string
      refreshToken: string
      expiresIn: number
    }
  }
}

export interface RefreshTokenResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/v1/auth/login', data)
    return response.data
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/v1/auth/signup', data)
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post('/v1/auth/refresh', { refreshToken })
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/v1/auth/logout')
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await apiClient.get('/v1/auth/me')
    return response.data
  },
}
