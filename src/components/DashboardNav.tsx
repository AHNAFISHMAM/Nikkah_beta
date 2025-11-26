import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import {
  Home,
  CheckSquare,
  DollarSign,
  BookOpen,
  MessageSquare,
  Library,
  User,
  LogOut
} from 'lucide-react'
import { Button } from './ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: Home },
  { href: '/dashboard/checklist', label: 'Readiness Checklist', shortLabel: 'Checklist', icon: CheckSquare },
  { href: '/dashboard/financial', label: 'Financial Planning', shortLabel: 'Finance', icon: DollarSign },
  { href: '/dashboard/modules', label: 'Learning Modules', shortLabel: 'Learn', icon: BookOpen },
  { href: '/dashboard/discussions', label: 'Discussion Prompts', shortLabel: 'Discuss', icon: MessageSquare },
  { href: '/dashboard/resources', label: 'Resources', shortLabel: 'Resources', icon: Library },
]

export function DashboardNav() {
  const location = useLocation()
  const pathname = location.pathname
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        className="hidden lg:flex flex-col gap-1"
        aria-label="Main navigation"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08,
              delayChildren: 0.1,
            },
          },
        }}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon
          // Dashboard should only match exactly, other routes can match children
          const isActive = item.href === '/dashboard'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <motion.div
              key={item.href}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Link
                  to={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200 min-h-[44px] cursor-pointer relative overflow-hidden',
                    isActive
                      ? 'font-medium border-l-2'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                  style={isActive ? { 
                    background: 'linear-gradient(90deg, #FBD07C, #F7F779)',
                    color: '#8B5A2B',
                    borderColor: '#FBD07C'
                  } : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      />
                    )}
                  </AnimatePresence>
                  <motion.div
                    animate={isActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Icon className={cn(
                      'h-5 w-5 transition-colors relative z-10',
                      isActive ? 'text-[#8B5A2B]' : 'group-hover:text-primary'
                    )} aria-hidden="true" />
                  </motion.div>
                  <span className="relative z-10">{item.label}</span>
                </Link>
              </motion.div>
            </motion.div>
          )
        })}

        <motion.div
          className="mt-auto pt-4 border-t"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Link
              to="/dashboard/profile"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all hover:bg-accent min-h-[44px] cursor-pointer relative overflow-hidden',
                pathname === '/dashboard/profile' ? 'font-medium border-l-2' : 'text-muted-foreground'
              )}
              style={pathname === '/dashboard/profile' ? { 
                background: 'linear-gradient(90deg, #FBD07C, #F7F779)',
                color: '#8B5A2B',
                borderColor: '#FBD07C'
              } : undefined}
              aria-current={pathname === '/dashboard/profile' ? 'page' : undefined}
            >
              <AnimatePresence mode="wait">
                {pathname === '/dashboard/profile' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                )}
              </AnimatePresence>
              <motion.div
                animate={pathname === '/dashboard/profile' ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <User className={cn(
                  'h-5 w-5 relative z-10',
                  pathname === '/dashboard/profile' && 'text-[#8B5A2B]'
                )} aria-hidden="true" />
              </motion.div>
              <span className="relative z-10">Profile</span>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground mt-2 min-h-[44px]"
              size="sm"
              onClick={handleSignOut}
            >
              <motion.div
                whileHover={{ rotate: -15 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <LogOut className="h-5 w-5 mr-3" />
              </motion.div>
              Sign Out
            </Button>
          </motion.div>
        </motion.div>
      </motion.nav>

      {/* Mobile Navigation - Touch-optimized */}
      <motion.nav
        className="lg:hidden flex flex-row justify-between sm:justify-center sm:gap-1 overflow-x-auto scrollbar-hide"
        aria-label="Main navigation"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.1,
            },
          },
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          // Dashboard should only match exactly, other routes can match children
          const isActive = item.href === '/dashboard'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <motion.div
              key={item.href}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.8 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Link
                  to={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 transition-all whitespace-nowrap shrink-0 min-w-[52px] sm:min-w-[64px] min-h-[52px] sm:min-h-[56px] touch-target-sm cursor-pointer relative overflow-hidden',
                    isActive
                      ? 'font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                  style={isActive ? { 
                    background: 'linear-gradient(90deg, #FBD07C, #F7F779)',
                    color: '#8B5A2B'
                  } : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>
                  <motion.div
                    animate={isActive ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative z-10"
                  >
                    <Icon className={cn(
                      'h-5 w-5 sm:h-[22px] sm:w-[22px] transition-colors',
                      isActive && 'text-[#8B5A2B]'
                    )} aria-hidden="true" />
                  </motion.div>
                  <span className="text-[9px] sm:text-[10px] leading-tight text-center font-medium truncate max-w-[48px] sm:max-w-[56px] relative z-10">{item.shortLabel}</span>
                </Link>
              </motion.div>
            </motion.div>
          )
        })}
      </motion.nav>
    </>
  )
}
