import { useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { ExternalLink, BookOpen, GraduationCap, Users, DollarSign, Heart, FileText, Star } from 'lucide-react'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: string
  is_featured: boolean
  order_index: number | null
}

interface UserFavorite {
  id: string
  resource_id: string
}

// Category order as specified in requirements
const CATEGORY_ORDER = ['Books', 'Scholarly', 'Counseling', 'Finance', 'Duas', 'Courses'] as const

// Category display names and icons
const categoryConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  Books: { label: 'Recommended Books', icon: BookOpen },
  Scholarly: { label: 'Islamic Marriage Resources', icon: GraduationCap },
  Counseling: { label: 'Counseling', icon: Users },
  Finance: { label: 'Islamic Finance', icon: DollarSign },
  Duas: { label: 'Duas for Marriage', icon: Heart },
  Courses: { label: 'Pre-Marriage Courses', icon: FileText },
}

export default function ResourcesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch all resources
  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('order_index', { ascending: true, nullsLast: true })

      if (error) throw error
      return (data || []) as Resource[]
    },
    enabled: !!user,
  })

  // Fetch user's favorites
  const { data: favorites } = useQuery({
    queryKey: ['resource-favorites', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('user_resource_favorites')
        .select('resource_id')
        .eq('user_id', user.id)

      if (error) {
        // Table might not exist yet, that's okay
        return []
      }
      return (data || []) as UserFavorite[]
    },
    enabled: !!user,
  })

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ resourceId, isFavorite }: { resourceId: string; isFavorite: boolean }) => {
      if (!user) throw new Error('Not authenticated')

      if (isFavorite) {
        // Remove favorite
        const { error } = await supabase
          .from('user_resource_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId)

        if (error) throw error
      } else {
        // Add favorite
        const { error } = await supabase
          .from('user_resource_favorites')
          .insert({
            user_id: user.id,
            resource_id: resourceId,
          })

        if (error) throw error
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resource-favorites'] })
      toast.success(variables.isFavorite ? 'Removed from favorites' : 'Added to favorites', {
        icon: variables.isFavorite ? '💔' : '⭐',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update favorite')
    },
  })

  // Create Set of favorited resource IDs for fast lookup
  const favoriteIds = useMemo(() => {
    return new Set(favorites?.map(f => f.resource_id) || [])
  }, [favorites])

  const isFavorite = useCallback((resourceId: string) => {
    return favoriteIds.has(resourceId)
  }, [favoriteIds])

  const handleToggleFavorite = useCallback((resourceId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const currentlyFavorite = isFavorite(resourceId)
    toggleFavoriteMutation.mutate({ resourceId, isFavorite: currentlyFavorite })
  }, [isFavorite, toggleFavoriteMutation])

  // Group by category and sort by specified order
  const categories = useMemo(() => {
    if (!resources) return {}

    const grouped = resources.reduce((acc, resource) => {
      if (!acc[resource.category]) {
        acc[resource.category] = []
      }
      acc[resource.category].push(resource)
      return acc
    }, {} as Record<string, Resource[]>)

    // Sort resources within each category by order_index, then by title
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        if (a.order_index !== null && b.order_index !== null) {
          return a.order_index - b.order_index
        }
        if (a.order_index !== null) return -1
        if (b.order_index !== null) return 1
        return a.title.localeCompare(b.title)
      })
    })

    // Sort categories by specified order
    const ordered: Record<string, Resource[]> = {}
    CATEGORY_ORDER.forEach(category => {
      if (grouped[category]) {
        ordered[category] = grouped[category]
      }
    })
    // Add any remaining categories not in the order list
    Object.keys(grouped).forEach(category => {
      if (!ordered[category]) {
        ordered[category] = grouped[category]
      }
    })

    return ordered
  }, [resources])

  if (isLoading) {
    return <ResourcesSkeleton />
  }

  return (
    <div className="space-y-6">
      <SEO
        title={PAGE_SEO.resources.title}
        description={PAGE_SEO.resources.description}
        path="/dashboard/resources"
        noIndex
      />

      {/* Header */}
      <motion.div
        className="space-y-0.5 sm:space-y-2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0 }}
      >
        <motion.h1
          className="text-2xl sm:text-3xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          Resources Library
        </motion.h1>
        <motion.p
          className="text-sm sm:text-base text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        >
          Curated Islamic resources: books, scholarly articles, counseling, finance, duas, and courses
        </motion.p>
      </motion.div>

      {/* Categories */}
      {Object.entries(categories).map(([category, categoryResources], categoryIndex) => {
        const config = categoryConfig[category] || { label: category, icon: FileText }
        const Icon = config.icon

        return (
          <motion.div
            key={category}
            className="space-y-3 sm:space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3, margin: "0px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3, margin: "0px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Icon className="h-5 w-5 text-primary" />
              </motion.div>
              <h2 className="text-lg sm:text-xl font-semibold">{config.label}</h2>
            </motion.div>
            <motion.div
              className="grid gap-3 sm:gap-4 sm:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2, margin: "0px" }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0,
                  },
                },
              }}
            >
              {categoryResources.map((resource) => {
                const isSystemFeatured = resource.is_featured
                const isUserFavorite = isFavorite(resource.id)
                const isHighlighted = isUserFavorite

                return (
                  <motion.div
                    key={resource.id}
                    variants={{
                      hidden: { 
                        opacity: 0, 
                        y: 30, 
                        scale: 0.95,
                        clipPath: "inset(0 100% 0 0)",
                      },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        clipPath: "inset(0 0% 0 0)",
                        transition: {
                          duration: 0.8,
                          ease: [0.6, -0.05, 0.01, 0.99],
                        },
                      },
                    }}
                    style={{ perspective: 1000 }}
                  >
                    <motion.div
                      whileHover={{
                        y: -6,
                        scale: 1.02,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        },
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="h-full"
                    >
                      <Card 
                        className={cn(
                          "h-full relative overflow-hidden transition-all duration-200",
                          isSystemFeatured && "border-primary/20",
                          isHighlighted && "border-primary/40 bg-primary/10 shadow-sm"
                        )}
                      >
                        {/* Awwwards-style gradient reveal overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0"
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                        {/* Shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                          whileHover={{ x: "200%" }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />
                        
                        <CardHeader className="p-4 sm:p-6 relative z-10">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <motion.div
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                              whileHover={{
                                scale: 1.1,
                                rotate: 5,
                                transition: { type: "spring", stiffness: 400, damping: 10 },
                              }}
                            >
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-sm sm:text-lg leading-tight flex-1">
                                  {resource.title}
                                </CardTitle>
                                {/* User Favorite Toggle */}
                                <motion.button
                                  onClick={(e) => handleToggleFavorite(resource.id, e)}
                                  disabled={toggleFavoriteMutation.isPending}
                                  className={cn(
                                    "p-1.5 rounded-md transition-all duration-200 hover:bg-accent shrink-0",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    "touch-target-sm"
                                  )}
                                  aria-label={isUserFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                  title={isUserFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <motion.div
                                    animate={{
                                      scale: isUserFavorite ? [1, 1.2, 1] : 1,
                                    }}
                                    transition={{
                                      scale: {
                                        duration: 0.4,
                                        times: [0, 0.5, 1],
                                      },
                                    }}
                                  >
                                    <Star
                                      className={cn(
                                        "h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200",
                                        isUserFavorite
                                          ? "text-primary fill-primary"
                                          : "text-muted-foreground hover:text-primary"
                                      )}
                                    />
                                  </motion.div>
                                </motion.button>
                              </div>
                              <CardDescription className="mt-0.5 sm:mt-1 line-clamp-2 text-xs sm:text-sm">
                                {resource.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0 relative z-10">
                          <motion.div
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <Button 
                              variant="outline" 
                              size="sm" 
                              asChild 
                              className="min-h-[40px] sm:min-h-[36px] w-full sm:w-auto"
                            >
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                aria-label={`Open ${resource.title} in new tab`}
                              >
                                <motion.div
                                  whileHover={{ rotate: -45 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                </motion.div>
                                View Resource
                              </a>
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        )
      })}

      {(!resources || resources.length === 0) && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No resources available yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ResourcesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((j) => (
              <Card key={j}>
                <CardHeader>
                  <Skeleton className="h-16 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
