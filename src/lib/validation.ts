/**
 * Financial validation utilities
 * Best practices for form validation and data integrity
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate a monetary amount
 */
export function validateAmount(
  value: number | string,
  options?: {
    min?: number
    max?: number
    required?: boolean
    fieldName?: string
  }
): ValidationResult {
  const { min = 0, max = 1000000000, required = false, fieldName = 'Amount' } = options || {}
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (required && (numValue === undefined || numValue === null || isNaN(numValue))) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  if (isNaN(numValue) || numValue < min) {
    return { isValid: false, error: `${fieldName} must be at least $${min.toLocaleString()}` }
  }

  if (numValue > max) {
    return { isValid: false, error: `${fieldName} cannot exceed $${max.toLocaleString()}` }
  }

  return { isValid: true }
}

/**
 * Validate that paid amount doesn't exceed total amount
 */
export function validatePaidAmount(
  paid: number | string,
  total: number | string,
  fieldName: string = 'Amount paid'
): ValidationResult {
  const paidNum = typeof paid === 'string' ? parseFloat(paid) : paid
  const totalNum = typeof total === 'string' ? parseFloat(total) : total

  if (isNaN(paidNum) || isNaN(totalNum)) {
    return { isValid: false, error: 'Invalid amounts' }
  }

  if (paidNum < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` }
  }

  if (paidNum > totalNum) {
    return {
      isValid: false,
      error: `${fieldName} ($${paidNum.toLocaleString()}) cannot exceed total amount ($${totalNum.toLocaleString()})`,
    }
  }

  return { isValid: true }
}

/**
 * Validate that spent amount doesn't exceed planned amount (warning, not error)
 */
export function validateSpentAmount(
  spent: number | string,
  planned: number | string
): ValidationResult {
  const spentNum = typeof spent === 'string' ? parseFloat(spent) : spent
  const plannedNum = typeof planned === 'string' ? parseFloat(planned) : planned

  if (isNaN(spentNum) || isNaN(plannedNum)) {
    return { isValid: false, error: 'Invalid amounts' }
  }

  if (spentNum < 0) {
    return { isValid: false, error: 'Spent amount cannot be negative' }
  }

  // Over budget is a warning, not an error (user might want to track it)
  if (spentNum > plannedNum) {
    return {
      isValid: true, // Still valid, just over budget
      error: `Over budget by $${(spentNum - plannedNum).toLocaleString()}`,
    }
  }

  return { isValid: true }
}

/**
 * Format number as currency string for display
 */
export function formatCurrencyInput(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return ''
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return ''
  return numValue.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

/**
 * Parse currency string to number
 */
export function parseCurrencyInput(value: string): number {
  // Remove currency symbols and commas
  const cleaned = value.replace(/[$,]/g, '').trim()
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

