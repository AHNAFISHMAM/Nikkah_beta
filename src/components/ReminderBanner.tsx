import { Link } from 'react-router-dom'
import { Bell, X } from 'lucide-react'

interface ReminderBannerProps {
  title: string
  description: string
  action?: { label: string; href: string }
  priority?: 'normal' | 'high'
  onDismiss?: () => void
}

export function ReminderBanner({
  title,
  description,
  action,
  priority = 'normal',
  onDismiss,
}: ReminderBannerProps) {
  const iconColor = priority === 'high'
    ? 'text-islamic-gold'
    : 'text-primary'

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-4 sm:p-6 border border-primary/10 animate-slide-up">
      <div className="flex items-start gap-3">
        <Bell className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          {action && (
            <Link
              to={action.href}
              className="text-sm text-primary font-medium hover:underline mt-2 inline-block cursor-pointer"
            >
              {action.label} →
            </Link>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -mt-1 -mr-1 cursor-pointer"
            aria-label="Dismiss reminder"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
