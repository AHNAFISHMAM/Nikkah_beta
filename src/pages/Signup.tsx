import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PAGE_SEO } from '../lib/seo'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import toast from 'react-hot-toast'
import { Home } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate password strength
      if (password.length < 8) {
        setError('Password must be at least 8 characters long')
        toast.error('Password must be at least 8 characters long')
        setLoading(false)
        return
      }

      const { error, user } = await signUp(email, password)

      if (error) {
        setError(error.message)
        toast.error(error.message)
      } else if (user) {
        // Profile will be auto-created by trigger, user completes it in profile setup
        toast.success('Account created! Please complete your profile.')
        navigate('/profile-setup', { replace: true })
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background via-60% to-islamic-purple/10 p-4 sm:p-6 safe-area-inset-top safe-area-inset-bottom">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <Home className="h-4 w-4 mr-1.5" />
            Back to Home
          </Link>
        </Button>
      </div>
      <SEO
        title={PAGE_SEO.signup.title}
        description={PAGE_SEO.signup.description}
        path="/signup"
      />

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1.5 sm:space-y-2 text-center p-4 sm:p-6">
          <Link 
            to="/" 
            className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2 sm:mb-3 hover:opacity-80 transition-opacity"
            aria-label="Go to home page"
          >
            <img
              src="/logo.png"
              alt="NikahPrep Logo - Crescent Moon and Heart"
              className="w-full h-full object-contain"
              width={80}
              height={80}
              loading="eager"
              decoding="async"
              style={{ imageRendering: 'high-quality' }}
            />
          </Link>
          <CardTitle className="text-xl sm:text-2xl">Begin Your Journey</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Create an account to start preparing
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            {error && (
              <div className="p-2.5 sm:p-3 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-xs sm:text-sm text-destructive font-medium">
                  {error}
                </p>
              </div>
            )}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 sm:h-10 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 sm:h-10 text-base sm:text-sm"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Minimum 8 characters recommended
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <Button type="submit" className="w-full min-h-[48px]" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
            <p className="text-xs sm:text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
