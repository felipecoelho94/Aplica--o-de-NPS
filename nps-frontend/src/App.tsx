import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { SurveysPage } from './pages/SurveysPage'
import { CreateSurveyPage } from './pages/CreateSurveyPage'
import { EditSurveyPage } from './pages/EditSurveyPage'
import { SurveyResponsesPage } from './pages/SurveyResponsesPage'
import { SettingsPage } from './pages/SettingsPage'
import { LoadingSpinner } from './components/LoadingSpinner'

function App() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/surveys" element={<SurveysPage />} />
        <Route path="/surveys/create" element={<CreateSurveyPage />} />
        <Route path="/surveys/:id/edit" element={<EditSurveyPage />} />
        <Route path="/surveys/:id/responses" element={<SurveyResponsesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
