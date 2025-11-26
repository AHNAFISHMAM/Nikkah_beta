import * as React from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "../lib/utils"
import { Label } from "./ui/label"

interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  success?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  error,
  success,
  hint,
  required,
  children,
  className
}: FormFieldProps) {
  const id = htmlFor || React.useId()

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className={cn(
          error && "text-error",
          success && "text-success"
        )}
      >
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </Label>

      {/* Clone children to pass error/success props */}
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            id,
            error: !!error,
            success: !!success,
            'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
          } as React.HTMLAttributes<HTMLElement>)
        : children
      }

      {/* Error message */}
      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-error flex items-center gap-1.5 animate-fade-in"
          role="alert"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {/* Success message */}
      {success && !error && (
        <p
          className="text-sm text-success flex items-center gap-1.5 animate-fade-in"
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          {success}
        </p>
      )}

      {/* Hint text */}
      {hint && !error && !success && (
        <p
          id={`${id}-hint`}
          className="text-sm text-muted-foreground"
        >
          {hint}
        </p>
      )}
    </div>
  )
}

// Inline field group for checkboxes/radios
interface FormFieldGroupProps {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormFieldGroup({
  label,
  error,
  children,
  className
}: FormFieldGroupProps) {
  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className={cn(
        "text-sm font-medium",
        error && "text-error"
      )}>
        {label}
      </legend>
      <div className="space-y-2">
        {children}
      </div>
      {error && (
        <p className="text-sm text-error flex items-center gap-1.5" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </fieldset>
  )
}
