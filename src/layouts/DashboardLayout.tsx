import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Link, Outlet } from 'react-router-dom'
import { DashboardNav } from '../components/DashboardNav'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useProfile } from '../hooks/useProfile'

export default function DashboardLayout() {
  const { data: profile } = useProfile()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background via-70% to-islamic-purple/5">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-top"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="container flex h-14 sm:h-16 items-center justify-between gap-2 px-3 sm:px-4 lg:px-6">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/home" className="flex items-center gap-1.5 sm:gap-2 touch-target-sm shrink-0" aria-label="Go to home page">
              <motion.img
                src="/logo.png"
                alt="NikahPrep Logo - Crescent Moon and Heart"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                width={40}
                height={40}
                loading="eager"
                decoding="async"
                style={{ imageRendering: 'high-quality' }}
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              />
              <span className="text-lg sm:text-xl font-bold">NikahPrep</span>
            </Link>
          </motion.div>
          <motion.div
            className="text-xs sm:text-sm text-muted-foreground text-right truncate max-w-[140px] sm:max-w-none"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            <span className="hidden xs:inline">As-salamu alaykum, </span>
            <span className="xs:hidden">Salaam, </span>
            {profile?.first_name || 'User'}
          </motion.div>
        </div>
      </motion.header>

      <div className="container flex gap-3 sm:gap-4 lg:gap-6 py-4 sm:py-6 pb-24 sm:pb-28 lg:pb-6 px-3 sm:px-4 lg:px-6">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 space-y-4">
            <DashboardNav />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Mobile Navigation - Fixed at bottom */}
      <motion.nav
        className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-50 safe-area-inset-bottom safe-area-inset-left safe-area-inset-right"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
      >
        <div className="px-2 py-1.5 sm:p-2">
          <DashboardNav />
        </div>
      </motion.nav>
    </div>
  )
}
