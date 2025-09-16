import { Bell, Search, User } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export function Header() {
  const { user } = useAuthStore()

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar pesquisas..."
                className="input pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors">
              <Bell className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                <p className="text-xs text-secondary-500">{user?.email}</p>
              </div>
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
