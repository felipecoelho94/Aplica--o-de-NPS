import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Save, Send, ArrowLeft } from 'lucide-react'
import { surveyApi, UpdateSurveyRequest } from '../services/api/surveyApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export function EditSurveyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: surveyData, isLoading } = useQuery(
    ['survey', id],
    () => surveyApi.getSurvey(id!),
    { enabled: !!id }
  )

  const survey = surveyData?.data

  if (isLoading) {
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
        <button
          onClick={() => navigate('/surveys')}
          className="btn btn-primary mt-4"
        >
          Voltar para Pesquisas
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/surveys')}
          className="btn btn-outline btn-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{survey.title}</h1>
          <p className="text-secondary-600">Editar pesquisa</p>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <p className="text-secondary-600">
            Funcionalidade de edição em desenvolvimento. Por enquanto, você pode visualizar os detalhes da pesquisa.
          </p>
          
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="font-medium text-secondary-900">Status</h3>
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
            </div>

            <div>
              <h3 className="font-medium text-secondary-900">Perguntas</h3>
              <p className="text-secondary-600">{survey.questions.length} pergunta{survey.questions.length !== 1 ? 's' : ''}</p>
            </div>

            <div>
              <h3 className="font-medium text-secondary-900">Canais de Envio</h3>
              <div className="flex space-x-2 mt-1">
                {survey.settings.channels.map(channel => (
                  <span key={channel} className="badge badge-primary">
                    {channel === 'email' ? 'E-mail' : 'WhatsApp'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
