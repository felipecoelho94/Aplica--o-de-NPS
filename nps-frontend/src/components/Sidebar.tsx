import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export function Sidebar() {
  const { logout } = useAuthStore()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pesquisas', href: '/surveys', icon: FileText },
    { name: 'Criar Pesquisa', href: '/surveys/create', icon: Plus },
    { name: 'Relatórios', href: '/reports', icon: BarChart3 },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ]

  return (
    <div className="w-64 bg-white shadow-sm border-r border-secondary-200">
      <div className="p-6">
        <h1 className="text-xl font-bold text-secondary-900">NPS SaaS</h1>
        <p className="text-sm text-secondary-500 mt-1">Sistema de Pesquisas</p>
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 pb-4 mt-auto">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-secondary-600 rounded-md hover:bg-secondary-100 hover:text-secondary-900 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </button>
      </div>
    </div>
  )
}
