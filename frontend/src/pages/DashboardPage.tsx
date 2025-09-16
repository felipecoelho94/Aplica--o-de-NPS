import { useQuery } from 'react-query'
import { 
  BarChart3, 
  Users, 
  Mail, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Activity
} from 'lucide-react'
import { surveyApi } from '../services/api/surveyApi'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function DashboardPage() {
  const { data: surveysData, isLoading: surveysLoading } = useQuery(
    'surveys',
    () => surveyApi.getSurveys({ limit: 10 })
  )

  // Mock data for demonstration
  const stats = {
    totalSurveys: surveysData?.data.length || 0,
    activeSurveys: surveysData?.data.filter(s => s.status === 'ACTIVE').length || 0,
    totalResponses: 1247,
    npsScore: 42,
    responseRate: 68.5,
    promoters: 45,
    passives: 23,
    detractors: 32,
  }

  const recentSurveys = surveysData?.data.slice(0, 5) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600">Visão geral das suas pesquisas NPS</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total de Pesquisas</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.totalSurveys}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <Activity className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Pesquisas Ativas</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.activeSurveys}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Users className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total de Respostas</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.totalResponses}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Taxa de Resposta</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.responseRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NPS Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Score NPS</h3>
            <p className="card-description">Pontuação atual do Net Promoter Score</p>
          </div>
          <div className="card-content">
            <div className="text-center">
              <div className={`nps-score ${stats.npsScore >= 50 ? 'nps-score-promoter' : stats.npsScore >= 0 ? 'nps-score-passive' : 'nps-score-detractor'}`}>
                {stats.npsScore}
              </div>
              <p className="text-sm text-secondary-600 mt-2">
                {stats.npsScore >= 50 ? 'Excelente' : stats.npsScore >= 0 ? 'Bom' : 'Precisa melhorar'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Distribuição NPS</h3>
            <p className="card-description">Percentual de promotores, passivos e detratores</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-success-500 rounded-full mr-2"></div>
                  <span className="text-sm text-secondary-600">Promotores</span>
                </div>
                <span className="text-sm font-medium">{stats.promoters}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-warning-500 rounded-full mr-2"></div>
                  <span className="text-sm text-secondary-600">Passivos</span>
                </div>
                <span className="text-sm font-medium">{stats.passives}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-danger-500 rounded-full mr-2"></div>
                  <span className="text-sm text-secondary-600">Detratores</span>
                </div>
                <span className="text-sm font-medium">{stats.detractors}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Surveys */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Pesquisas Recentes</h3>
          <p className="card-description">Suas pesquisas mais recentes</p>
        </div>
        <div className="card-content">
          {surveysLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : recentSurveys.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600">Nenhuma pesquisa encontrada</p>
              <p className="text-sm text-secondary-500 mt-1">
                Crie sua primeira pesquisa para começar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSurveys.map((survey) => (
                <div key={survey.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-secondary-900">{survey.title}</h4>
                    <p className="text-sm text-secondary-600 mt-1">{survey.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`badge ${
                        survey.status === 'ACTIVE' ? 'badge-success' :
                        survey.status === 'DRAFT' ? 'badge-secondary' :
                        survey.status === 'PAUSED' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {survey.status === 'ACTIVE' ? 'Ativa' :
                         survey.status === 'DRAFT' ? 'Rascunho' :
                         survey.status === 'PAUSED' ? 'Pausada' :
                         'Arquivada'}
                      </span>
                      <span className="text-xs text-secondary-500">
                        {new Date(survey.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-secondary-600">
                      {survey.questions.length} pergunta{survey.questions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
