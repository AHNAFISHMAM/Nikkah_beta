import { useState, useMemo, useCallback, memo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useConfetti } from '../../hooks/useConfetti'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { CurrencyInput } from '../ui/currency-input'
import { Label } from '../ui/label'
import { Skeleton } from '../ui/skeleton'
import { Progress } from '../ui/progress'
import { Target, Home, Shield, TrendingUp, CheckCircle2, Download, AlertCircle } from 'lucide-react'
import { exportToCSV, formatCurrency } from '../../lib/export'
import { validateAmount, validatePaidAmount } from '../../lib/validation'
import toast from 'react-hot-toast'
import { logError } from '../../lib/logger'

interface SavingsGoalsData {
  emergency_fund_goal: number
  emergency_fund_current: number
  house_goal: number
  house_current: number
  other_goal_name: string | null
  other_goal_amount: number
  other_goal_current: number
}

const GOAL_TYPES = [
  {
    key: 'emergency_fund',
    label: 'Emergency Fund',
    icon: Shield,
    description: '3-6 months of expenses',
    color: 'text-success',
    bgColor: 'bg-success/10',
    goalKey: 'emergency_fund_goal' as const,
    currentKey: 'emergency_fund_current' as const,
  },
  {
    key: 'house',
    label: 'House Down Payment',
    icon: Home,
    description: 'Save for your future home',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    goalKey: 'house_goal' as const,
    currentKey: 'house_current' as const,
  },
] as const

function SavingsGoalsComponent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { triggerStars } = useConfetti()
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: savingsGoals, isLoading } = useQuery({
    queryKey: ['savings-goals', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        logError('Savings goals query error', error, 'SavingsGoals')
        throw error
      }
      return data as SavingsGoalsData | null
    },
    enabled: !!user,
    retry: 1,
  })

  const [formData, setFormData] = useState<SavingsGoalsData>({
    emergency_fund_goal: 0,
    emergency_fund_current: 0,
    house_goal: 0,
    house_current: 0,
    other_goal_name: null,
    other_goal_amount: 0,
    other_goal_current: 0,
  })

  // Validate form data
  const validateForm = useCallback((data: SavingsGoalsData): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Validate emergency fund
    if (data.emergency_fund_goal > 0) {
      const goalValidation = validateAmount(data.emergency_fund_goal, { 
        min: 0, 
        max: 100000000, 
        fieldName: 'Emergency fund goal' 
      })
      if (!goalValidation.isValid) {
        newErrors.emergency_fund_goal = goalValidation.error || 'Invalid amount'
      }
      
      if (data.emergency_fund_goal > 0) {
        const currentValidation = validatePaidAmount(
          data.emergency_fund_current, 
          data.emergency_fund_goal, 
          'Emergency fund current'
        )
        if (!currentValidation.isValid) {
          newErrors.emergency_fund_current = currentValidation.error || 'Invalid amount'
        }
      }
    }
    
    // Validate house down payment
    if (data.house_goal > 0) {
      const goalValidation = validateAmount(data.house_goal, { 
        min: 0, 
        max: 100000000, 
        fieldName: 'House down payment goal' 
      })
      if (!goalValidation.isValid) {
        newErrors.house_goal = goalValidation.error || 'Invalid amount'
      }
      
      if (data.house_goal > 0) {
        const currentValidation = validatePaidAmount(
          data.house_current, 
          data.house_goal, 
          'House down payment current'
        )
        if (!currentValidation.isValid) {
          newErrors.house_current = currentValidation.error || 'Invalid amount'
        }
      }
    }
    
    // Validate other goal
    if (data.other_goal_name && data.other_goal_amount > 0) {
      const goalValidation = validateAmount(data.other_goal_amount, { 
        min: 0, 
        max: 100000000, 
        fieldName: 'Other goal amount' 
      })
      if (!goalValidation.isValid) {
        newErrors.other_goal_amount = goalValidation.error || 'Invalid amount'
      }
      
      if (data.other_goal_amount > 0) {
        const currentValidation = validatePaidAmount(
          data.other_goal_current, 
          data.other_goal_amount, 
          'Other goal current'
        )
        if (!currentValidation.isValid) {
          newErrors.other_goal_current = currentValidation.error || 'Invalid amount'
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [])

  const saveMutation = useMutation({
    mutationFn: async (data: SavingsGoalsData) => {
      if (!user) throw new Error('Not authenticated')

      // Validate before saving
      if (!validateForm(data)) {
        throw new Error('Please fix validation errors before saving')
      }

      const { error } = await supabase
        .from('savings_goals')
        .upsert({
          user_id: user.id,
          ...data,
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        logError('Savings goals save error', error, 'SavingsGoals')
        throw new Error(error.message || 'Failed to save savings goals. Please try again.')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      triggerStars()
      setErrors({})
      toast.success('Mashallah! Savings goals saved!', { icon: '🎯' })
      setIsEditing(false)
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to save savings goals. Please check your connection and try again.'
      toast.error(errorMessage, { duration: 5000 })
    },
  })

  const handleEdit = useCallback(() => {
    if (savingsGoals) {
      setFormData({
        emergency_fund_goal: savingsGoals.emergency_fund_goal || 0,
        emergency_fund_current: savingsGoals.emergency_fund_current || 0,
        house_goal: savingsGoals.house_goal || 0,
        house_current: savingsGoals.house_current || 0,
        other_goal_name: savingsGoals.other_goal_name || null,
        other_goal_amount: savingsGoals.other_goal_amount || 0,
        other_goal_current: savingsGoals.other_goal_current || 0,
      })
    }
    setErrors({})
    setIsEditing(true)
  }, [savingsGoals])

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

  const handleInputChange = useCallback((key: keyof SavingsGoalsData, value: string | number | null) => {
    if (typeof value === 'string' && (key === 'emergency_fund_goal' || key === 'emergency_fund_current' || 
        key === 'house_goal' || key === 'house_current' || key === 'other_goal_amount' || key === 'other_goal_current')) {
      const numValue = Math.max(0, Number(value) || 0) // Prevent negative values
      setFormData(prev => ({ ...prev, [key]: numValue }))
    } else {
      setFormData(prev => ({ ...prev, [key]: value }))
    }
    
    // Clear error for this field when user starts typing
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }, [errors])

  // Calculate progress for each goal - MUST be before early return (Rules of Hooks)
  const goals = useMemo(() => {
    if (!savingsGoals) return []
    const goalList = []

    // Emergency Fund
    if (savingsGoals.emergency_fund_goal > 0) {
      const progress = (savingsGoals.emergency_fund_current / savingsGoals.emergency_fund_goal) * 100
      goalList.push({
        ...GOAL_TYPES[0],
        goal: savingsGoals.emergency_fund_goal,
        current: savingsGoals.emergency_fund_current,
        remaining: savingsGoals.emergency_fund_goal - savingsGoals.emergency_fund_current,
        progress: Math.min(100, progress),
        isComplete: savingsGoals.emergency_fund_current >= savingsGoals.emergency_fund_goal,
      })
    }

    // House Down Payment
    if (savingsGoals.house_goal > 0) {
      const progress = (savingsGoals.house_current / savingsGoals.house_goal) * 100
      goalList.push({
        ...GOAL_TYPES[1],
        goal: savingsGoals.house_goal,
        current: savingsGoals.house_current,
        remaining: savingsGoals.house_goal - savingsGoals.house_current,
        progress: Math.min(100, progress),
        isComplete: savingsGoals.house_current >= savingsGoals.house_goal,
      })
    }

    // Other Goal
    if (savingsGoals.other_goal_name && savingsGoals.other_goal_amount > 0) {
      const progress = (savingsGoals.other_goal_current / savingsGoals.other_goal_amount) * 100
      goalList.push({
        key: 'other',
        label: savingsGoals.other_goal_name,
        icon: Target,
        description: 'Custom savings goal',
        color: 'text-islamic-gold',
        bgColor: 'bg-islamic-gold/10',
        goal: savingsGoals.other_goal_amount,
        current: savingsGoals.other_goal_current,
        remaining: savingsGoals.other_goal_amount - savingsGoals.other_goal_current,
        progress: Math.min(100, progress),
        isComplete: savingsGoals.other_goal_current >= savingsGoals.other_goal_amount,
      })
    }

    return goalList
  }, [savingsGoals])

  if (isLoading) {
    return <SavingsGoalsSkeleton />
  }

  return (
    <div className="space-y-6">
      {isEditing ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Savings Goals</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Set and track your savings goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6 pt-0">
              {/* Emergency Fund */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Emergency Fund</h3>
                    <p className="text-xs text-muted-foreground">Recommended: 3-6 months of expenses</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="emergency_fund_goal" className="text-xs sm:text-sm">Goal Amount</Label>
                    <CurrencyInput
                      id="emergency_fund_goal"
                      value={formData.emergency_fund_goal || ''}
                      onChange={(value) => handleInputChange('emergency_fund_goal', value)}
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="0"
                      error={!!errors.emergency_fund_goal}
                      aria-invalid={!!errors.emergency_fund_goal}
                      aria-describedby={errors.emergency_fund_goal ? 'emergency_fund_goal-error' : undefined}
                    />
                    {errors.emergency_fund_goal && (
                      <p id="emergency_fund_goal-error" className="text-xs text-error flex items-center gap-1" role="alert">
                        <AlertCircle className="h-3 w-3" />
                        {errors.emergency_fund_goal}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="emergency_fund_current" className="text-xs sm:text-sm">Current Amount</Label>
                    <CurrencyInput
                      id="emergency_fund_current"
                      value={formData.emergency_fund_current || ''}
                      onChange={(value) => handleInputChange('emergency_fund_current', value)}
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="0"
                      error={!!errors.emergency_fund_current}
                      aria-invalid={!!errors.emergency_fund_current}
                      aria-describedby={errors.emergency_fund_current ? 'emergency_fund_current-error' : undefined}
                    />
                    {errors.emergency_fund_current && (
                      <p id="emergency_fund_current-error" className="text-xs text-error flex items-center gap-1" role="alert">
                        <AlertCircle className="h-3 w-3" />
                        {errors.emergency_fund_current}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* House Down Payment */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">House Down Payment</h3>
                    <p className="text-xs text-muted-foreground">Save for your future home</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="house_goal" className="text-xs sm:text-sm">Goal Amount</Label>
                    <CurrencyInput
                      id="house_goal"
                      value={formData.house_goal || ''}
                      onChange={(value) => handleInputChange('house_goal', value)}
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="0"
                      error={!!errors.house_goal}
                      aria-invalid={!!errors.house_goal}
                      aria-describedby={errors.house_goal ? 'house_goal-error' : undefined}
                    />
                    {errors.house_goal && (
                      <p id="house_goal-error" className="text-xs text-error flex items-center gap-1" role="alert">
                        <AlertCircle className="h-3 w-3" />
                        {errors.house_goal}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="house_current" className="text-xs sm:text-sm">Current Amount</Label>
                    <CurrencyInput
                      id="house_current"
                      value={formData.house_current || ''}
                      onChange={(value) => handleInputChange('house_current', value)}
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="0"
                      error={!!errors.house_current}
                      aria-invalid={!!errors.house_current}
                      aria-describedby={errors.house_current ? 'house_current-error' : undefined}
                    />
                    {errors.house_current && (
                      <p id="house_current-error" className="text-xs text-error flex items-center gap-1" role="alert">
                        <AlertCircle className="h-3 w-3" />
                        {errors.house_current}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Other Goal */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-islamic-gold" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Other Savings Goal</h3>
                    <p className="text-xs text-muted-foreground">Custom savings goal</p>
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="other_goal_name" className="text-xs sm:text-sm">Goal Name</Label>
                  <Input
                    id="other_goal_name"
                    type="text"
                    value={formData.other_goal_name || ''}
                    onChange={(e) => setFormData({ ...formData, other_goal_name: e.target.value || null })}
                    className="h-11 sm:h-10 text-base sm:text-sm"
                    placeholder="e.g., Hajj fund, Education, etc."
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="other_goal_amount" className="text-xs sm:text-sm">Goal Amount</Label>
                    <CurrencyInput
                      id="other_goal_amount"
                      value={formData.other_goal_amount || ''}
                      onChange={(value) => handleInputChange('other_goal_amount', value)}
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="0"
                      error={!!errors.other_goal_amount}
                      aria-invalid={!!errors.other_goal_amount}
                      aria-describedby={errors.other_goal_amount ? 'other_goal_amount-error' : undefined}
                    />
                    {errors.other_goal_amount && (
                      <p id="other_goal_amount-error" className="text-xs text-error flex items-center gap-1" role="alert">
                        <AlertCircle className="h-3 w-3" />
                        {errors.other_goal_amount}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="other_goal_current" className="text-xs sm:text-sm">Current Amount</Label>
                    <CurrencyInput
                      id="other_goal_current"
                      value={formData.other_goal_current || ''}
                      onChange={(value) => handleInputChange('other_goal_current', value)}
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="0"
                      error={!!errors.other_goal_current}
                      aria-invalid={!!errors.other_goal_current}
                      aria-describedby={errors.other_goal_current ? 'other_goal_current-error' : undefined}
                    />
                    {errors.other_goal_current && (
                      <p id="other_goal_current-error" className="text-xs text-error flex items-center gap-1" role="alert">
                        <AlertCircle className="h-3 w-3" />
                        {errors.other_goal_current}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending || Object.keys(errors).length > 0} 
              className="flex-1 sm:flex-none min-h-[44px]"
              aria-label="Save savings goals"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Savings Goals'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setErrors({})
                setIsEditing(false)
              }} 
              className="flex-1 sm:flex-none min-h-[44px]"
              aria-label="Cancel editing savings goals"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : !savingsGoals || goals.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't set up any savings goals yet. Create goals to track your progress.
            </p>
            <Button onClick={handleEdit}>Create Savings Goals</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const Icon = goal.icon
            return (
              <Card key={goal.key} className={goal.isComplete ? 'border-success' : ''}>
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${goal.bgColor}`}>
                        <Icon className={`h-5 w-5 ${goal.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg">{goal.label}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">{goal.description}</CardDescription>
                      </div>
                    </div>
                    {goal.isComplete && (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Goal</p>
                      <p className="text-lg sm:text-xl font-bold">${goal.goal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Saved</p>
                      <p className="text-lg sm:text-xl font-bold text-success">
                        ${goal.current.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Remaining</p>
                      <p className="text-lg sm:text-xl font-bold text-warning">
                        ${goal.remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(goal.progress)}%</span>
                    </div>
                    <Progress
                      value={goal.progress}
                      variant={goal.isComplete ? 'success' : 'islamic'}
                      size="lg"
                    />
                    {goal.isComplete && (
                      <p className="text-xs text-success font-medium mt-1">
                        🎉 Goal achieved! Mashallah!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleEdit} className="w-full sm:w-auto min-h-[44px]">
              Edit Savings Goals
            </Button>
            {savingsGoals && goals.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  const exportData = goals.map(goal => ({
                    'Goal Name': goal.label,
                    'Goal Amount': goal.goal,
                    'Current Amount': goal.current,
                    'Remaining': goal.remaining,
                    'Progress': `${Math.round(goal.progress)}%`,
                    'Status': goal.isComplete ? 'Complete' : 'In Progress',
                  }))
                  exportToCSV(exportData, `savings-goals-${new Date().toISOString().split('T')[0]}`)
                  toast.success('Savings goals exported to CSV!')
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

function SavingsGoalsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export const SavingsGoals = memo(SavingsGoalsComponent)
