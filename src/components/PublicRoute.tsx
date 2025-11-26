import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from './LoadingSpinner'

interface PublicRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * PublicRoute - Redirects authenticated users away from public pages
 * Inverse of ProtectedRoute - use for login, signup, landing pages
 */
export function PublicRoute({ children, redirectTo = '/dashboard' }: PublicRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (user) {
    // Redirect authenticated users away from public pages
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

