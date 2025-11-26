import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useProfile } from '../../hooks/useProfile'

/**
 * Authenticated Home Page
 * Shown when authenticated users visit "/" or click the logo
 * Uses DashboardLayout via Outlet pattern
 */
export default function AuthenticatedHome() {
  const { data: profile } = useProfile()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-6 sm:p-8 border border-primary/10 mt-4">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, {profile?.first_name || 'there'}!
          </h1>
          <p className="text-muted-foreground mb-4">
            Continue your marriage preparation journey
          </p>
          <Link to="/dashboard">
            <Button className="mt-4" variant="warm">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Sparkles className="absolute right-4 top-4 h-8 w-8 text-brand opacity-30" />
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/dashboard/checklist"
          className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
        >
          <h3 className="font-semibold mb-1">Readiness Checklist</h3>
          <p className="text-sm text-muted-foreground">
            Track your preparation progress
          </p>
        </Link>
        <Link
          to="/dashboard/financial"
          className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
        >
          <h3 className="font-semibold mb-1">Financial Planning</h3>
          <p className="text-sm text-muted-foreground">
            Budget and financial tools
          </p>
        </Link>
        <Link
          to="/dashboard/modules"
          className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
        >
          <h3 className="font-semibold mb-1">Learning Modules</h3>
          <p className="text-sm text-muted-foreground">
            Islamic marriage education
          </p>
        </Link>
      </div>
    </div>
  )
}

