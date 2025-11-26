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
      <nav className="hidden lg:flex flex-col gap-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          // Dashboard should only match exactly, other routes can match children
          const isActive = item.href === '/dashboard'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200 min-h-[44px] cursor-pointer',
                isActive
                  ? 'font-medium border-l-2'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-1'
              )}
              style={isActive ? { 
                background: 'linear-gradient(90deg, #FBD07C, #F7F779)',
                color: '#8B5A2B',
                borderColor: '#FBD07C'
              } : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn(
                'h-5 w-5 transition-colors',
                isActive ? 'text-[#8B5A2B]' : 'group-hover:text-primary'
              )} aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}

        <div className="mt-auto pt-4 border-t">
          <Link
            to="/dashboard/profile"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all hover:bg-accent min-h-[44px] cursor-pointer',
              pathname === '/dashboard/profile' ? 'font-medium border-l-2' : 'text-muted-foreground'
            )}
            style={pathname === '/dashboard/profile' ? { 
              background: 'linear-gradient(90deg, #FBD07C, #F7F779)',
              color: '#8B5A2B',
              borderColor: '#FBD07C'
            } : undefined}
            aria-current={pathname === '/dashboard/profile' ? 'page' : undefined}
          >
            <User className={cn(
              'h-5 w-5',
              pathname === '/dashboard/profile' && 'text-[#8B5A2B]'
            )} aria-hidden="true" />
            Profile
          </Link>

          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground mt-2 min-h-[44px]"
            size="sm"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation - Touch-optimized */}
      <nav className="lg:hidden flex flex-row justify-between sm:justify-center sm:gap-1 overflow-x-auto scrollbar-hide" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          // Dashboard should only match exactly, other routes can match children
          const isActive = item.href === '/dashboard'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 transition-all whitespace-nowrap shrink-0 min-w-[52px] sm:min-w-[64px] min-h-[52px] sm:min-h-[56px] touch-target-sm active:scale-95 active:bg-accent/80 cursor-pointer',
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
              <Icon className={cn(
                'h-5 w-5 sm:h-[22px] sm:w-[22px] transition-colors',
                isActive && 'text-[#8B5A2B]'
              )} aria-hidden="true" />
              <span className="text-[9px] sm:text-[10px] leading-tight text-center font-medium truncate max-w-[48px] sm:max-w-[56px]">{item.shortLabel}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
