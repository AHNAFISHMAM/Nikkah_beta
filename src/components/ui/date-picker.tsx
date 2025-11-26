import * as React from "react"
import { Calendar } from "lucide-react"
import { cn } from "../../lib/utils"

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean
  success?: boolean
  onDateChange?: (date: string) => void
  helperText?: string
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, success, onDateChange, onChange, helperText, id, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const [isFocused, setIsFocused] = React.useState(false)
    const generatedId = React.useId()
    const datePickerId = id || generatedId
    const helperId = helperText ? `${datePickerId}-helper` : undefined
    
    // Merge refs properly
    const combinedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    // Open date picker using showPicker() API with fallback
    const openDatePicker = React.useCallback(() => {
      if (!inputRef.current) return
      
      // Try to use modern showPicker() API first
      if ('showPicker' in inputRef.current && typeof (inputRef.current as any).showPicker === 'function') {
        try {
          ;(inputRef.current as any).showPicker()
          return
        } catch (err) {
          // showPicker() may fail if not triggered by user interaction
          // Fall through to focus fallback
        }
      }
      
      // Fallback: Focus the input (triggers native picker on mobile)
      inputRef.current.focus()
    }, [])

    // Handle calendar button click/touch
    const handleCalendarClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      openDatePicker()
    }, [openDatePicker])

    // Handle keyboard activation (Enter/Space)
    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openDatePicker()
      }
    }, [openDatePicker])

    // Track focus state for visual feedback
    const handleInputFocus = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }, [props])

    const handleInputBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }, [props])

    // Handle date change with callbacks
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onDateChange?.(e.target.value)
    }, [onChange, onDateChange])

    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            ref={combinedRef}
            id={datePickerId}
            type="date"
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pr-12 sm:pr-11 text-sm ring-offset-background",
              "appearance-none", // Remove default browser styling
              "cursor-pointer touch-manipulation select-none", // Mobile-optimized interactions
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
              className
            )}
            onChange={handleChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={helperId}
            {...props}
          />
          {/* Calendar icon button - WCAG 2.1 AA compliant 44x44px touch target */}
          <button
            ref={buttonRef}
            type="button"
            onClick={handleCalendarClick}
            onTouchStart={handleCalendarClick}
            onKeyDown={handleKeyDown}
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2",
              "flex items-center justify-center",
              // WCAG 2.1 AA: Minimum 44x44px touch target on mobile, 40px on desktop
              "h-11 w-11 sm:h-10 sm:w-10",
              "rounded-lg",
              "text-muted-foreground",
              "transition-all duration-200 ease-in-out",
              "touch-manipulation cursor-pointer select-none",
              // Hover state
              "hover:text-foreground hover:bg-accent/80",
              // Active/pressed state
              "active:text-foreground active:bg-accent active:scale-95",
              // Focus state - primary color ring
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "focus-visible:text-foreground focus-visible:bg-accent/80",
              // Visual feedback when input is focused
              isFocused && "text-foreground bg-accent/50",
              // Error state
              error && "text-error hover:text-error focus-visible:text-error",
              // Success state
              success && "text-success hover:text-success focus-visible:text-success",
              // Ensure button is above input
              "z-10"
            )}
            aria-label="Open calendar picker"
            tabIndex={0}
          >
            <Calendar 
              className="h-5 w-5 sm:h-4 sm:w-4 pointer-events-none" 
              aria-hidden="true"
              strokeWidth={2.5}
            />
          </button>
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
DatePicker.displayName = "DatePicker"

export { DatePicker }

