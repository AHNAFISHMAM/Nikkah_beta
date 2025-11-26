/**
 * Production-safe logging utility
 * Only logs in development mode to avoid exposing errors in production
 */

const isDevelopment = import.meta.env.DEV

/**
 * Log error messages (only in development)
 */
export function logError(message: string, error?: unknown, context?: string) {
  if (!isDevelopment) return

  const contextMsg = context ? `[${context}] ` : ''
  const errorDetails = error instanceof Error ? error.message : String(error)
  
  console.error(`${contextMsg}${message}`, error || '')
  
  // In production, you could send to error tracking service here
  // Example: Sentry.captureException(error, { extra: { context, message } })
}

/**
 * Log warning messages (only in development)
 */
export function logWarning(message: string, context?: string) {
  if (!isDevelopment) return

  const contextMsg = context ? `[${context}] ` : ''
  console.warn(`${contextMsg}${message}`)
}

/**
 * Log info messages (only in development)
 */
export function logInfo(message: string, context?: string) {
  if (!isDevelopment) return

  const contextMsg = context ? `[${context}] ` : ''
  console.log(`${contextMsg}${message}`)
}

/**
 * Log debug messages (only in development)
 */
export function logDebug(message: string, data?: unknown, context?: string) {
  if (!isDevelopment) return

  const contextMsg = context ? `[${context}] ` : ''
  if (data !== undefined) {
    console.log(`${contextMsg}${message}`, data)
  } else {
    console.log(`${contextMsg}${message}`)
  }
}

