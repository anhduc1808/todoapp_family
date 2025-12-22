import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LanguageProvider } from './language/LanguageContext'
import { ThemeProvider } from './theme/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import JoinPage from './pages/JoinPage'
import DashboardPage from './pages/DashboardPage'
import FamilyTasksPage from './pages/FamilyTasksPage'
import TaskDetailPage from './pages/TaskDetailPage'
import MemberProgressPage from './pages/MemberProgressPage'
import MyTasksPage from './pages/MyTasksPage'
import TaskCategoriesPage from './pages/TaskCategoriesPage'
import SettingsPage from './pages/SettingsPage'
import './index.css'

const queryClient = new QueryClient()

function PrivateRoute({ children }) {
  const auth = useAuth()
  // Xử lý trường hợp useAuth() trả về null
  if (!auth) {
    return <Navigate to="/login" replace />
  }
  const { user, isLoading } = auth
  // Đợi cho đến khi auth check hoàn tất
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <BrowserRouter>
              <AuthProvider>
              <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/join"
              element={<JoinPage />}
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/families/:familyId/tasks"
              element={
                <PrivateRoute>
                  <FamilyTasksPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/tasks/:taskId"
              element={
                <PrivateRoute>
                  <TaskDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/families/:familyId/members/progress"
              element={
                <PrivateRoute>
                  <MemberProgressPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-tasks"
              element={
                <PrivateRoute>
                  <MyTasksPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/task-categories"
              element={
                <PrivateRoute>
                  <TaskCategoriesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
              </Routes>
              </AuthProvider>
            </BrowserRouter>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
