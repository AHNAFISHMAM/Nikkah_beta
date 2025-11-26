import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  variant?: 'default' | 'islamic' | 'minimal'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4'
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
}

export function LoadingSpinner({
  size = 'md',
  text,
  variant = 'islamic',
  className
}: LoadingSpinnerProps) {
  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center gap-3 p-8', className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        className={cn(
          'rounded-full',
          sizeClasses[size],
          variant === 'islamic' && 'border-islamic-gold/20 border-t-islamic-gold',
          variant === 'default' && 'border-primary/20 border-t-primary',
          variant === 'minimal' && 'border-muted-foreground/20 border-t-muted-foreground'
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <motion.p
          className={cn(
            'text-muted-foreground',
            textSizeClasses[size]
          )}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  )
}

// Full page loading state
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" text={text} variant="islamic" />
    </div>
  )
}

// Inline loading state
export function InlineLoading({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" variant="minimal" className="p-0" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

export default LoadingSpinner
