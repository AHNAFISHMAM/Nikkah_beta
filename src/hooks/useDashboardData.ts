import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { DEFAULTS } from '../lib/constants'
import { differenceInDays } from 'date-fns'

export interface RecentActivity {
  id: string
  type: 'checklist' | 'module' | 'budget' | 'discussion' | 'profile'
  title: string
  description: string
  timestamp: string
  link?: string
}

export function useDashboardData() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const [
        { data: profile },
        { data: checklistCategories },
        { data: checklistItems },
        { data: completedItems },
        budgetResult,
        { data: modules },
        { data: completedModules },
        { data: recentChecklistCompletions },
        { data: recentModuleCompletions },
        { data: recentDiscussionAnswers },
        budgetUpdateResult
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('checklist_categories').select('id, name').order('order_index'),
        supabase.from('checklist_items').select('id, category_id'),
        supabase.from('user_checklist_status').select('id, is_completed').eq('user_id', user.id).eq('is_completed', true),
        supabase.from('budgets').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('modules').select('id'),
        supabase.from('module_notes').select('id').eq('user_id', user.id).eq('is_completed', true),
        // Recent checklist completions (last 7 days) - fetch separately to avoid join issues
        supabase
          .from('user_checklist_status')
          .select('completed_at, checklist_item_id')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .not('completed_at', 'is', null)
          .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('completed_at', { ascending: false })
          .limit(5),
        // Recent module completions (last 7 days)
        supabase
          .from('module_notes')
          .select('completed_at, module_id')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .not('completed_at', 'is', null)
          .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('completed_at', { ascending: false })
          .limit(5),
        // Recent discussion answers (last 7 days)
        supabase
          .from('user_discussion_answers')
          .select('updated_at, prompt_id')
          .eq('user_id', user.id)
          .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('updated_at', { ascending: false })
          .limit(5),
        // Budget update timestamp
        supabase
          .from('budgets')
          .select('updated_at')
          .eq('user_id', user.id)
          .maybeSingle()
      ])

      const budget = budgetResult.data

      const totalItems = checklistItems?.length || DEFAULTS.TOTAL_CHECKLIST_ITEMS
      const completedCount = completedItems?.length || 0
      const readinessScore = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

      const totalIncome = (budget?.income_his || 0) + (budget?.income_hers || 0)
      const totalExpenses =
        (budget?.expense_housing || 0) +
        (budget?.expense_utilities || 0) +
        (budget?.expense_transportation || 0) +
        (budget?.expense_food || 0) +
        (budget?.expense_insurance || 0) +
        (budget?.expense_debt || 0) +
        (budget?.expense_entertainment || 0) +
        (budget?.expense_dining || 0) +
        (budget?.expense_clothing || 0) +
        (budget?.expense_gifts || 0) +
        (budget?.expense_charity || 0)
      const surplus = totalIncome - totalExpenses

      const modulesCompleted = completedModules?.length || 0
      const totalModules = modules?.length || DEFAULTS.TOTAL_MODULES

      const daysUntilWedding = profile?.wedding_date
        ? Math.max(0, differenceInDays(new Date(profile.wedding_date), new Date()))
        : null

      // Build recent activity feed
      const activities: RecentActivity[] = []

      // Fetch titles for checklist items
      if (recentChecklistCompletions && recentChecklistCompletions.length > 0) {
        const checklistItemIds = recentChecklistCompletions.map((item: any) => item.checklist_item_id)
        const { data: checklistItemsData } = await supabase
          .from('checklist_items')
          .select('id, title')
          .in('id', checklistItemIds)

        const checklistItemsMap = new Map(checklistItemsData?.map((item: any) => [item.id, item.title]) || [])

        recentChecklistCompletions.forEach((item: any) => {
          if (item.completed_at) {
            const title = checklistItemsMap.get(item.checklist_item_id) || 'Checklist item'
            activities.push({
              id: `checklist-${item.completed_at}-${item.checklist_item_id}`,
              type: 'checklist',
              title: 'Completed checklist item',
              description: title,
              timestamp: item.completed_at,
              link: '/dashboard/checklist',
            })
          }
        })
      }

      // Fetch titles for modules
      if (recentModuleCompletions && recentModuleCompletions.length > 0) {
        const moduleIds = recentModuleCompletions.map((item: any) => item.module_id)
        const { data: modulesData } = await supabase
          .from('modules')
          .select('id, title')
          .in('id', moduleIds)

        const modulesMap = new Map(modulesData?.map((item: any) => [item.id, item.title]) || [])

        recentModuleCompletions.forEach((item: any) => {
          if (item.completed_at) {
            const title = modulesMap.get(item.module_id) || 'Learning module'
            activities.push({
              id: `module-${item.completed_at}-${item.module_id}`,
              type: 'module',
              title: 'Completed module',
              description: title,
              timestamp: item.completed_at,
              link: '/dashboard/modules',
            })
          }
        })
      }

      // Fetch titles for discussion prompts
      if (recentDiscussionAnswers && recentDiscussionAnswers.length > 0) {
        const promptIds = recentDiscussionAnswers.map((item: any) => item.prompt_id)
        const { data: promptsData } = await supabase
          .from('discussion_prompts')
          .select('id, title')
          .in('id', promptIds)

        const promptsMap = new Map(promptsData?.map((item: any) => [item.id, item.title]) || [])

        recentDiscussionAnswers.forEach((item: any) => {
          if (item.updated_at) {
            const title = promptsMap.get(item.prompt_id) || 'Discussion prompt'
            activities.push({
              id: `discussion-${item.updated_at}-${item.prompt_id}`,
              type: 'discussion',
              title: 'Updated discussion answer',
              description: title,
              timestamp: item.updated_at,
              link: '/dashboard/discussions',
            })
          }
        })
      }

      // Add budget update if recent
      if (budgetUpdateResult.data?.updated_at) {
        const budgetUpdateTime = new Date(budgetUpdateResult.data.updated_at).getTime()
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        if (budgetUpdateTime > sevenDaysAgo) {
          activities.push({
            id: `budget-${budgetUpdateResult.data.updated_at}`,
            type: 'budget',
            title: 'Updated budget',
            description: 'Financial budget was updated',
            timestamp: budgetUpdateResult.data.updated_at,
            link: '/dashboard/financial',
          })
        }
      }

      // Sort by timestamp (most recent first) and limit to 10
      const recentActivity = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

      return {
        profile,
        checklistCategories,
        totalItems,
        completedCount,
        readinessScore,
        budget,
        totalIncome,
        totalExpenses,
        surplus,
        modulesCompleted,
        totalModules,
        daysUntilWedding,
        hasBudget: !!budget,
        recentActivity,
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
