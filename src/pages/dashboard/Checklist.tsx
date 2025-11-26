import { useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useConfetti } from '../../hooks/useConfetti'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
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
  const { triggerConfetti } = useConfetti()

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

      {/* Spacer to ensure elements start below viewport */}
      <div className="h-4" />

      {/* Progress Card */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3, margin: "150px 0px 0px 0px" }} // Trigger when 30% visible, with 150px top margin (triggers when first category card is visible)
        variants={{
          hidden: {}, // No animation for parent container
          visible: {
            transition: {
              staggerChildren: 0.4, // 400ms stagger between children
              delayChildren: 0.3, // 300ms initial delay before children start animating
            },
          },
        }}
      >
        <Card>
          <CardContent className="p-4 sm:pt-6 sm:p-6">
            {/* Wrapper motion.div to maintain variant inheritance chain - must also use whileInView since Card breaks the chain */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3, margin: "150px 0px 0px 0px" }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.4, // 400ms stagger between direct children
                    delayChildren: 0.1, // 100ms delay before children start
                  },
                },
              }}
            >
              <motion.div 
                className="flex items-center justify-between mb-2"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <span className="text-xs sm:text-sm font-medium">Overall Progress</span>
                <motion.span
                  className="text-sm sm:text-base font-bold text-primary"
                  key={progress}
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 },
                  }}
                >
                  {progress}%
                </motion.span>
              </motion.div>
              <motion.div
                key={progress}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                }}
              >
                <Progress value={progress} variant="islamic" size="md" />
              </motion.div>
              <motion.p
                className="text-[10px] sm:text-xs text-muted-foreground mt-2"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                {completedCount} of {totalItems} items completed
              </motion.p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories */}
      <div className="space-y-4 sm:space-y-6">
        {categories.map((category) => {
          const categoryItems = items.filter(item => item.category_id === category.id)
          const categoryCompleted = categoryItems.filter(item => isItemCompleted(item.id)).length

          // Only show categories that have items
          if (categoryItems.length === 0) return null

          return (
            <motion.div
              key={category.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3, margin: "50px 0px 0px 0px" }} // Trigger when 30% visible, with 50px top margin (each card animates individually)
              variants={{
                hidden: { 
                  opacity: 0, 
                  y: 30, 
                  scale: 0.95,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 1.2,
                    ease: [0.6, -0.05, 0.01, 0.99], // Custom easing curve for smooth reveal
                    staggerChildren: 0.3, // 300ms stagger between children
                    delayChildren: 0.2, // 200ms initial delay before children start animating
                  },
                },
              }}
              style={{ perspective: 1000 }} // 3D perspective for depth
            >
              <motion.div
                variants={{
                  hidden: { rotateX: -5, opacity: 0 },
                  visible: { 
                    rotateX: 0, 
                    opacity: 1,
                    transition: {
                      duration: 1.2,
                      ease: [0.6, -0.05, 0.01, 0.99],
                    },
                  },
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Card className="overflow-hidden relative">
                  {/* Awwwards-style gradient reveal overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-islamic-gold/20 pointer-events-none z-10"
                    variants={{
                      hidden: { opacity: 0, x: "-100%" },
                      visible: { 
                        opacity: 1, 
                        x: "100%",
                        transition: {
                          duration: 1.5,
                          ease: "easeInOut",
                          delay: 0.3,
                        },
                      },
                    }}
                  />
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                  <motion.div
                    className="flex items-center justify-between text-base sm:text-lg"
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 1, // Slower header animation (best practice: 1-1.5s for visible animations)
                          ease: "easeOut",
                        },
                      },
                    }}
                  >
                    <span>{category.name}</span>
                    <motion.span
                      className="text-xs sm:text-sm font-normal text-muted-foreground"
                      key={`${category.id}-${categoryCompleted}`}
                      variants={{
                        hidden: { scale: 1.2, opacity: 0 },
                        visible: {
                          scale: 1,
                          opacity: 1,
                          transition: {
                            duration: 1.2, // Slower count badge animation (best practice: 1-1.5s for scale animations)
                            ease: "easeOut",
                          },
                        },
                      }}
                    >
                      {categoryCompleted}/{categoryItems.length}
                    </motion.span>
                  </motion.div>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6 pt-0">
                  <motion.div
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: 0.15, // 150ms stagger between items (best practice: 100-200ms for list items)
                          delayChildren: 0.1, // 100ms delay before items start animating
                        },
                      },
                    }}
                  >
                    {categoryItems.map((item, itemIndex) => {
                      const completed = isItemCompleted(item.id)
                      return (
                        <ChecklistItem
                          key={item.id}
                          item={item}
                          completed={completed}
                          onToggle={() => handleToggle(item.id)}
                          index={itemIndex}
                        />
                      )
                    })}
                  </motion.div>
                </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

interface ChecklistItemProps {
  item: ChecklistItem
  completed: boolean
  onToggle: () => void
  index: number
}

function ChecklistItem({ item, completed, onToggle }: ChecklistItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20, scale: 0.95 },
        visible: {
          opacity: 1,
          x: 0,
          scale: 1,
          transition: {
            duration: 0.8, // Slower item animation (best practice: 0.8-1s for list items)
            ease: "easeOut",
          },
        },
      }}
      layout
      animate={{
        opacity: completed ? 0.7 : 1,
        scale: completed ? 0.98 : 1,
      }}
    >
      <motion.div
        className="flex items-start gap-3 p-3 sm:p-3 rounded-lg border hover:bg-accent/50 cursor-pointer active:bg-accent/80 min-h-[56px] touch-target-auto relative overflow-hidden group"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
        whileHover={{
          x: 4,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 17,
          },
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background color on hover */}
        <motion.div
          className="absolute inset-0 bg-accent rounded-lg"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />

        {/* Checkbox with animation */}
        <motion.div
          className="mt-0.5 relative z-10"
          initial={false}
          animate={{
            scale: completed ? [1, 1.2, 1] : 1,
          }}
          transition={{
            scale: {
              duration: 0.4,
              times: [0, 0.5, 1],
            },
          }}
        >
          <Checkbox
            checked={completed}
            onChange={() => {}}
            className="h-5 w-5 sm:h-4 sm:w-4"
          />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0 relative z-10">
          <motion.p
            className={`text-sm sm:text-base font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}
            animate={{
              opacity: completed ? 0.6 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            {item.title}
          </motion.p>
          {item.description && (
            <motion.p
              className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2"
              animate={{
                opacity: completed ? 0.5 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {item.description}
            </motion.p>
          )}
        </div>

        {/* Completion indicator */}
        <AnimatePresence>
          {completed && (
            <motion.div
              className="absolute right-3 top-3 z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
            >
              <motion.div
                className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <motion.svg
                  className="h-4 w-4 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
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
