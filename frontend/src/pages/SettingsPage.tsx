import { useState } from 'react'
import { Save, TestTube, CheckCircle } from 'lucide-react'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [zendeskSettings, setZendeskSettings] = useState({
    enabled: false,
    subdomain: '',
    apiToken: '',
    webhookSecret: '',
  })

  const [suncoSettings, setSuncoSettings] = useState({
    enabled: false,
    appId: '',
    apiToken: '',
    webhookSecret: '',
  })

  const handleSaveZendesk = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configurações do Zendesk salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar configurações do Zendesk')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSunco = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configurações do Sunshine Conversations salvas com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar configurações do Sunshine Conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const testZendeskConnection = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Conexão com Zendesk testada com sucesso!')
    } catch (error) {
      toast.error('Erro ao testar conexão com Zendesk')
    } finally {
      setIsLoading(false)
    }
  }

  const testSuncoConnection = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Conexão com Sunshine Conversations testada com sucesso!')
    } catch (error) {
      toast.error('Erro ao testar conexão com Sunshine Conversations')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Configurações</h1>
        <p className="text-secondary-600">Configure as integrações e preferências do sistema</p>
      </div>

      {/* Zendesk Integration */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title">Integração Zendesk</h3>
              <p className="card-description">
                Configure a integração com o Zendesk para criar tickets automaticamente
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${zendeskSettings.enabled ? 'bg-success-500' : 'bg-secondary-300'}`}></div>
              <span className="text-sm text-secondary-600">
                {zendeskSettings.enabled ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
        <div className="card-content space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="zendesk-enabled"
              checked={zendeskSettings.enabled}
              onChange={(e) => setZendeskSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              className="h-4 w-4 text-primary-600 border-secondary-300 rounded"
            />
            <label htmlFor="zendesk-enabled" className="ml-2 text-sm text-secondary-600">
              Habilitar integração com Zendesk
            </label>
          </div>

          {zendeskSettings.enabled && (
            <>
              <div>
                <label className="label">Subdomínio do Zendesk</label>
                <input
                  type="text"
                  value={zendeskSettings.subdomain}
                  onChange={(e) => setZendeskSettings(prev => ({ ...prev, subdomain: e.target.value }))}
                  className="input"
                  placeholder="sua-empresa"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  O subdomínio da sua conta Zendesk (ex: sua-empresa.zendesk.com)
                </p>
              </div>

              <div>
                <label className="label">Token da API</label>
                <input
                  type="password"
                  value={zendeskSettings.apiToken}
                  onChange={(e) => setZendeskSettings(prev => ({ ...prev, apiToken: e.target.value }))}
                  className="input"
                  placeholder="Seu token da API do Zendesk"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Token de autenticação da API do Zendesk
                </p>
              </div>

              <div>
                <label className="label">Webhook Secret</label>
                <input
                  type="password"
                  value={zendeskSettings.webhookSecret}
                  onChange={(e) => setZendeskSettings(prev => ({ ...prev, webhookSecret: e.target.value }))}
                  className="input"
                  placeholder="Seu webhook secret"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Secret para validação dos webhooks do Zendesk
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveZendesk}
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar
                </button>
                <button
                  onClick={testZendeskConnection}
                  disabled={isLoading}
                  className="btn btn-outline"
                >
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
                  Testar Conexão
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sunshine Conversations Integration */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title">Integração WhatsApp (Sunshine Conversations)</h3>
              <p className="card-description">
                Configure a integração com o WhatsApp via Sunshine Conversations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${suncoSettings.enabled ? 'bg-success-500' : 'bg-secondary-300'}`}></div>
              <span className="text-sm text-secondary-600">
                {suncoSettings.enabled ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
        <div className="card-content space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sunco-enabled"
              checked={suncoSettings.enabled}
              onChange={(e) => setSuncoSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              className="h-4 w-4 text-primary-600 border-secondary-300 rounded"
            />
            <label htmlFor="sunco-enabled" className="ml-2 text-sm text-secondary-600">
              Habilitar integração com WhatsApp
            </label>
          </div>

          {suncoSettings.enabled && (
            <>
              <div>
                <label className="label">App ID</label>
                <input
                  type="text"
                  value={suncoSettings.appId}
                  onChange={(e) => setSuncoSettings(prev => ({ ...prev, appId: e.target.value }))}
                  className="input"
                  placeholder="Seu App ID do Sunshine Conversations"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  ID da aplicação no Sunshine Conversations
                </p>
              </div>

              <div>
                <label className="label">Token da API</label>
                <input
                  type="password"
                  value={suncoSettings.apiToken}
                  onChange={(e) => setSuncoSettings(prev => ({ ...prev, apiToken: e.target.value }))}
                  className="input"
                  placeholder="Seu token da API do Sunshine Conversations"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Token de autenticação da API do Sunshine Conversations
                </p>
              </div>

              <div>
                <label className="label">Webhook Secret</label>
                <input
                  type="password"
                  value={suncoSettings.webhookSecret}
                  onChange={(e) => setSuncoSettings(prev => ({ ...prev, webhookSecret: e.target.value }))}
                  className="input"
                  placeholder="Seu webhook secret"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Secret para validação dos webhooks do Sunshine Conversations
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveSunco}
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar
                </button>
                <button
                  onClick={testSuncoConnection}
                  disabled={isLoading}
                  className="btn btn-outline"
                >
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
                  Testar Conexão
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* General Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Configurações Gerais</h3>
          <p className="card-description">Preferências gerais do sistema</p>
        </div>
        <div className="card-content space-y-4">
          <div>
            <label className="label">Fuso Horário</label>
            <select className="input">
              <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
              <option value="America/New_York">Nova York (GMT-5)</option>
              <option value="Europe/London">Londres (GMT+0)</option>
              <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
            </select>
          </div>

          <div>
            <label className="label">Idioma</label>
            <select className="input">
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="email-notifications"
              className="h-4 w-4 text-primary-600 border-secondary-300 rounded"
            />
            <label htmlFor="email-notifications" className="ml-2 text-sm text-secondary-600">
              Receber notificações por e-mail
            </label>
          </div>

          <div className="flex space-x-3">
            <button className="btn btn-primary">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
