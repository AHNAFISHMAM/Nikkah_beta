import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'
import { Skeleton } from '../../components/ui/skeleton'
import { BookOpen, CheckCircle } from 'lucide-react'

interface Module {
  id: string
  title: string
  description: string
  order_index: number
}

interface ModuleNote {
  module_id: string
  is_completed: boolean
}

export default function ModulesPage() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['modules', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const [
        { data: modules },
        { data: notes }
      ] = await Promise.all([
        supabase.from('modules').select('*').order('order_index'),
        supabase.from('module_notes').select('module_id, is_completed').eq('user_id', user.id)
      ])

      return { modules, notes }
    },
    enabled: !!user,
  })

  if (isLoading) {
    return <ModulesSkeleton />
  }

  const modules = data?.modules as Module[] || []
  const notes = data?.notes as ModuleNote[] || []

  const completedCount = notes.filter(n => n.is_completed).length
  const totalModules = modules.length
  const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0

  const isModuleCompleted = (moduleId: string) => {
    return notes.some(n => n.module_id === moduleId && n.is_completed)
  }

  return (
    <div className="space-y-6">
      <SEO
        title={PAGE_SEO.modules.title}
        description={PAGE_SEO.modules.description}
        path="/dashboard/modules"
        noIndex
      />

      <div className="space-y-0.5 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Learning Modules</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Islamic marriage preparation content
        </p>
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
            {completedCount} of {totalModules} modules completed
          </p>
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
        {modules.map((module, index) => {
          const completed = isModuleCompleted(module.id)
          return (
            <Link key={module.id} to={`/dashboard/modules/${module.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                        completed ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                      }`}>
                        {completed ? (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg">
                          Module {index + 1}
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {module.title}
                        </p>
                      </div>
                    </div>
                    {completed && (
                      <span className="text-[10px] sm:text-xs bg-green-100 text-green-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap shrink-0">
                        Done
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                    {module.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function ModulesSkeleton() {
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
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
