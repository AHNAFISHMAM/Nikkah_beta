import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Bell, X } from 'lucide-react'
import { cn } from '../lib/utils'

interface ReminderBannerProps {
  title: string
  description: string
  action?: { label: string; href: string }
  priority?: 'normal' | 'high'
  onDismiss?: () => void
}

function ReminderBannerComponent({
  title,
  description,
  action,
  priority = 'normal',
  onDismiss,
}: ReminderBannerProps) {
  const isHighPriority = priority === 'high'

  return (
    <div
      className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-4 sm:p-6 border border-primary/10 transition-transform duration-200 hover:scale-[1.01]"
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          isHighPriority && 'animate-wiggle'
        )}>
          <Bell className={cn(
            'h-5 w-5 shrink-0 mt-0.5',
            isHighPriority ? 'text-islamic-gold' : 'text-primary'
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">
            {title}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {description}
          </p>
          {action && (
            <Link
              to={action.href}
              className="text-sm text-primary font-medium hover:underline mt-2 inline-block cursor-pointer transition-transform duration-200 hover:translate-x-1"
            >
              {action.label} →
            </Link>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground p-1 -mt-1 -mr-1 cursor-pointer transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-90"
            aria-label="Dismiss reminder"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export const ReminderBanner = memo(ReminderBannerComponent)
