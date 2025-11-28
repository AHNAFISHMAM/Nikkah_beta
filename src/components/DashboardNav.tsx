import { memo, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

// Extracted styles for better performance (avoid inline object creation)
const activeStyle = {
  background: 'linear-gradient(90deg, #FBD07C, #F7F779)',
  color: '#8B5A2B',
  borderColor: '#FBD07C'
}

const activeMobileStyle = {
  background: 'linear-gradient(90deg, #FBD07C, #F7F779)',
  color: '#8B5A2B'
}

function DashboardNavComponent() {
  const location = useLocation()
  const pathname = location.pathname
  const { signOut } = useAuth()

  const handleSignOut = useCallback(async () => {
    await signOut()
  }, [signOut])

  const isProfileActive = pathname === '/dashboard/profile'

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className="hidden lg:flex flex-col gap-1"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/dashboard'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <div
              key={item.href}
              className="transform transition-transform duration-200 hover:translate-x-1"
            >
              <Link
                to={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200 min-h-[44px] cursor-pointer relative overflow-hidden',
                  isActive
                    ? 'font-medium border-l-2'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                style={isActive ? activeStyle : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
                )}
                <div className={cn(
                  'transition-transform duration-200',
                  isActive && 'scale-110 rotate-[5deg]'
                )}>
                  <Icon className={cn(
                    'h-5 w-5 transition-colors relative z-10',
                    isActive ? 'text-[#8B5A2B]' : 'group-hover:text-primary'
                  )} aria-hidden="true" />
                </div>
                <span className="relative z-10">{item.label}</span>
              </Link>
            </div>
          )
        })}

        <div className="mt-auto pt-4 border-t">
          <div className="transform transition-transform duration-200 hover:translate-x-1">
            <Link
              to="/dashboard/profile"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all hover:bg-accent min-h-[44px] cursor-pointer relative overflow-hidden',
                isProfileActive ? 'font-medium border-l-2' : 'text-muted-foreground'
              )}
              style={isProfileActive ? activeStyle : undefined}
              aria-current={isProfileActive ? 'page' : undefined}
            >
              {isProfileActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
              )}
              <div className={cn(
                'transition-transform duration-200',
                isProfileActive && 'scale-110 rotate-[5deg]'
              )}>
                <User className={cn(
                  'h-5 w-5 relative z-10',
                  isProfileActive && 'text-[#8B5A2B]'
                )} aria-hidden="true" />
              </div>
              <span className="relative z-10">Profile</span>
            </Link>
          </div>

          <div className="transform transition-transform duration-200 hover:translate-x-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground mt-2 min-h-[44px] group"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3 transition-transform duration-200 group-hover:-rotate-12" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Touch-optimized */}
      <nav
        className="lg:hidden flex flex-row justify-between sm:justify-center sm:gap-1 overflow-x-auto scrollbar-hide"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/dashboard'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <div
              key={item.href}
              className="transform transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
            >
              <Link
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 transition-all whitespace-nowrap shrink-0 min-w-[52px] sm:min-w-[64px] min-h-[52px] sm:min-h-[56px] touch-target-sm cursor-pointer relative overflow-hidden',
                  isActive
                    ? 'font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
                style={isActive ? activeMobileStyle : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl" />
                )}
                <div className={cn(
                  'relative z-10 transition-transform duration-200',
                  isActive && 'scale-115 rotate-[5deg]'
                )}>
                  <Icon className={cn(
                    'h-5 w-5 sm:h-[22px] sm:w-[22px] transition-colors',
                    isActive && 'text-[#8B5A2B]'
                  )} aria-hidden="true" />
                </div>
                <span className="text-[9px] sm:text-[10px] leading-tight text-center font-medium truncate max-w-[48px] sm:max-w-[56px] relative z-10">
                  {item.shortLabel}
                </span>
              </Link>
            </div>
          )
        })}
      </nav>
    </>
  )
}

export const DashboardNav = memo(DashboardNavComponent)
