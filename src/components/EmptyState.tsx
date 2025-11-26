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
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in",
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-islamic-gold/10 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-islamic-gold" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="warm">
          {action.label}
        </Button>
      )}
    </div>
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
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in",
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-islamic-gold/10 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-islamic-gold" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {children}
    </div>
  )
}
