import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ArrowLeft, Download, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { surveyApi } from '../services/api/surveyApi'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function SurveyResponsesPage() {
  const { id } = useParams<{ id: string }>()

  const { data: surveyData, isLoading: surveyLoading } = useQuery(
    ['survey', id],
    () => surveyApi.getSurvey(id!),
    { enabled: !!id }
  )

  const { data: responsesData, isLoading: responsesLoading } = useQuery(
    ['survey-responses', id],
    () => surveyApi.getSurveyResponses(id!, { limit: 50 }),
    { enabled: !!id }
  )

  const survey = surveyData?.data
  const responses = responsesData?.data || []

  if (surveyLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary-600">Pesquisa não encontrada</p>
        <Link to="/surveys" className="btn btn-primary mt-4">
          Voltar para Pesquisas
        </Link>
      </div>
    )
  }

  // Calculate NPS metrics
  const npsResponses = responses.filter(r => r.score !== undefined)
  const promoters = npsResponses.filter(r => r.score! >= 9).length
  const passives = npsResponses.filter(r => r.score! >= 7 && r.score! < 9).length
  const detractors = npsResponses.filter(r => r.score! < 7).length
  const npsScore = npsResponses.length > 0 ? Math.round(((promoters - detractors) / npsResponses.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/surveys" className="btn btn-outline btn-sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{survey.title}</h1>
          <p className="text-secondary-600">Respostas e Análise</p>
        </div>
      </div>

      {/* NPS Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-content text-center">
            <h3 className="text-sm font-medium text-secondary-600 mb-2">Score NPS</h3>
            <div className={`nps-score ${npsScore >= 50 ? 'nps-score-promoter' : npsScore >= 0 ? 'nps-score-passive' : 'nps-score-detractor'}`}>
              {npsScore}
            </div>
            <p className="text-sm text-secondary-600 mt-2">
              {npsScore >= 50 ? 'Excelente' : npsScore >= 0 ? 'Bom' : 'Precisa melhorar'}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <h3 className="text-sm font-medium text-secondary-600 mb-4">Distribuição</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-success-500 rounded-full mr-2"></div>
                  <span className="text-sm text-secondary-600">Promotores</span>
                </div>
                <span className="text-sm font-medium">{promoters}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-warning-500 rounded-full mr-2"></div>
                  <span className="text-sm text-secondary-600">Passivos</span>
                </div>
                <span className="text-sm font-medium">{passives}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-danger-500 rounded-full mr-2"></div>
                  <span className="text-sm text-secondary-600">Detratores</span>
                </div>
                <span className="text-sm font-medium">{detractors}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content text-center">
            <h3 className="text-sm font-medium text-secondary-600 mb-2">Total de Respostas</h3>
            <div className="text-3xl font-bold text-secondary-900">{responses.length}</div>
            <p className="text-sm text-secondary-600 mt-2">
              {npsResponses.length} com score NPS
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="btn btn-outline btn-sm">
                <Filter className="h-4 w-4 mr-1" />
                Filtrar
              </button>
              <button className="btn btn-outline btn-sm">
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </button>
            </div>
            <p className="text-sm text-secondary-600">
              {responses.length} resposta{responses.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Responses List */}
      <div className="card">
        <div className="card-content p-0">
          {responsesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary-600">Nenhuma resposta encontrada</p>
              <p className="text-sm text-secondary-500 mt-1">
                As respostas aparecerão aqui quando os destinatários responderem à pesquisa
              </p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-200">
              {responses.map((response) => (
                <div key={response.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {response.score !== undefined && (
                          <div className={`nps-score text-lg ${
                            response.score >= 9 ? 'nps-score-promoter' :
                            response.score >= 7 ? 'nps-score-passive' :
                            'nps-score-detractor'
                          }`}>
                            {response.score}
                          </div>
                        )}
                        <span className={`badge ${
                          response.category === 'PROMOTER' ? 'badge-success' :
                          response.category === 'PASSIVE' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {response.category === 'PROMOTER' ? 'Promotor' :
                           response.category === 'PASSIVE' ? 'Passivo' :
                           'Detrator'}
                        </span>
                        <span className="text-sm text-secondary-500">
                          {new Date(response.completedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {response.answers.map((answer, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium text-secondary-700">
                              {survey.questions.find(q => q.id === answer.questionId)?.text}:
                            </span>
                            <span className="ml-2 text-secondary-600">
                              {answer.text || answer.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
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
