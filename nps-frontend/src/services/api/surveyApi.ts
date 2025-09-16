import { apiClient } from './client'

export interface Survey {
  id: string
  title: string
  description?: string
  questions: SurveyQuestion[]
  settings: SurveySettings
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export interface SurveyQuestion {
  id: string
  type: 'NPS' | 'TEXT' | 'RATING' | 'CHOICE'
  text: string
  required: boolean
  options?: string[]
}

export interface SurveySettings {
  allowAnonymous: boolean
  maxResponses?: number
  expiresAt?: string
  channels: ('email' | 'whatsapp')[]
  templates: {
    email?: EmailTemplate
    whatsapp?: WhatsAppTemplate
  }
}

export interface EmailTemplate {
  subject: string
  body: string
  fromName: string
  fromEmail: string
}

export interface WhatsAppTemplate {
  templateName: string
  parameters: string[]
}

export interface CreateSurveyRequest {
  title: string
  description?: string
  questions: Omit<SurveyQuestion, 'id'>[]
  settings?: Partial<SurveySettings>
}

export interface UpdateSurveyRequest {
  title?: string
  description?: string
  questions?: Omit<SurveyQuestion, 'id'>[]
  settings?: Partial<SurveySettings>
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
}

export interface SendSurveyRequest {
  recipients: Array<{
    email: string
    name?: string
    phone?: string
  }>
  channel: 'email' | 'whatsapp'
  scheduledAt?: string
}

export interface SurveyResponse {
  id: string
  surveyId: string
  answers: ResponseAnswer[]
  score?: number
  category?: 'PROMOTER' | 'PASSIVE' | 'DETRACTOR'
  completedAt: string
  metadata: {
    channel: string
    userAgent?: string
    ipAddress?: string
    sessionId?: string
  }
}

export interface ResponseAnswer {
  questionId: string
  type: 'NPS' | 'TEXT' | 'RATING' | 'CHOICE'
  value: string | number
  text?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: {
    page: number
    limit: number
    total: number
  }
}

export const surveyApi = {
  getSurveys: async (params?: {
    page?: number
    limit?: number
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<Survey[]>> => {
    const response = await apiClient.get('/v1/surveys', { params })
    return response.data
  },

  getSurvey: async (id: string): Promise<ApiResponse<Survey>> => {
    const response = await apiClient.get(`/v1/surveys/${id}`)
    return response.data
  },

  createSurvey: async (data: CreateSurveyRequest): Promise<ApiResponse<Survey>> => {
    const response = await apiClient.post('/v1/surveys', data)
    return response.data
  },

  updateSurvey: async (id: string, data: UpdateSurveyRequest): Promise<ApiResponse<Survey>> => {
    const response = await apiClient.put(`/v1/surveys/${id}`, data)
    return response.data
  },

  deleteSurvey: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(`/v1/surveys/${id}`)
    return response.data
  },

  sendSurvey: async (id: string, data: SendSurveyRequest): Promise<ApiResponse<{
    sendId: string
    surveyId: string
    recipientCount: number
    status: string
  }>> => {
    const response = await apiClient.post(`/v1/surveys/${id}/send`, data)
    return response.data
  },

  getSurveyResponses: async (id: string, params?: {
    page?: number
    limit?: number
    dateFrom?: string
    dateTo?: string
  }): Promise<ApiResponse<SurveyResponse[]>> => {
    const response = await apiClient.get(`/v1/surveys/${id}/responses`, { params })
    return response.data
  },
}
