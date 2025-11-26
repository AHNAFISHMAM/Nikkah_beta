import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  success?: boolean
  helperText?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, success, helperText, children, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const selectId = id || React.useId()
    const helperId = helperText ? `${selectId}-helper` : undefined

    React.useEffect(() => {
      if (props.value !== undefined) {
        setHasValue(!!props.value && props.value !== '')
      }
    }, [props.value])

    return (
      <div className="relative w-full">
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background",
              "appearance-none", // Remove default browser arrow
              "cursor-pointer touch-manipulation", // Pointer cursor and better mobile touch
              "transition-all duration-200 ease-in-out", // Smooth transitions
              "placeholder:text-muted-foreground",
              // Default state
              "text-foreground",
              // Hover state
              "hover:border-primary/30",
              // Focus state - primary color ring
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary/50",
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Focused state (when open)
              isFocused && "ring-2 ring-primary ring-offset-2 border-primary/50",
              // Error state
              error && "border-error focus-visible:ring-error focus-visible:border-error",
              error && isFocused && "ring-error",
              // Success state
              success && "border-success focus-visible:ring-success focus-visible:border-success",
              success && isFocused && "ring-success",
              // Placeholder vs selected value distinction
              hasValue && "text-foreground",
              !hasValue && "text-muted-foreground",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={helperId}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          >
            {children}
          </select>
          {/* Custom dropdown arrow with rotation animation */}
          <div
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
              "flex items-center justify-center",
              "transition-transform duration-200 ease-in-out",
              isFocused && "rotate-180",
              // Color arrow based on state
              error && "text-error",
              success && "text-success",
              !error && !success && "text-muted-foreground"
            )}
            aria-hidden="true"
          >
            <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
          </div>
        </div>
        {/* Helper text with proper ARIA linking */}
        {helperText && (
          <p
            id={helperId}
            className={cn(
              "text-xs mt-1.5 transition-colors duration-200",
              error && "text-error",
              success && "text-success",
              !error && !success && "text-muted-foreground"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }

