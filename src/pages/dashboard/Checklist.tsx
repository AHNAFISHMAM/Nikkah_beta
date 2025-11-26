import { useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useConfetti } from '../../hooks/useConfetti'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
import { Progress } from '../../components/ui/progress'
import { Skeleton } from '../../components/ui/skeleton'
import { PrintButton } from '../../components/PrintButton'
import { PrintableChecklist } from '../../components/PrintableChecklist'
import toast from 'react-hot-toast'

interface ChecklistItem {
  id: string
  title: string
  description: string | null
  category_id: string
  order_index?: number
  is_custom?: boolean
}

interface ChecklistCategory {
  id: string
  name: string
  order_index: number
}

interface UserChecklistStatus {
  id: string
  checklist_item_id: string
  is_completed: boolean
}

export default function ChecklistPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { triggerConfetti, triggerFireworks } = useConfetti()

  const { data, isLoading } = useQuery({
    queryKey: ['checklist', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const [
        { data: categories },
        { data: items },
        { data: statuses }
      ] = await Promise.all([
        supabase.from('checklist_categories').select('*').order('order_index'),
        // Filter out custom items and order by category then order_index for proper grouping
        supabase
          .from('checklist_items')
          .select('*')
          .eq('is_custom', false)
          .order('category_id')
          .order('order_index'),
        supabase.from('user_checklist_status').select('*').eq('user_id', user.id)
      ])

      return { categories, items, statuses }
    },
    enabled: !!user,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, isCompleted }: { itemId: string; isCompleted: boolean }) => {
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_checklist_status')
        .upsert({
          user_id: user.id,
          checklist_item_id: itemId,
          is_completed: isCompleted,
        }, {
          onConflict: 'user_id,checklist_item_id'
        })

      if (error) throw error
      return { isCompleted }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })

      // Celebrate when completing an item
      if (result.isCompleted) {
        triggerConfetti()
        toast.success('Mashallah! Task completed!', { icon: '✨' })
      }
    },
    onError: () => {
      toast.error('Failed to update item')
    },
  })

  // Extract data with safe defaults - must be before any early returns
  const allCategories = (data?.categories as ChecklistCategory[]) || []
  const allItems = (data?.items as ChecklistItem[]) || []
  const statuses = (data?.statuses as UserChecklistStatus[]) || []
  
  // Sort categories by order_index to ensure proper display order
  const categories = useMemo(() => {
    return [...allCategories].sort((a, b) => a.order_index - b.order_index)
  }, [allCategories])

  // Deduplicate items: keep only one occurrence of each title within a category
  // Best practice: Keep the item with the lowest ID (original/oldest) when duplicates exist
  const items = useMemo(() => {
    const itemMap = new Map<string, ChecklistItem>()
    
    // Process items and keep the one with the lowest ID for each unique title+category
    allItems.forEach(item => {
      // Create a unique key: category_id + normalized title
      const key = `${item.category_id}-${item.title.trim().toLowerCase()}`
      
      const existing = itemMap.get(key)
      
      // If no existing item or this one has a lower ID (older/original), use this one
      if (!existing || item.id < existing.id) {
        itemMap.set(key, item)
      }
    })
    
    // Convert map to array and sort by category order_index, then item order_index
    const deduplicated = Array.from(itemMap.values())
    
    // Sort: first by category order (via category_id lookup), then by item order_index
    return deduplicated.sort((a, b) => {
      const categoryA = categories.find(c => c.id === a.category_id)
      const categoryB = categories.find(c => c.id === b.category_id)
      const categoryOrder = (categoryA?.order_index || 0) - (categoryB?.order_index || 0)
      
      if (categoryOrder !== 0) return categoryOrder
      
      return (a.order_index || 0) - (b.order_index || 0)
    })
  }, [allItems, categories])

  // Create a Set of completed item IDs for the printable component and fast lookups
  // Must be called before early return to maintain hook order
  const completedIds = useMemo(() => {
    return new Set(statuses.filter(s => s.is_completed).map(s => s.checklist_item_id))
  }, [statuses])

  // Memoized function to check if item is completed - uses the Set for O(1) lookup
  const isItemCompleted = useCallback((itemId: string) => {
    return completedIds.has(itemId)
  }, [completedIds])

  // Memoized toggle handler to prevent unnecessary re-renders
  const handleToggle = useCallback((itemId: string) => {
    const currentStatus = completedIds.has(itemId)
    updateMutation.mutate({ itemId, isCompleted: !currentStatus })
  }, [completedIds, updateMutation])

  // Calculate progress stats
  const completedCount = completedIds.size
  const totalItems = items.length
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  // Early return after all hooks
  if (isLoading) {
    return <ChecklistSkeleton />
  }

  return (
    <div className="space-y-6">
      <SEO
        title={PAGE_SEO.checklist.title}
        description={PAGE_SEO.checklist.description}
        path="/dashboard/checklist"
        noIndex
      />

      {/* Printable Worksheet (hidden on screen) */}
      <PrintableChecklist
        items={items}
        categories={categories}
        completedIds={completedIds}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Readiness Checklist</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track your marriage preparation
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="p-4 sm:pt-6 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium">Overall Progress</span>
            <span className="text-sm sm:text-base font-bold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} variant="islamic" size="md" />
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
            {completedCount} of {totalItems} items completed
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-4 sm:space-y-6">
        {categories.map((category) => {
          const categoryItems = items.filter(item => item.category_id === category.id)
          const categoryCompleted = categoryItems.filter(item => isItemCompleted(item.id)).length

          // Only show categories that have items
          if (categoryItems.length === 0) return null

          return (
            <Card key={category.id}>
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <span>{category.name}</span>
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                    {categoryCompleted}/{categoryItems.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6 pt-0">
                {categoryItems.map((item) => {
                  const completed = isItemCompleted(item.id)
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 sm:p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer active:bg-accent/80 min-h-[56px] touch-target-auto"
                      onClick={() => handleToggle(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleToggle(item.id)}
                    >
                      <Checkbox
                        checked={completed}
                        onChange={() => {}}
                        className="mt-0.5 h-5 w-5 sm:h-4 sm:w-4"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm sm:text-base font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function ChecklistSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
