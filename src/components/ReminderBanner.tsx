import { motion, AnimatePresence } from 'framer-motion'
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
    <motion.div
      className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-4 sm:p-6 border border-primary/10"
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={priority === 'high' ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: priority === 'high' ? Infinity : 0, repeatDelay: 3 }}
        >
          <Bell className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <motion.p
            className="font-medium text-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {title}
          </motion.p>
          <motion.p
            className="text-sm text-muted-foreground mt-0.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {description}
          </motion.p>
          {action && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ x: 5 }}
            >
              <Link
                to={action.href}
                className="text-sm text-primary font-medium hover:underline mt-2 inline-block cursor-pointer"
              >
                {action.label} →
              </Link>
            </motion.div>
          )}
        </div>
        {onDismiss && (
          <motion.button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground p-1 -mt-1 -mr-1 cursor-pointer"
            aria-label="Dismiss reminder"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
