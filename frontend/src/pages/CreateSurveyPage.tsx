import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Save, Send } from 'lucide-react'
import { surveyApi, CreateSurveyRequest } from '../services/api/surveyApi'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

interface QuestionForm {
  type: 'NPS' | 'TEXT' | 'RATING' | 'CHOICE'
  text: string
  required: boolean
  options?: string[]
}

interface SurveyForm {
  title: string
  description: string
  questions: QuestionForm[]
  settings: {
    allowAnonymous: boolean
    maxResponses?: number
    expiresAt?: string
    channels: ('email' | 'whatsapp')[]
  }
}

export function CreateSurveyPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<SurveyForm>({
    defaultValues: {
      title: '',
      description: '',
      questions: [
        {
          type: 'NPS',
          text: 'Em uma escala de 0 a 10, qual a probabilidade de você recomendar nossos serviços para um amigo ou colega?',
          required: true,
        }
      ],
      settings: {
        allowAnonymous: true,
        channels: ['email'],
      },
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  })

  const addQuestion = (type: 'NPS' | 'TEXT' | 'RATING' | 'CHOICE') => {
    const questionTexts = {
      NPS: 'Em uma escala de 0 a 10, qual a probabilidade de você recomendar nossos serviços?',
      TEXT: 'Deixe seu comentário ou sugestão:',
      RATING: 'Avalie nosso atendimento de 1 a 5:',
      CHOICE: 'Qual é sua principal razão para nos escolher?',
    }

    append({
      type,
      text: questionTexts[type],
      required: true,
      options: type === 'CHOICE' ? ['Opção 1', 'Opção 2', 'Opção 3'] : undefined,
    })
  }

  const handleSave = async (data: SurveyForm) => {
    try {
      setIsSaving(true)
      const response = await surveyApi.createSurvey(data)
      toast.success('Pesquisa salva com sucesso!')
      navigate(`/surveys/${response.data.id}/edit`)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar pesquisa')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAndSend = async (data: SurveyForm) => {
    try {
      setIsLoading(true)
      const response = await surveyApi.createSurvey({
        ...data,
        settings: {
          ...data.settings,
          // Auto-activate for sending
        }
      })
      
      // Update status to ACTIVE
      await surveyApi.updateSurvey(response.data.id, { status: 'ACTIVE' })
      
      toast.success('Pesquisa criada e ativada com sucesso!')
      navigate(`/surveys/${response.data.id}/edit`)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar pesquisa')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Criar Nova Pesquisa</h1>
        <p className="text-secondary-600">Configure sua pesquisa NPS personalizada</p>
      </div>

      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Informações Básicas</h3>
            <p className="card-description">Configure o título e descrição da sua pesquisa</p>
          </div>
          <div className="card-content space-y-4">
            <div>
              <label className="label">Título da Pesquisa *</label>
              <input
                {...form.register('title', { required: 'Título é obrigatório' })}
                type="text"
                className="input"
                placeholder="Ex: Pesquisa de Satisfação - Q1 2024"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-danger-600 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Descrição</label>
              <textarea
                {...form.register('description')}
                rows={3}
                className="input"
                placeholder="Descreva o objetivo da pesquisa..."
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Perguntas</h3>
            <p className="card-description">Adicione e configure as perguntas da sua pesquisa</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-secondary-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-secondary-900">
                      Pergunta {index + 1}
                    </h4>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-danger-600 hover:text-danger-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="label">Tipo de Pergunta</label>
                      <select
                        {...form.register(`questions.${index}.type`)}
                        className="input"
                      >
                        <option value="NPS">NPS (0-10)</option>
                        <option value="TEXT">Texto Livre</option>
                        <option value="RATING">Avaliação (1-5)</option>
                        <option value="CHOICE">Múltipla Escolha</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Texto da Pergunta *</label>
                      <textarea
                        {...form.register(`questions.${index}.text`, { 
                          required: 'Texto da pergunta é obrigatório' 
                        })}
                        rows={2}
                        className="input"
                        placeholder="Digite sua pergunta..."
                      />
                    </div>

                    {form.watch(`questions.${index}.type`) === 'CHOICE' && (
                      <div>
                        <label className="label">Opções de Resposta</label>
                        <div className="space-y-2">
                          {form.watch(`questions.${index}.options`)?.map((_, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                {...form.register(`questions.${index}.options.${optionIndex}`)}
                                type="text"
                                className="input flex-1"
                                placeholder={`Opção ${optionIndex + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const options = form.getValues(`questions.${index}.options`) || []
                                  const newOptions = options.filter((_, i) => i !== optionIndex)
                                  form.setValue(`questions.${index}.options`, newOptions)
                                }}
                                className="text-danger-600 hover:text-danger-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const options = form.getValues(`questions.${index}.options`) || []
                              form.setValue(`questions.${index}.options`, [...options, ''])
                            }}
                            className="btn btn-outline btn-sm"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar Opção
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        {...form.register(`questions.${index}.required`)}
                        type="checkbox"
                        id={`required-${index}`}
                        className="h-4 w-4 text-primary-600 border-secondary-300 rounded"
                      />
                      <label htmlFor={`required-${index}`} className="ml-2 text-sm text-secondary-600">
                        Pergunta obrigatória
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => addQuestion('NPS')}
                  className="btn btn-outline btn-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Pergunta NPS
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('TEXT')}
                  className="btn btn-outline btn-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Texto Livre
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('RATING')}
                  className="btn btn-outline btn-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Avaliação
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('CHOICE')}
                  className="btn btn-outline btn-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Múltipla Escolha
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Configurações</h3>
            <p className="card-description">Configure as opções de envio e resposta</p>
          </div>
          <div className="card-content space-y-4">
            <div className="flex items-center">
              <input
                {...form.register('settings.allowAnonymous')}
                type="checkbox"
                id="allowAnonymous"
                className="h-4 w-4 text-primary-600 border-secondary-300 rounded"
              />
              <label htmlFor="allowAnonymous" className="ml-2 text-sm text-secondary-600">
                Permitir respostas anônimas
              </label>
            </div>

            <div>
              <label className="label">Canais de Envio</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    {...form.register('settings.channels')}
                    type="checkbox"
                    value="email"
                    className="h-4 w-4 text-primary-600 border-secondary-300 rounded"
                  />
                  <span className="ml-2 text-sm text-secondary-600">E-mail</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...form.register('settings.channels')}
                    type="checkbox"
                    value="whatsapp"
                    className="h-4 w-4 text-primary-600 border-secondary-300 rounded"
                  />
                  <span className="ml-2 text-sm text-secondary-600">WhatsApp</span>
                </label>
              </div>
            </div>

            <div>
              <label className="label">Número Máximo de Respostas (opcional)</label>
              <input
                {...form.register('settings.maxResponses', { valueAsNumber: true })}
                type="number"
                min="1"
                className="input"
                placeholder="Ex: 1000"
              />
            </div>

            <div>
              <label className="label">Data de Expiração (opcional)</label>
              <input
                {...form.register('settings.expiresAt')}
                type="datetime-local"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/surveys')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-outline"
          >
            {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Rascunho
          </button>
          <button
            type="button"
            onClick={form.handleSubmit(handleSaveAndSend)}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Criar e Ativar
          </button>
        </div>
      </form>
    </div>
  )
}
