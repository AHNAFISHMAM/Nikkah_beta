import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { PAGE_SEO } from '../lib/seo'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import toast from 'react-hot-toast'
import { Home } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError(error.message)
        toast.error(error.message)
      } else {
        toast.success('Welcome back!')
        navigate(from, { replace: true })
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
        title={PAGE_SEO.login.title}
        description={PAGE_SEO.login.description}
        path="/login"
      />

      <Card className="w-full max-w-md animate-scale-in">
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
          <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Sign in to continue your journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            {error && (
              <div className="p-2.5 sm:p-3 bg-error/10 border border-error/30 rounded-lg animate-fade-in">
                <p className="text-xs sm:text-sm text-error font-medium">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 sm:h-10 text-base sm:text-sm"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <Button type="submit" className="w-full min-h-[48px]" loading={loading}>
              Sign In
            </Button>
            <p className="text-xs sm:text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
