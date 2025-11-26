import * as React from "react"
import { DollarSign } from "lucide-react"
import { cn } from "../../lib/utils"
import { Input, InputProps } from "./input"

export interface CurrencyInputProps
  extends Omit<InputProps, "type" | "value" | "onChange"> {
  value?: number | string
  onChange?: (value: string) => void
  onValueChange?: (value: number | null) => void
  allowNegative?: boolean
  decimalPlaces?: number
  formatOnBlur?: boolean
}

/**
 * CurrencyInput component with dollar sign prefix
 * Best practices:
 * - Dollar sign is always visible and not part of input value
 * - Supports decimal places (default 2 for currency)
 * - Formats with commas on blur for better readability
 * - Maintains accessibility with proper ARIA attributes
 * - Handles edge cases (empty, negative, invalid input)
 */
const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      className,
      value,
      onChange,
      onValueChange,
      allowNegative = false,
      decimalPlaces = 2,
      formatOnBlur = true,
      error,
      success,
      id,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [displayValue, setDisplayValue] = React.useState<string>("")
    const [isFocused, setIsFocused] = React.useState(false)
    const currencyInputId = id || React.useId()

    // Merge refs
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

    // Clean input: remove commas and spaces, keep decimal point
    const cleanInput = React.useCallback((input: string): string => {
      return input.replace(/[,\s]/g, "")
    }, [])

    // Format number with commas and proper decimal places
    const formatNumber = React.useCallback(
      (num: number | null): string => {
        if (num === null || isNaN(num)) return ""
        // Always show decimal places if the number has decimals, otherwise show as integer
        const hasDecimals = num % 1 !== 0
        return num.toLocaleString("en-US", {
          minimumFractionDigits: hasDecimals ? decimalPlaces : 0,
          maximumFractionDigits: decimalPlaces,
        })
      },
      [decimalPlaces]
    )

    // Initialize display value from prop
    React.useEffect(() => {
      if (value === undefined || value === null || value === "") {
        setDisplayValue("")
      } else {
        const numValue = typeof value === "string" ? parseFloat(value) : value
        if (!isNaN(numValue)) {
          // Preserve decimal places when initializing
          if (typeof value === "string" && value.includes(".")) {
            // Keep the string representation if it has decimals
            const cleaned = cleanInput(value)
            setDisplayValue(cleaned)
          } else {
            // Use number representation
            setDisplayValue(numValue.toString())
          }
        } else {
          setDisplayValue("")
        }
      }
    }, [value, cleanInput])

    // Validate and sanitize currency input
    // Best practice: Be permissive while typing, only block truly invalid characters
    const validateCurrencyInput = React.useCallback(
      (input: string): string | null => {
        const cleaned = cleanInput(input)

        // Allow empty
        if (cleaned === "") return ""

        // Remove leading negative if not allowed (keep the rest of the input)
        let processedInput = cleaned
        if (!allowNegative && cleaned.startsWith("-")) {
          processedInput = cleaned.replace(/^-+/, "")
          if (processedInput === "") return ""
        }

        // Allow negative sign only if allowed
        if (processedInput === "-" && allowNegative) return "-"

        // Pattern: optional negative, digits, optional decimal point and digits
        // Examples: "100", "100.", "100.5", "100.50", "-100.50"
        // This pattern allows partial input like "100." while typing
        const currencyPattern = allowNegative
          ? /^-?\d*\.?\d*$/
          : /^\d*\.?\d*$/

        if (!currencyPattern.test(processedInput)) {
          return null // Invalid input - blocks non-numeric characters
        }

        // Limit decimal places (but allow typing up to the limit)
        const decimalIndex = processedInput.indexOf(".")
        if (decimalIndex !== -1) {
          const decimalPart = processedInput.substring(decimalIndex + 1)
          if (decimalPart.length > decimalPlaces) {
            // Truncate to max decimal places - ensures numbers stay within limit
            return processedInput.substring(0, decimalIndex + 1 + decimalPlaces)
          }
        }

        // Return validated and cleaned input - numbers will persist
        return processedInput
      },
      [allowNegative, decimalPlaces, cleanInput]
    )

    // Parse input value to number
    const parseInput = React.useCallback((input: string): number | null => {
      const cleaned = cleanInput(input)
      if (cleaned === "" || cleaned === "-" || cleaned === ".") return null
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? null : parsed
    }, [cleanInput])

    // Handle input change - allow typing decimals in real-time
    // Best practice: Always preserve what user types, validate but don't block valid input
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value

        // Allow empty input
        if (inputValue === "") {
          setDisplayValue("")
          onChange?.("")
          onValueChange?.(null)
          return
        }

        // Validate and sanitize the input
        const validated = validateCurrencyInput(inputValue)

        // If validation fails, don't update - this blocks invalid characters
        // but preserves the previous valid state
        if (validated === null) {
          return // Keep previous displayValue, don't update
        }

        // CRITICAL: Always update display value with validated input
        // This ensures numbers stay visible when typed
        setDisplayValue(validated)

        // Parse to number for callbacks
        const parsed = parseInput(validated)

        if (parsed !== null) {
          // Valid number - call callbacks with both string and number
          onChange?.(parsed.toString())
          onValueChange?.(parsed)
        } else if (validated === "-" || validated === ".") {
          // Partial input (like just a decimal point or minus) - allow it while typing
          // Keep the display value so user can continue typing
          // Don't call onChange callbacks yet, wait for complete number
        } else {
          // Empty after validation
          onChange?.("")
          onValueChange?.(null)
        }
      },
      [onChange, onValueChange, validateCurrencyInput, parseInput]
    )

    // Handle blur - format with commas and ensure proper decimal places
    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false)
        props.onBlur?.(e)

        if (formatOnBlur) {
          const parsed = parseInput(displayValue)
          if (parsed !== null) {
            // Format with commas and proper decimal places
            const formatted = formatNumber(parsed)
            setDisplayValue(formatted)
            // Ensure callbacks have the final parsed value
            onChange?.(parsed.toString())
            onValueChange?.(parsed)
          } else if (displayValue === "." || displayValue === "-.") {
            // Clear incomplete decimal input
            setDisplayValue("")
            onChange?.("")
            onValueChange?.(null)
          }
        }
      },
      [displayValue, formatOnBlur, formatNumber, parseInput, onChange, onValueChange, props]
    )

    // Handle focus - remove commas for easier editing
    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true)
        props.onFocus?.(e)

        if (formatOnBlur) {
          const parsed = parseInput(displayValue)
          if (parsed !== null) {
            setDisplayValue(parsed.toString())
          }
        }
      },
      [displayValue, formatOnBlur, parseInput, props]
    )

    return (
      <div className="relative w-full">
        {/* Dollar sign prefix - always visible */}
        <div
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10",
            "flex items-center justify-center",
            "text-muted-foreground transition-colors duration-200",
            isFocused && "text-foreground",
            error && "text-error",
            success && "text-success"
          )}
          aria-hidden="true"
        >
          <DollarSign className="h-4 w-4" strokeWidth={2.5} />
        </div>

        {/* Input field with left padding for dollar sign */}
        {/* Best practice: Controlled input ensures numbers persist when typed */}
        <Input
          {...props}
          ref={combinedRef}
          id={currencyInputId}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "pl-9 pr-3", // Left padding for dollar sign, right padding for spacing
            className
          )}
          error={error}
          success={success}
          aria-label={props["aria-label"] || "Currency amount"}
          // Ensure input is always controlled - numbers will persist
          readOnly={false}
        />
      </div>
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }

