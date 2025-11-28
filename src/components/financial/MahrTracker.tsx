import { useState, useCallback, memo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useConfetti } from '../../hooks/useConfetti'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { CurrencyInput } from '../ui/currency-input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Skeleton } from '../ui/skeleton'
import { Progress } from '../ui/progress'
import { CheckCircle2, Clock, AlertCircle, DollarSign, Download, Calendar } from 'lucide-react'
import { exportToCSV, formatCurrency } from '../../lib/export'
import { validateAmount, validatePaidAmount } from '../../lib/validation'
import toast from 'react-hot-toast'
import { logError } from '../../lib/logger'

interface MahrData {
  amount: number
  status: 'Paid' | 'Pending' | 'Partial'
  amount_paid: number
  deferred_schedule: string | null
  notes: string | null
}

const STATUS_CONFIG = {
  Paid: {
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
    label: 'Paid',
  },
  Pending: {
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    label: 'Pending',
  },
  Partial: {
    icon: AlertCircle,
    color: 'text-islamic-gold',
    bgColor: 'bg-islamic-gold/10',
    label: 'Partial',
  },
} as const

function MahrTrackerComponent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { triggerStars } = useConfetti()
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: mahr, isLoading } = useQuery({
    queryKey: ['mahr', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('mahr')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        logError('Mahr query error', error, 'MahrTracker')
        throw error
      }
      return data as MahrData | null
    },
    enabled: !!user,
    retry: 1,
  })

  const [formData, setFormData] = useState<MahrData>({
    amount: 0,
    status: 'Pending',
    amount_paid: 0,
    deferred_schedule: null,
    notes: null,
  })

  // Validate form data
  const validateForm = useCallback((data: MahrData): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Validate mahr amount
    const amountValidation = validateAmount(data.amount, { 
      min: 0, 
      max: 100000000, 
      required: true, 
      fieldName: 'Mahr amount' 
    })
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error || 'Invalid mahr amount'
    }
    
    // Validate amount paid doesn't exceed total amount
    if (data.amount > 0) {
      const paidValidation = validatePaidAmount(data.amount_paid, data.amount, 'Amount paid')
      if (!paidValidation.isValid) {
        newErrors.amount_paid = paidValidation.error || 'Invalid amount paid'
      }
    } else {
      // If amount is 0, amount_paid should also be 0
      const paidValidation = validateAmount(data.amount_paid, { min: 0, max: 100000000, fieldName: 'Amount paid' })
      if (!paidValidation.isValid) {
        newErrors.amount_paid = paidValidation.error || 'Invalid amount paid'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [])

  const saveMutation = useMutation({
    mutationFn: async (data: MahrData) => {
      if (!user) throw new Error('Not authenticated')

      // Validate before saving
      if (!validateForm(data)) {
        throw new Error('Please fix validation errors before saving')
      }

      // Auto-update status based on amount_paid
      let status = data.status
      if (data.amount_paid >= data.amount) {
        status = 'Paid'
      } else if (data.amount_paid > 0) {
        status = 'Partial'
      } else {
        status = 'Pending'
      }

      const { error } = await supabase
        .from('mahr')
        .upsert({
          user_id: user.id,
          ...data,
          status,
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        logError('Mahr save error', error, 'MahrTracker')
        throw new Error(error.message || 'Failed to save mahr information. Please try again.')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mahr'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      triggerStars()
      setErrors({})
      toast.success('Mashallah! Mahr information saved!', { icon: '💍' })
      setIsEditing(false)
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to save mahr information. Please check your connection and try again.'
      toast.error(errorMessage, { duration: 5000 })
    },
  })

  const handleEdit = useCallback(() => {
    if (mahr) {
      setFormData({
        amount: mahr.amount || 0,
        status: mahr.status || 'Pending',
        amount_paid: mahr.amount_paid || 0,
        deferred_schedule: mahr.deferred_schedule || null,
        notes: mahr.notes || null,
      })
    }
    setErrors({})
    setIsEditing(true)
  }, [mahr])

  const handleSave = useCallback(() => {
    if (validateForm(formData)) {
      saveMutation.mutate(formData)
    } else {
      toast.error('Please fix the errors in the form before saving', { duration: 4000 })
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0]
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        document.getElementById(firstErrorField)?.focus()
      }
    }
  }, [saveMutation, formData, validateForm, errors])

  const handleAmountChange = useCallback((value: string) => {
    const numValue = Math.max(0, Number(value) || 0)
    setFormData(prev => ({ ...prev, amount: numValue }))
    
    // Clear errors when user starts typing
    if (errors.amount) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.amount
        return newErrors
      })
    }
  }, [errors])

  const handleAmountPaidChange = useCallback((value: string) => {
    const numValue = Math.max(0, Number(value) || 0)
    setFormData(prev => ({ ...prev, amount_paid: numValue }))
    
    // Clear errors when user starts typing
    if (errors.amount_paid) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.amount_paid
        return newErrors
      })
    }
  }, [errors])

  if (isLoading) {
    return <MahrSkeleton />
  }

  const amountRemaining = (mahr?.amount || 0) - (mahr?.amount_paid || 0)
  const progressPercentage = mahr && mahr.amount > 0
    ? (mahr.amount_paid / mahr.amount) * 100
    : 0

  const StatusIcon = mahr ? STATUS_CONFIG[mahr.status].icon : Clock
  const statusColor = mahr ? STATUS_CONFIG[mahr.status].color : 'text-muted-foreground'
  const statusBgColor = mahr ? STATUS_CONFIG[mahr.status].bgColor : 'bg-muted'

  return (
    <div className="space-y-6">
      {isEditing ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Mahr Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Track your mahr amount and payment status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="amount" className="text-xs sm:text-sm">Mahr Amount *</Label>
                <CurrencyInput
                  id="amount"
                  required
                  value={formData.amount || ''}
                  onChange={handleAmountChange}
                  className="h-11 sm:h-10 text-base sm:text-sm"
                  placeholder="Enter mahr amount"
                  error={!!errors.amount}
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? 'amount-error' : undefined}
                  aria-required="true"
                />
                {errors.amount && (
                  <p id="amount-error" className="text-xs text-error flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="amount_paid" className="text-xs sm:text-sm">Amount Paid</Label>
                <CurrencyInput
                  id="amount_paid"
                  value={formData.amount_paid || ''}
                  onChange={handleAmountPaidChange}
                  className="h-11 sm:h-10 text-base sm:text-sm"
                  placeholder="Enter amount paid so far"
                  error={!!errors.amount_paid}
                  aria-invalid={!!errors.amount_paid}
                  aria-describedby={errors.amount_paid ? 'amount_paid-error' : undefined}
                />
                {errors.amount_paid && (
                  <p id="amount_paid-error" className="text-xs text-error flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount_paid}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Status will update automatically based on amount paid
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="deferred_schedule" className="text-xs sm:text-sm">Payment Schedule</Label>
                <Textarea
                  id="deferred_schedule"
                  value={formData.deferred_schedule || ''}
                  onChange={(e) => setFormData({ ...formData, deferred_schedule: e.target.value || null })}
                  className="min-h-[80px] text-base sm:text-sm"
                  placeholder="e.g., $500 monthly for 12 months, or specific payment dates"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="notes" className="text-xs sm:text-sm">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                  className="min-h-[100px] text-base sm:text-sm"
                  placeholder="Add any additional notes or details about the mahr agreement"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending || Object.keys(errors).length > 0} 
              className="flex-1 sm:flex-none min-h-[44px]"
              aria-label="Save mahr information"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Mahr Information'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setErrors({})
                setIsEditing(false)
              }} 
              className="flex-1 sm:flex-none min-h-[44px]"
              aria-label="Cancel editing mahr information"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : !mahr ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't set up your mahr information yet. Add it to track payment status.
            </p>
            <Button onClick={handleEdit}>Add Mahr Information</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Status Card */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBgColor} w-fit`}>
                <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                <span className={`text-sm font-medium ${statusColor}`}>
                  {STATUS_CONFIG[mahr.status].label}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Mahr</p>
                  <p className="text-lg sm:text-xl font-bold">${mahr.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Amount Paid</p>
                  <p className="text-lg sm:text-xl font-bold text-success">
                    ${mahr.amount_paid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Remaining</p>
                  <p className="text-lg sm:text-xl font-bold text-warning">
                    ${amountRemaining.toLocaleString()}
                  </p>
                </div>
              </div>

              {mahr.amount > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress
                    value={progressPercentage}
                    variant={progressPercentage === 100 ? 'success' : 'islamic'}
                    size="lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          {mahr.deferred_schedule && (
            <Card>
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Payment Schedule
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Deferred payment plan and timeline
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{mahr.deferred_schedule}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {mahr.notes && (
            <Card>
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-sm whitespace-pre-wrap">{mahr.notes}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleEdit} className="w-full sm:w-auto min-h-[44px]">
              Edit Mahr Information
            </Button>
            {mahr && (
              <Button
                variant="outline"
                onClick={() => {
                  const exportData = [
                    {
                      'Total Mahr Amount': mahr.amount,
                      'Amount Paid': mahr.amount_paid,
                      'Amount Remaining': amountRemaining,
                      'Status': mahr.status,
                      'Progress': `${Math.round(progressPercentage)}%`,
                      'Payment Schedule': mahr.deferred_schedule || 'N/A',
                      'Notes': mahr.notes || 'N/A',
                      'Last Updated': new Date().toLocaleDateString(),
                    },
                  ]
                  exportToCSV(exportData, `mahr-${new Date().toISOString().split('T')[0]}`)
                  toast.success('Mahr information exported to CSV!')
                }}
                className="w-full sm:w-auto min-h-[44px]"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MahrSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export const MahrTracker = memo(MahrTrackerComponent)
