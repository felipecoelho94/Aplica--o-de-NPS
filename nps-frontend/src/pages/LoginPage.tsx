import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

interface LoginForm {
  email: string
  password: string
}

interface SignupForm {
  email: string
  password: string
  name: string
  tenantName: string
}

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, signup } = useAuthStore()

  const loginForm = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const signupForm = useForm<SignupForm>({
    defaultValues: {
      email: '',
      password: '',
      name: '',
      tenantName: '',
    },
  })

  const handleLogin = async (data: LoginForm) => {
    try {
      setIsLoading(true)
      await login(data.email, data.password)
      toast.success('Login realizado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (data: SignupForm) => {
    try {
      setIsLoading(true)
      await signup(data)
      toast.success('Conta criada com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900">NPS SaaS</h1>
          <p className="mt-2 text-sm text-secondary-600">
            Sistema de Pesquisas NPS Integrado ao Zendesk
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md transition-colors ${
                isLogin
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md transition-colors ${
                !isLogin
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    {...loginForm.register('email', { required: 'Email é obrigatório' })}
                    type="email"
                    className="input pl-10"
                    placeholder="seu@email.com"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-danger-600 mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    {...loginForm.register('password', { required: 'Senha é obrigatória' })}
                    type={showPassword ? 'text' : 'password'}
                    className="input pl-10 pr-10"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-danger-600 mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-md w-full"
              >
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Entrar
              </button>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div>
                <label className="label">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    {...signupForm.register('name', { required: 'Nome é obrigatório' })}
                    type="text"
                    className="input pl-10"
                    placeholder="Seu nome"
                  />
                </div>
                {signupForm.formState.errors.name && (
                  <p className="text-sm text-danger-600 mt-1">
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    {...signupForm.register('email', { required: 'Email é obrigatório' })}
                    type="email"
                    className="input pl-10"
                    placeholder="seu@email.com"
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-danger-600 mt-1">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    {...signupForm.register('password', { 
                      required: 'Senha é obrigatória',
                      minLength: { value: 8, message: 'Senha deve ter pelo menos 8 caracteres' }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="input pl-10 pr-10"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-danger-600 mt-1">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Nome da Empresa</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    {...signupForm.register('tenantName', { required: 'Nome da empresa é obrigatório' })}
                    type="text"
                    className="input pl-10"
                    placeholder="Nome da sua empresa"
                  />
                </div>
                {signupForm.formState.errors.tenantName && (
                  <p className="text-sm text-danger-600 mt-1">
                    {signupForm.formState.errors.tenantName.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-md w-full"
              >
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Criar Conta
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
