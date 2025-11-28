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
import { DollarSign, TrendingUp, AlertCircle, Download, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { exportToCSV, formatCurrency } from '../../lib/export'
import { validateAmount, validateSpentAmount } from '../../lib/validation'
import toast from 'react-hot-toast'
import { logError } from '../../lib/logger'

interface WeddingBudgetData {
  venue_planned: number
  venue_spent: number
  catering_planned: number
  catering_spent: number
  photography_planned: number
  photography_spent: number
  clothing_planned: number
  clothing_spent: number
  decor_planned: number
  decor_spent: number
  invitations_planned: number
  invitations_spent: number
  other_planned: number
  other_spent: number
}

const WEDDING_CATEGORIES = [
  { key: 'venue', label: 'Venue', icon: '🏛️' },
  { key: 'catering', label: 'Catering', icon: '🍽️' },
  { key: 'photography', label: 'Photography', icon: '📸' },
  { key: 'clothing', label: 'Clothing/Jewelry', icon: '👗' },
  { key: 'decor', label: 'Decorations', icon: '🎨' },
  { key: 'invitations', label: 'Invitations', icon: '💌' },
  { key: 'other', label: 'Other Expenses', icon: '📋' },
] as const

function WeddingBudgetComponent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { triggerStars } = useConfetti()
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: weddingBudget, isLoading } = useQuery({
    queryKey: ['wedding-budget', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('wedding_budget')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        logError('Wedding budget query error', error, 'WeddingBudget')
        throw error
      }
      return data as WeddingBudgetData | null
    },
    enabled: !!user,
    retry: 1,
  })

  const [formData, setFormData] = useState<WeddingBudgetData>({
    venue_planned: 0,
    venue_spent: 0,
    catering_planned: 0,
    catering_spent: 0,
    photography_planned: 0,
    photography_spent: 0,
    clothing_planned: 0,
    clothing_spent: 0,
    decor_planned: 0,
    decor_spent: 0,
    invitations_planned: 0,
    invitations_spent: 0,
    other_planned: 0,
    other_spent: 0,
  })

  // Validate form data
  const validateForm = useCallback((data: WeddingBudgetData): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Validate all planned and spent amounts
    WEDDING_CATEGORIES.forEach(category => {
      const plannedKey = `${category.key}_planned` as keyof WeddingBudgetData
      const spentKey = `${category.key}_spent` as keyof WeddingBudgetData
      
      const planned = Number(data[plannedKey]) || 0
      const spent = Number(data[spentKey]) || 0
      
      // Validate planned amount
      const plannedValidation = validateAmount(planned, { 
        min: 0, 
        max: 10000000, 
        fieldName: `${category.label} planned` 
      })
      if (!plannedValidation.isValid) {
        newErrors[plannedKey] = plannedValidation.error || 'Invalid amount'
      }
      
      // Validate spent amount
      const spentValidation = validateAmount(spent, { 
        min: 0, 
        max: 10000000, 
        fieldName: `${category.label} spent` 
      })
      if (!spentValidation.isValid) {
        newErrors[spentKey] = spentValidation.error || 'Invalid amount'
      }
      
      // Warn if spent exceeds planned (but don't block save)
      if (planned > 0 && spent > planned) {
        // This is a warning, not an error - user might want to track over-budget spending
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [])

  const saveMutation = useMutation({
    mutationFn: async (data: WeddingBudgetData) => {
      if (!user) throw new Error('Not authenticated')

      // Validate before saving
      if (!validateForm(data)) {
        throw new Error('Please fix validation errors before saving')
      }

      const { error } = await supabase
        .from('wedding_budget')
        .upsert({
          user_id: user.id,
          ...data,
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        logError('Wedding budget save error', error, 'WeddingBudget')
        throw new Error(error.message || 'Failed to save wedding budget. Please try again.')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding-budget'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      triggerStars()
      setErrors({})
      toast.success('Mashallah! Wedding budget saved!', { icon: '💒' })
      setIsEditing(false)
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to save wedding budget. Please check your connection and try again.'
      toast.error(errorMessage, { duration: 5000 })
    },
  })

  const totalPlanned = useMemo(() => {
    if (!weddingBudget) return 0
    return Object.entries(weddingBudget).reduce((sum, [key, value]) => {
      if (key.endsWith('_planned')) {
        return sum + (Number(value) || 0)
      }
      return sum
    }, 0)
  }, [weddingBudget])

  const totalSpent = useMemo(() => {
    if (!weddingBudget) return 0
    return Object.entries(weddingBudget).reduce((sum, [key, value]) => {
      if (key.endsWith('_spent')) {
        return sum + (Number(value) || 0)
      }
      return sum
    }, 0)
  }, [weddingBudget])

  const remaining = totalPlanned - totalSpent
  const percentageSpent = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0

  const handleEdit = useCallback(() => {
    if (weddingBudget) {
      setFormData({
        venue_planned: weddingBudget.venue_planned || 0,
        venue_spent: weddingBudget.venue_spent || 0,
        catering_planned: weddingBudget.catering_planned || 0,
        catering_spent: weddingBudget.catering_spent || 0,
        photography_planned: weddingBudget.photography_planned || 0,
        photography_spent: weddingBudget.photography_spent || 0,
        clothing_planned: weddingBudget.clothing_planned || 0,
        clothing_spent: weddingBudget.clothing_spent || 0,
        decor_planned: weddingBudget.decor_planned || 0,
        decor_spent: weddingBudget.decor_spent || 0,
        invitations_planned: weddingBudget.invitations_planned || 0,
        invitations_spent: weddingBudget.invitations_spent || 0,
        other_planned: weddingBudget.other_planned || 0,
        other_spent: weddingBudget.other_spent || 0,
      })
    }
    setErrors({})
    setIsEditing(true)
  }, [weddingBudget])

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

  const handleInputChange = useCallback((key: keyof WeddingBudgetData, value: string) => {
    const numValue = Math.max(0, Number(value) || 0) // Prevent negative values
    setFormData(prev => ({ ...prev, [key]: numValue }))
    
    // Clear error for this field when user starts typing
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }, [errors])

  if (isLoading) {
    return <WeddingBudgetSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">
              ${totalPlanned.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Planned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-warning">
              ${totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Spent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <AlertCircle className={`h-4 w-4 ${remaining >= 0 ? 'text-success' : 'text-error'}`} />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-success' : 'text-error'}`}>
              ${remaining.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {remaining >= 0 ? 'On track' : 'Over budget'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      {totalPlanned > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Overall Budget Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget Usage</span>
              <span className="font-medium">{Math.round(percentageSpent)}%</span>
            </div>
            <Progress
              value={percentageSpent}
              variant={percentageSpent > 100 ? 'warning' : 'islamic'}
              size="lg"
            />
            {percentageSpent > 100 && (
              <p className="text-xs text-error mt-1">
                You're over budget by ${Math.abs(remaining).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Wedding Budget Categories</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Enter planned and spent amounts for each category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6 pt-0">
              {WEDDING_CATEGORIES.map(category => {
                const plannedKey = `${category.key}_planned` as keyof WeddingBudgetData
                const spentKey = `${category.key}_spent` as keyof WeddingBudgetData
                return (
                  <div key={category.key} className="space-y-3 pb-4 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{category.icon}</span>
                      <h3 className="font-semibold text-sm sm:text-base">{category.label}</h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor={plannedKey} className="text-xs sm:text-sm">Planned</Label>
                        <CurrencyInput
                          id={plannedKey}
                          value={formData[plannedKey] || ''}
                          onChange={(value) => handleInputChange(plannedKey, value)}
                          className="h-11 sm:h-10 text-base sm:text-sm"
                          placeholder="0"
                          error={!!errors[plannedKey]}
                          aria-invalid={!!errors[plannedKey]}
                          aria-describedby={errors[plannedKey] ? `${plannedKey}-error` : undefined}
                        />
                        {errors[plannedKey] && (
                          <p id={`${plannedKey}-error`} className="text-xs text-error flex items-center gap-1" role="alert">
                            <AlertCircle className="h-3 w-3" />
                            {errors[plannedKey]}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor={spentKey} className="text-xs sm:text-sm">Spent</Label>
                        <CurrencyInput
                          id={spentKey}
                          value={formData[spentKey] || ''}
                          onChange={(value) => handleInputChange(spentKey, value)}
                          className="h-11 sm:h-10 text-base sm:text-sm"
                          placeholder="0"
                          error={!!errors[spentKey]}
                          aria-invalid={!!errors[spentKey]}
                          aria-describedby={errors[spentKey] ? `${spentKey}-error` : undefined}
                        />
                        {errors[spentKey] && (
                          <p id={`${spentKey}-error`} className="text-xs text-error flex items-center gap-1" role="alert">
                            <AlertCircle className="h-3 w-3" />
                            {errors[spentKey]}
                          </p>
                        )}
                        {formData[plannedKey] > 0 && formData[spentKey] > formData[plannedKey] && (
                          <p className="text-xs text-warning flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Over budget by ${(formData[spentKey] - formData[plannedKey]).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending || Object.keys(errors).length > 0} 
              className="flex-1 sm:flex-none min-h-[44px]"
              aria-label="Save wedding budget"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Wedding Budget'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setErrors({})
                setIsEditing(false)
              }} 
              className="flex-1 sm:flex-none min-h-[44px]"
              aria-label="Cancel editing wedding budget"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : !weddingBudget ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't set up your wedding budget yet. Create one to track your wedding expenses.
            </p>
            <Button onClick={handleEdit}>Create Wedding Budget</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Bar Chart Visualization */}
          {totalPlanned > 0 && (
            <Card>
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Budget vs Spent Comparison
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Visual comparison of planned vs actual spending
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={WEDDING_CATEGORIES.map(cat => {
                        const plannedKey = `${cat.key}_planned` as keyof WeddingBudgetData
                        const spentKey = `${cat.key}_spent` as keyof WeddingBudgetData
                        const planned = Number(weddingBudget?.[plannedKey]) || 0
                        const spent = Number(weddingBudget?.[spentKey]) || 0
                        return {
                          name: cat.label,
                          Planned: planned,
                          Spent: spent,
                        }
                      }).filter(item => item.Planned > 0 || item.Spent > 0)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="Planned" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="Spent" fill="#FBD07C" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 justify-center mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#8B5CF6]" />
                    <span className="text-xs text-muted-foreground">Planned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#FBD07C]" />
                    <span className="text-xs text-muted-foreground">Spent</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Breakdown */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">Category Breakdown</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const exportData = WEDDING_CATEGORIES.map(cat => {
                      const plannedKey = `${cat.key}_planned` as keyof WeddingBudgetData
                      const spentKey = `${cat.key}_spent` as keyof WeddingBudgetData
                      const planned = Number(weddingBudget?.[plannedKey]) || 0
                      const spent = Number(weddingBudget?.[spentKey]) || 0
                      const remaining = planned - spent
                      return {
                        Category: cat.label,
                        Planned: planned,
                        Spent: spent,
                        Remaining: remaining,
                        'Over Budget': remaining < 0 ? Math.abs(remaining) : 0,
                      }
                    }).filter(item => item.Planned > 0 || item.Spent > 0)
                    exportData.push({
                      Category: 'TOTAL',
                      Planned: totalPlanned,
                      Spent: totalSpent,
                      Remaining: remaining,
                      'Over Budget': remaining < 0 ? Math.abs(remaining) : 0,
                    })
                    exportToCSV(exportData, `wedding-budget-${new Date().toISOString().split('T')[0]}`)
                    toast.success('Wedding budget exported to CSV!')
                  }}
                  className="min-h-[36px]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4">
                {WEDDING_CATEGORIES.map(category => {
                  const plannedKey = `${category.key}_planned` as keyof WeddingBudgetData
                  const spentKey = `${category.key}_spent` as keyof WeddingBudgetData
                  const planned = Number(weddingBudget[plannedKey]) || 0
                  const spent = Number(weddingBudget[spentKey]) || 0
                  const remaining = planned - spent
                  const percentage = planned > 0 ? (spent / planned) * 100 : 0

                  if (planned === 0 && spent === 0) return null

                  return (
                    <div key={category.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="text-sm font-medium">{category.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            ${spent.toLocaleString()} / ${planned.toLocaleString()}
                          </div>
                          {remaining < 0 && (
                            <div className="text-xs text-error">
                              Over by ${Math.abs(remaining).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      {planned > 0 && (
                        <Progress
                          value={percentage}
                          variant={percentage > 100 ? 'warning' : 'default'}
                          size="sm"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleEdit} className="w-full sm:w-auto min-h-[44px]">
            Edit Wedding Budget
          </Button>
        </div>
      )}
    </div>
  )
}

function WeddingBudgetSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export const WeddingBudget = memo(WeddingBudgetComponent)
