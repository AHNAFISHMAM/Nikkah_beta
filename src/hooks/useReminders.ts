import { useMemo, useState, useCallback } from 'react'
import { useDashboardData } from './useDashboardData'

interface Reminder {
  id: string
  title: string
  description: string
  action?: { label: string; href: string }
  priority?: 'normal' | 'high'
}

const DISMISSED_KEY = 'nikahprep_dismissed_reminders'

export function useReminders() {
  const { data, isLoading } = useDashboardData()
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const allReminders = useMemo(() => {
    if (!data) return []

    const list: Reminder[] = []

    // Wedding approaching (< 30 days) - high priority
    if (data.daysUntilWedding !== null && data.daysUntilWedding <= 30 && data.daysUntilWedding > 0) {
      list.push({
        id: 'wedding-soon',
        title: `${data.daysUntilWedding} days until your wedding!`,
        description: 'Make sure everything is ready for your big day.',
        priority: 'high',
      })
    }

    // Incomplete checklist items
    if (data.completedCount < data.totalItems) {
      const remaining = data.totalItems - data.completedCount
      list.push({
        id: 'checklist',
        title: 'Continue your checklist',
        description: `${remaining} item${remaining > 1 ? 's' : ''} remaining to complete.`,
        action: { label: 'View checklist', href: '/dashboard/checklist' },
      })
    }

    // No budget set
    if (!data.hasBudget) {
      list.push({
        id: 'budget',
        title: 'Set up your budget',
        description: 'Plan your finances together as a couple.',
        action: { label: 'Create budget', href: '/dashboard/financial' },
      })
    }

    // Incomplete modules
    if (data.modulesCompleted < data.totalModules) {
      const remaining = data.totalModules - data.modulesCompleted
      list.push({
        id: 'modules',
        title: 'Continue learning',
        description: `${remaining} module${remaining > 1 ? 's' : ''} remaining to explore.`,
        action: { label: 'View modules', href: '/dashboard/modules' },
      })
    }

    // Low readiness score
    if (data.readinessScore < 25) {
      list.push({
        id: 'readiness-low',
        title: 'Just getting started?',
        description: 'Begin with the readiness checklist to track your progress.',
        action: { label: 'Start checklist', href: '/dashboard/checklist' },
      })
    }

    // No wedding date set
    if (data.daysUntilWedding === null) {
      list.push({
        id: 'no-date',
        title: 'Set your wedding date',
        description: 'Add your wedding date to see a countdown.',
        action: { label: 'Update profile', href: '/dashboard/profile' },
      })
    }

    return list
  }, [data])

  // Filter out dismissed reminders
  const reminders = useMemo(() => {
    return allReminders.filter((r) => !dismissedIds.includes(r.id))
  }, [allReminders, dismissedIds])

  // Dismiss a reminder (stores in localStorage)
  const dismissReminder = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const updated = [...prev, id]
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated))
      } catch {
        // Ignore storage errors
      }
      return updated
    })
  }, [])

  // Reset all dismissed reminders (for testing or user preference)
  const resetDismissed = useCallback(() => {
    setDismissedIds([])
    try {
      localStorage.removeItem(DISMISSED_KEY)
    } catch {
      // Ignore storage errors
    }
  }, [])

  return {
    reminders,
    dismissReminder,
    resetDismissed,
    isLoading,
  }
}
