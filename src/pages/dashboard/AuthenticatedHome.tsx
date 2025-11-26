import { motion } from 'framer-motion'
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
      <motion.div
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-6 sm:p-8 border border-primary/10 mt-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0 }}
      >
        <div className="relative z-10">
          <motion.h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            Welcome back, {profile?.first_name || 'there'}!
          </motion.h1>
          <motion.p
            className="text-muted-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
          >
            Continue your marriage preparation journey
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/dashboard">
              <Button className="mt-4" variant="warm">
                Go to Dashboard
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.div>
              </Button>
            </Link>
          </motion.div>
        </div>
        <motion.div
          className="absolute right-4 top-4"
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 0.3, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-8 w-8 text-brand" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.8,
            },
          },
        }}
      >
        {[
          { href: '/dashboard/checklist', title: 'Readiness Checklist', desc: 'Track your preparation progress' },
          { href: '/dashboard/financial', title: 'Financial Planning', desc: 'Budget and financial tools' },
          { href: '/dashboard/modules', title: 'Learning Modules', desc: 'Islamic marriage education' },
        ].map((link, index) => (
          <motion.div
            key={link.href}
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={link.href}
              className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer block"
            >
              <h3 className="font-semibold mb-1">{link.title}</h3>
              <p className="text-sm text-muted-foreground">
                {link.desc}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

