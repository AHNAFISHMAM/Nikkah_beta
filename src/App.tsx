import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Helmet } from 'react-helmet-async'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/Home'))
const LoginPage = lazy(() => import('./pages/Login'))
const SignupPage = lazy(() => import('./pages/Signup'))
const ProfileSetupPage = lazy(() => import('./pages/ProfileSetup'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

// Dashboard pages
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const DashboardPage = lazy(() => import('./pages/dashboard/Dashboard'))
const AuthenticatedHomePage = lazy(() => import('./pages/dashboard/AuthenticatedHome'))
const ChecklistPage = lazy(() => import('./pages/dashboard/Checklist'))
const FinancialPage = lazy(() => import('./pages/dashboard/Financial'))
const ModulesPage = lazy(() => import('./pages/dashboard/Modules'))
const ModuleDetailPage = lazy(() => import('./pages/dashboard/ModuleDetail'))
const DiscussionsPage = lazy(() => import('./pages/dashboard/Discussions'))
const ResourcesPage = lazy(() => import('./pages/dashboard/Resources'))
const ProfilePage = lazy(() => import('./pages/dashboard/Profile'))

function App() {
  return (
    <ErrorBoundary>
      <Helmet>
        <title>NikahPrep - Islamic Marriage Preparation</title>
        <meta name="description" content="Comprehensive Islamic marriage preparation platform for engaged couples" />
      </Helmet>

      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <Routes>
          {/* Public routes - redirect authenticated users */}
          <Route path="/" element={
            <PublicRoute redirectTo="/home">
              <HomePage />
            </PublicRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile-setup" element={
            <ProtectedRoute>
              <ProfileSetupPage />
            </ProtectedRoute>
          } />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="checklist" element={<ChecklistPage />} />
            <Route path="financial" element={<FinancialPage />} />
            <Route path="modules" element={<ModulesPage />} />
            <Route path="modules/:id" element={<ModuleDetailPage />} />
            <Route path="discussions" element={<DiscussionsPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Authenticated home route - uses DashboardLayout */}
          <Route path="/home" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AuthenticatedHomePage />} />
          </Route>

          {/* 404 */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>

      <Toaster
        position="top-right"
        containerStyle={{
          top: '80px', // Below the header (header is ~56-64px + spacing)
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ErrorBoundary>
  )
}

export default App
