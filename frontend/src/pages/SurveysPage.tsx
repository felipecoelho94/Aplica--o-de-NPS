import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Send,
  BarChart3,
  Eye
} from 'lucide-react'
import { surveyApi } from '../services/api/surveyApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export function SurveysPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useQuery(
    ['surveys', page, statusFilter],
    () => surveyApi.getSurveys({
      page,
      limit: 10,
      status: statusFilter || undefined,
    })
  )

  const surveys = data?.data || []
  const total = data?.meta?.total || 0

  const handleDeleteSurvey = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pesquisa?')) return

    try {
      await surveyApi.deleteSurvey(id)
      toast.success('Pesquisa excluída com sucesso!')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir pesquisa')
    }
  }

  const handleSendSurvey = async (id: string) => {
    // This would open a modal or navigate to a send page
    toast.success('Funcionalidade de envio em desenvolvimento')
  }

  const filteredSurveys = surveys.filter(survey =>
    survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ACTIVE: { label: 'Ativa', className: 'badge-success' },
      DRAFT: { label: 'Rascunho', className: 'badge-secondary' },
      PAUSED: { label: 'Pausada', className: 'badge-warning' },
      ARCHIVED: { label: 'Arquivada', className: 'badge-danger' },
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, className: 'badge-secondary' }
    return <span className={`badge ${statusInfo.className}`}>{statusInfo.label}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Pesquisas</h1>
          <p className="text-secondary-600">Gerencie suas pesquisas NPS</p>
        </div>
        <Link
          to="/surveys/create"
          className="btn btn-primary btn-md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Pesquisa
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Buscar pesquisas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="">Todos os status</option>
                <option value="ACTIVE">Ativas</option>
                <option value="DRAFT">Rascunhos</option>
                <option value="PAUSED">Pausadas</option>
                <option value="ARCHIVED">Arquivadas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Surveys List */}
      <div className="card">
        <div className="card-content p-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                {searchTerm || statusFilter ? 'Nenhuma pesquisa encontrada' : 'Nenhuma pesquisa criada'}
              </h3>
              <p className="text-secondary-600 mb-6">
                {searchTerm || statusFilter 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie sua primeira pesquisa para começar a coletar feedback'
                }
              </p>
              {!searchTerm && !statusFilter && (
                <Link to="/surveys/create" className="btn btn-primary">
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeira Pesquisa
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-secondary-200">
              {filteredSurveys.map((survey) => (
                <div key={survey.id} className="p-6 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-secondary-900">
                          {survey.title}
                        </h3>
                        {getStatusBadge(survey.status)}
                      </div>
                      
                      {survey.description && (
                        <p className="text-secondary-600 mb-3">{survey.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm text-secondary-500">
                        <span>{survey.questions.length} pergunta{survey.questions.length !== 1 ? 's' : ''}</span>
                        <span>Criada em {new Date(survey.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span>Atualizada em {new Date(survey.updatedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/surveys/${survey.id}/responses`}
                        className="btn btn-outline btn-sm"
                        title="Ver respostas"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                      
                      <Link
                        to={`/surveys/${survey.id}/edit`}
                        className="btn btn-outline btn-sm"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      
                      <button
                        onClick={() => handleSendSurvey(survey.id)}
                        className="btn btn-primary btn-sm"
                        title="Enviar"
                        disabled={survey.status !== 'ACTIVE'}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      
                      <div className="relative">
                        <button className="btn btn-outline btn-sm">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {/* Dropdown menu would go here */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-600">
            Mostrando {((page - 1) * 10) + 1} a {Math.min(page * 10, total)} de {total} pesquisas
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-outline btn-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 10 >= total}
              className="btn btn-outline btn-sm"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
