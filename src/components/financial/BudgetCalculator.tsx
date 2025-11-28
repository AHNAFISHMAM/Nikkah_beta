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
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, Download, AlertCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { exportToCSV, formatCurrency } from '../../lib/export'
import { validateAmount } from '../../lib/validation'
import toast from 'react-hot-toast'
import { logError } from '../../lib/logger'

interface BudgetData {
  income_his: number
  income_hers: number
  expense_housing: number
  expense_utilities: number
  expense_transportation: number
  expense_food: number
  expense_insurance: number
  expense_debt: number
  expense_entertainment: number
  expense_dining: number
  expense_clothing: number
  expense_gifts: number
  expense_charity: number
}

const COLORS = [
  '#8B5CF6', // islamic-purple
  '#FBD07C', // islamic-gold
  '#00FF87', // brand gradient anchor
  '#3B82F6', // blue
  '#EF4444', // red
  '#F59E0B', // amber
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#6366F1', // indigo
  '#F97316', // orange
  '#14B8A6', // teal
]

const EXPENSE_CATEGORIES = [
  { key: 'expense_housing', label: 'Housing', color: COLORS[0] },
  { key: 'expense_utilities', label: 'Utilities', color: COLORS[1] },
  { key: 'expense_transportation', label: 'Transportation', color: COLORS[2] },
  { key: 'expense_food', label: 'Food', color: COLORS[3] },
  { key: 'expense_insurance', label: 'Insurance', color: COLORS[4] },
  { key: 'expense_debt', label: 'Debt', color: COLORS[5] },
  { key: 'expense_entertainment', label: 'Entertainment', color: COLORS[6] },
  { key: 'expense_dining', label: 'Dining', color: COLORS[7] },
  { key: 'expense_clothing', label: 'Clothing', color: COLORS[8] },
  { key: 'expense_gifts', label: 'Gifts', color: COLORS[9] },
  { key: 'expense_charity', label: 'Charity', color: COLORS[10] },
] as const

function BudgetCalculatorComponent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { triggerStars } = useConfetti()
  const [isEditing, setIsEditing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: budget, isLoading } = useQuery({
    queryKey: ['budget', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        logError('Budget query error', error, 'BudgetCalculator')
        throw error
      }
      return data as BudgetData | null
    },
    enabled: !!user,
    retry: 1,
  })

  const [formData, setFormData] = useState<BudgetData>({
    income_his: 0,
    income_hers: 0,
    expense_housing: 0,
    expense_utilities: 0,
    expense_transportation: 0,
    expense_food: 0,
    expense_insurance: 0,
    expense_debt: 0,
    expense_entertainment: 0,
    expense_dining: 0,
    expense_clothing: 0,
    expense_gifts: 0,
    expense_charity: 0,
  })

  // Validate form data
  const validateForm = useCallback((data: BudgetData): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Validate income fields
    const incomeHisValidation = validateAmount(data.income_his, { min: 0, max: 10000000, fieldName: 'His Income' })
    if (!incomeHisValidation.isValid) {
      newErrors.income_his = incomeHisValidation.error || 'Invalid amount'
    }
    
    const incomeHersValidation = validateAmount(data.income_hers, { min: 0, max: 10000000, fieldName: 'Her Income' })
    if (!incomeHersValidation.isValid) {
      newErrors.income_hers = incomeHersValidation.error || 'Invalid amount'
    }
    
    // Validate expense fields
    EXPENSE_CATEGORIES.forEach(category => {
      const key = category.key as keyof BudgetData
      const validation = validateAmount(data[key], { min: 0, max: 10000000, fieldName: category.label })
      if (!validation.isValid) {
        newErrors[key] = validation.error || 'Invalid amount'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [])

  const saveMutation = useMutation({
    mutationFn: async (data: BudgetData) => {
      if (!user) throw new Error('Not authenticated')

      // Validate before saving
      if (!validateForm(data)) {
        throw new Error('Please fix validation errors before saving')
      }

      const { error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          ...data,
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        logError('Budget save error', error, 'BudgetCalculator')
        throw new Error(error.message || 'Failed to save budget. Please try again.')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      triggerStars()
      setErrors({})
      toast.success('Mashallah! Budget saved!', { icon: '💰' })
      setIsEditing(false)
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to save budget. Please check your connection and try again.'
      toast.error(errorMessage, { duration: 5000 })
    },
  })

  const totalIncome = (budget?.income_his || 0) + (budget?.income_hers || 0)
  const totalExpenses = useMemo(() => {
    if (!budget) return 0
    return Object.entries(budget).reduce((sum, [key, value]) => {
      if (key.startsWith('expense_')) {
        return sum + (Number(value) || 0)
      }
      return sum
    }, 0)
  }, [budget])

  const surplus = totalIncome - totalExpenses

  // Prepare data for pie chart
  const chartData = useMemo(() => {
    if (!budget) return []
    return EXPENSE_CATEGORIES
      .map(category => ({
        name: category.label,
        value: Number(budget[category.key as keyof BudgetData]) || 0,
        color: category.color,
      }))
      .filter(item => item.value > 0)
  }, [budget])

  const handleEdit = useCallback(() => {
    if (budget) {
      setFormData({
        income_his: budget.income_his || 0,
        income_hers: budget.income_hers || 0,
        expense_housing: budget.expense_housing || 0,
        expense_utilities: budget.expense_utilities || 0,
        expense_transportation: budget.expense_transportation || 0,
        expense_food: budget.expense_food || 0,
        expense_insurance: budget.expense_insurance || 0,
        expense_debt: budget.expense_debt || 0,
        expense_entertainment: budget.expense_entertainment || 0,
        expense_dining: budget.expense_dining || 0,
        expense_clothing: budget.expense_clothing || 0,
        expense_gifts: budget.expense_gifts || 0,
        expense_charity: budget.expense_charity || 0,
      })
    }
    setIsEditing(true)
  }, [budget])

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

  const handleInputChange = useCallback((key: keyof BudgetData, value: string) => {
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
    return <BudgetSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-success">
              ${totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-error">
              ${totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">Surplus/Deficit</CardTitle>
            <DollarSign className={`h-4 w-4 ${surplus >= 0 ? 'text-success' : 'text-error'}`} />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={`text-2xl font-bold ${surplus >= 0 ? 'text-success' : 'text-error'}`}>
              ${surplus.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {surplus >= 0 ? 'Great!' : 'Review budget'}
            </p>
          </CardContent>
        </Card>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {/* Income */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Income</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Monthly household income</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:gap-4 grid-cols-2 p-4 sm:p-6 pt-0">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="income_his" className="text-xs sm:text-sm">His Income</Label>
                <CurrencyInput
                  id="income_his"
                  value={formData.income_his || ''}
                  onChange={(value) => handleInputChange('income_his', value)}
                  className="h-11 sm:h-10 text-base sm:text-sm"
                  error={!!errors.income_his}
                  aria-invalid={!!errors.income_his}
                  aria-describedby={errors.income_his ? 'income_his-error' : undefined}
                />
                {errors.income_his && (
                  <p id="income_his-error" className="text-xs text-error flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3" />
                    {errors.income_his}
                  </p>
                )}
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="income_hers" className="text-xs sm:text-sm">Her Income</Label>
                <CurrencyInput
                  id="income_hers"
                  value={formData.income_hers || ''}
                  onChange={(value) => handleInputChange('income_hers', value)}
                  className="h-11 sm:h-10 text-base sm:text-sm"
                  error={!!errors.income_hers}
                  aria-invalid={!!errors.income_hers}
                  aria-describedby={errors.income_hers ? 'income_hers-error' : undefined}
                />
                {errors.income_hers && (
                  <p id="income_hers-error" className="text-xs text-error flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3" />
                    {errors.income_hers}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fixed Expenses */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Fixed Expenses</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Monthly fixed costs</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 p-4 sm:p-6 pt-0">
              {[
                { key: 'expense_housing', label: 'Housing' },
                { key: 'expense_utilities', label: 'Utilities' },
                { key: 'expense_transportation', label: 'Transportation' },
                { key: 'expense_food', label: 'Food' },
                { key: 'expense_insurance', label: 'Insurance' },
                { key: 'expense_debt', label: 'Debt' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor={key} className="text-xs sm:text-sm">{label}</Label>
                  <CurrencyInput
                    id={key}
                    value={formData[key as keyof BudgetData] || ''}
                    onChange={(value) => handleInputChange(key as keyof BudgetData, value)}
                    className="h-11 sm:h-10 text-base sm:text-sm"
                    error={!!errors[key]}
                    aria-invalid={!!errors[key]}
                    aria-describedby={errors[key] ? `${key}-error` : undefined}
                  />
                  {errors[key] && (
                    <p id={`${key}-error`} className="text-xs text-error flex items-center gap-1" role="alert">
                      <AlertCircle className="h-3 w-3" />
                      {errors[key]}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Variable Expenses */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Variable Expenses</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Monthly variable costs</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 p-4 sm:p-6 pt-0">
              {[
                { key: 'expense_entertainment', label: 'Entertainment' },
                { key: 'expense_dining', label: 'Dining' },
                { key: 'expense_clothing', label: 'Clothing' },
                { key: 'expense_gifts', label: 'Gifts' },
                { key: 'expense_charity', label: 'Charity' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor={key} className="text-xs sm:text-sm">{label}</Label>
                  <CurrencyInput
                    id={key}
                    value={formData[key as keyof BudgetData] || ''}
                    onChange={(value) => handleInputChange(key as keyof BudgetData, value)}
                    className="h-11 sm:h-10 text-base sm:text-sm"
                    error={!!errors[key]}
                    aria-invalid={!!errors[key]}
                    aria-describedby={errors[key] ? `${key}-error` : undefined}
                  />
                  {errors[key] && (
                    <p id={`${key}-error`} className="text-xs text-error flex items-center gap-1" role="alert">
                      <AlertCircle className="h-3 w-3" />
                      {errors[key]}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending || Object.keys(errors).length > 0} 
              className="flex-1 sm:flex-none min-h-[44px]"
              aria-label="Save budget"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Budget'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setErrors({})
                setIsEditing(false)
              }} 
              className="flex-1 sm:flex-none min-h-[44px]"
              aria-label="Cancel editing budget"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : !budget ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't set up your budget yet. Create one to start tracking your finances.
            </p>
            <Button onClick={handleEdit}>Create Budget</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Charts Section */}
          {chartData.length > 0 && (
            <div className="space-y-4">
              {/* Pie Chart */}
              <Card>
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5" />
                        Expense Breakdown (Pie Chart)
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Visual breakdown of your monthly expenses by category
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const exportData = EXPENSE_CATEGORIES.map(cat => ({
                          Category: cat.label,
                          Amount: Number(budget?.[cat.key as keyof BudgetData]) || 0,
                          Percentage: totalExpenses > 0
                            ? `${(((Number(budget?.[cat.key as keyof BudgetData]) || 0) / totalExpenses) * 100).toFixed(1)}%`
                            : '0%',
                        })).filter(item => item.Amount > 0)
                        exportToCSV(exportData, `budget-expenses-${new Date().toISOString().split('T')[0]}`)
                        toast.success('Budget exported to CSV!')
                      }}
                      className="min-h-[36px]"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '12px' }}
                          formatter={(value) => value}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart Comparison */}
              <Card>
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Expense Comparison (Bar Chart)</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Compare expenses across categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                        <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`bar-cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Expense List */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Expense Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-2">
                {EXPENSE_CATEGORIES.map(category => {
                  const value = Number(budget[category.key as keyof BudgetData]) || 0
                  if (value === 0) return null
                  const percentage = totalExpenses > 0 ? (value / totalExpenses) * 100 : 0
                  return (
                    <div key={category.key} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium">{category.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">${value.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleEdit} className="w-full sm:w-auto min-h-[44px]">
              Edit Budget
            </Button>
            {budget && (
              <Button
                variant="outline"
                onClick={() => {
                  const exportData = [
                    {
                      'Income (His)': budget.income_his || 0,
                      'Income (Hers)': budget.income_hers || 0,
                      'Total Income': totalIncome,
                      'Housing': budget.expense_housing || 0,
                      'Utilities': budget.expense_utilities || 0,
                      'Transportation': budget.expense_transportation || 0,
                      'Food': budget.expense_food || 0,
                      'Insurance': budget.expense_insurance || 0,
                      'Debt': budget.expense_debt || 0,
                      'Entertainment': budget.expense_entertainment || 0,
                      'Dining': budget.expense_dining || 0,
                      'Clothing': budget.expense_clothing || 0,
                      'Gifts': budget.expense_gifts || 0,
                      'Charity': budget.expense_charity || 0,
                      'Total Expenses': totalExpenses,
                      'Surplus/Deficit': surplus,
                    },
                  ]
                  exportToCSV(exportData, `budget-${new Date().toISOString().split('T')[0]}`)
                  toast.success('Budget exported to CSV!')
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

function BudgetSkeleton() {
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
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export const BudgetCalculator = memo(BudgetCalculatorComponent)
