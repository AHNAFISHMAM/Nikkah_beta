import { motion } from "framer-motion"
import { type LucideIcon } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div
        className="w-16 h-16 rounded-full bg-islamic-gold/10 flex items-center justify-center mb-4"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <Icon className="h-8 w-8 text-islamic-gold" />
      </motion.div>
      <motion.h3
        className="font-semibold text-lg mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      >
        {title}
      </motion.h3>
      <motion.p
        className="text-muted-foreground mb-6 max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
        >
          <Button onClick={action.onClick} variant="warm">
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

// Variant with custom children content
interface EmptyStateCustomProps {
  icon: LucideIcon
  title: string
  description: string
  children?: React.ReactNode
  className?: string
}

export function EmptyStateCustom({
  icon: Icon,
  title,
  description,
  children,
  className
}: EmptyStateCustomProps) {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div
        className="w-16 h-16 rounded-full bg-islamic-gold/10 flex items-center justify-center mb-4"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <Icon className="h-8 w-8 text-islamic-gold" />
      </motion.div>
      <motion.h3
        className="font-semibold text-lg mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      >
        {title}
      </motion.h3>
      <motion.p
        className="text-muted-foreground mb-6 max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      >
        {description}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
