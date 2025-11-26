import * as React from "react"
import { cn } from "../../lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: "default" | "islamic" | "success" | "warning"
  showValue?: boolean
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    className,
    value = 0,
    max = 100,
    variant = "default",
    showValue = false,
    size = "md",
    animated = true,
    ...props
  }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    const isComplete = percentage >= 100

    const sizeClasses = {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-4"
    }

    const variantClasses = {
      default: "bg-gradient-to-r from-primary to-primary/80",
      islamic: "",
      success: "gradient-brand",
      warning: "bg-gradient-to-r from-islamic-gold to-islamic-gold/80"
    }

    return (
      <div className="w-full">
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`Progress: ${Math.round(percentage)}%`}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-secondary",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              variantClasses[variant],
              animated && "animate-fade-in",
              isComplete && "animate-pulse-glow"
            )}
            style={{ 
              width: `${percentage}%`,
              ...(variant === "islamic" && { background: "linear-gradient(90deg, #FBD07C, #F7F779)" })
            }}
          />
        </div>
        {showValue && (
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-muted-foreground">
              {isComplete ? "Complete!" : `${Math.round(percentage)}%`}
            </span>
            {!isComplete && (
              <span className="text-xs text-muted-foreground">
                {value} / {max}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
