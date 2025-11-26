import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      <motion.div
        className="absolute top-4 left-4"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <motion.div
                animate={{ x: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Home className="h-4 w-4 mr-1.5" />
              </motion.div>
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </motion.div>
      <SEO
        title={PAGE_SEO.login.title}
        description={PAGE_SEO.login.description}
        path="/login"
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1.5 sm:space-y-2 text-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
            >
              <Link 
                to="/" 
                className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2 sm:mb-3"
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            >
              <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
            >
              <CardDescription className="text-xs sm:text-sm">
                Sign in to continue your journey
              </CardDescription>
            </motion.div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    className="p-2.5 sm:p-3 bg-error/10 border border-error/30 rounded-lg"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-xs sm:text-sm text-error font-medium">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                className="space-y-1.5 sm:space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
              >
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
              </motion.div>
              <motion.div
                className="space-y-1.5 sm:space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
              >
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
              </motion.div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1, ease: 'easeOut' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button type="submit" className="w-full min-h-[48px]" loading={loading}>
                  Sign In
                </Button>
              </motion.div>
              <motion.p
                className="text-xs sm:text-sm text-center text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                Don't have an account?{' '}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-block"
                >
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </motion.span>
              </motion.p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
