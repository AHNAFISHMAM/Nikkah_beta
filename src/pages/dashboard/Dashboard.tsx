import { Link } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { useDashboardData, RecentActivity } from '../../hooks/useDashboardData'
import { useReminders } from '../../hooks/useReminders'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { Skeleton } from '../../components/ui/skeleton'
import { ReminderBanner } from '../../components/ReminderBanner'
import { CheckSquare, DollarSign, BookOpen, MessageSquare, Calendar, TrendingUp, Sparkles, ArrowRight, Clock, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Time-based greeting
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { english: 'Good morning', arabic: 'صباح الخير' }
  if (hour < 17) return { english: 'Good afternoon', arabic: 'مساء الخير' }
  return { english: 'Good evening', arabic: 'مساء النور' }
}

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardData()
  const { reminders, dismissReminder } = useReminders()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">Failed to load dashboard data</p>
      </div>
    )
  }

  if (!data) return null

  const {
    profile,
    readinessScore,
    completedCount,
    totalItems,
    daysUntilWedding,
    surplus,
    totalIncome,
    totalExpenses,
    modulesCompleted,
    totalModules,
    hasBudget,
    recentActivity,
  } = data

  const greeting = getGreeting()

  return (
    <div className="space-y-6 animate-fade-in">
      <SEO
        title={PAGE_SEO.dashboard.title}
        description={PAGE_SEO.dashboard.description}
        path="/dashboard"
        noIndex
      />

      {/* Gentle Reminders */}
      {reminders.length > 0 && (
        <div className="space-y-3">
          {reminders.slice(0, 2).map((reminder) => (
            <ReminderBanner
              key={reminder.id}
              title={reminder.title}
              description={reminder.description}
              action={reminder.action}
              priority={reminder.priority}
              onDismiss={() => dismissReminder(reminder.id)}
            />
          ))}
        </div>
      )}

      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-4 sm:p-6 border border-primary/10 mt-4">
        <div className="relative z-10">
          <p className="text-xs sm:text-sm text-brand font-medium mb-0.5 sm:mb-1">{greeting.arabic}</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
            {greeting.english}, {profile?.first_name || 'there'}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
            Welcome to your marriage preparation journey
          </p>
        </div>
        <Sparkles className="absolute right-3 sm:right-4 top-3 sm:top-4 h-6 w-6 sm:h-8 sm:w-8 text-brand opacity-30" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
        {/* Readiness Score */}
        <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Readiness</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full icon-chip flex items-center justify-center shadow-sm">
              <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-brand animate-count">{readinessScore}%</div>
            <Progress value={readinessScore} variant="islamic" size="sm" className="mt-2 sm:mt-3" />
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
              {completedCount}/{totalItems} complete
            </p>
          </CardContent>
        </Card>

        {/* Wedding Countdown */}
        <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Wedding</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full icon-chip flex items-center justify-center shadow-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            {daysUntilWedding !== null ? (
              <>
                <div className="text-2xl sm:text-3xl font-bold text-brand animate-count">{daysUntilWedding}</div>
                <p className="text-[10px] sm:text-sm text-muted-foreground mt-1">
                  {daysUntilWedding > 0 ? 'days left' : 'Congrats!'}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl sm:text-3xl font-bold text-muted-foreground">--</div>
                <p className="text-[10px] sm:text-sm text-muted-foreground mt-1">
                  Set in profile
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Budget Summary */}
        <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Budget</CardTitle>
            <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center ${surplus >= 0 ? 'bg-success/10' : 'bg-error/10'}`}>
              <DollarSign className={`h-3 w-3 sm:h-4 sm:w-4 ${surplus >= 0 ? 'text-success' : 'text-error'}`} />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            {hasBudget ? (
              <>
                <div className={`text-xl sm:text-3xl font-bold animate-count ${surplus >= 0 ? 'text-success' : 'text-error'}`}>
                  ${surplus.toLocaleString()}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                  {totalIncome > 0 ? (
                    <>${totalIncome.toLocaleString()} income • ${totalExpenses.toLocaleString()} expenses</>
                  ) : (
                    surplus >= 0 ? 'Looking good!' : 'Review budget'
                  )}
                </p>
              </>
            ) : (
              <>
                <div className="text-xl sm:text-3xl font-bold text-muted-foreground">--</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                  Set up budget
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Modules Progress */}
        <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Learning</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full icon-chip flex items-center justify-center shadow-sm">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-brand animate-count">{modulesCompleted}/{totalModules}</div>
            <Progress value={(modulesCompleted / totalModules) * 100} variant="success" size="sm" className="mt-2 sm:mt-3" />
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
              modules done
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Link
          to="/dashboard/checklist"
          className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/60 hover:border-[#00FF87]/40 hover:shadow-md transition-all duration-200 active:scale-[0.98] min-h-[60px] sm:min-h-[72px] cursor-pointer"
        >
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg icon-chip flex items-center justify-center transition-opacity shrink-0 group-hover:opacity-90">
            <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs sm:text-sm">Checklist</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">Track progress</p>
          </div>
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-brand transition-all hidden sm:block" />
        </Link>

        <Link
          to="/dashboard/financial"
          className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/60 hover:border-[#00FF87]/40 hover:shadow-md transition-all duration-200 active:scale-[0.98] min-h-[60px] sm:min-h-[72px] cursor-pointer"
        >
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg icon-chip flex items-center justify-center transition-opacity shrink-0 group-hover:opacity-90">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs sm:text-sm">Financial</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">Manage budget</p>
          </div>
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-brand transition-all hidden sm:block" />
        </Link>

        <Link
          to="/dashboard/modules"
          className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/60 hover:border-[#00FF87]/40 hover:shadow-md transition-all duration-200 active:scale-[0.98] min-h-[60px] sm:min-h-[72px] cursor-pointer"
        >
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg icon-chip flex items-center justify-center transition-opacity shrink-0 group-hover:opacity-90">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs sm:text-sm">Learn</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">Education</p>
          </div>
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-brand transition-all hidden sm:block" />
        </Link>

        <Link
          to="/dashboard/discussions"
          className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/60 hover:border-[#00FF87]/40 hover:shadow-md transition-all duration-200 active:scale-[0.98] min-h-[60px] sm:min-h-[72px] cursor-pointer"
        >
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg icon-chip flex items-center justify-center transition-opacity shrink-0 group-hover:opacity-90">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs sm:text-sm">Discuss</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">Conversations</p>
          </div>
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-brand transition-all hidden sm:block" />
        </Link>
      </div>

      {/* Pending Tasks */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
            Suggested Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <ul className="space-y-2 sm:space-y-3">
            {completedCount < totalItems && (
              <li>
                <Link
                  to="/dashboard/checklist"
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-accent transition-colors group min-h-[56px] active:bg-accent/80 cursor-pointer"
                >
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full icon-chip flex items-center justify-center shrink-0 transition-opacity group-hover:opacity-90">
                    <CheckSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium group-hover:text-brand transition-colors">Complete readiness checklist</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{totalItems - completedCount} items remaining</p>
                  </div>
                  <ArrowRight 
                    className="h-4 w-4 text-brand transition-all shrink-0 group-hover:translate-x-1" 
                  />
                </Link>
              </li>
            )}
            {modulesCompleted < totalModules && (
              <li>
                <Link
                  to="/dashboard/modules"
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-accent transition-colors group min-h-[56px] active:bg-accent/80 cursor-pointer"
                >
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full icon-chip flex items-center justify-center shrink-0 transition-opacity group-hover:opacity-90">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium group-hover:text-brand transition-colors">Continue learning modules</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{totalModules - modulesCompleted} modules remaining</p>
                  </div>
                  <ArrowRight 
                    className="h-4 w-4 text-brand transition-all shrink-0 group-hover:translate-x-1" 
                  />
                </Link>
              </li>
            )}
            {!hasBudget && (
              <li>
                <Link
                  to="/dashboard/financial"
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-accent transition-colors group min-h-[56px] active:bg-accent/80 cursor-pointer"
                >
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full icon-chip flex items-center justify-center shrink-0 transition-opacity group-hover:opacity-90">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium group-hover:text-brand transition-colors">Set up your budget</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Plan your finances together</p>
                  </div>
                  <ArrowRight 
                    className="h-4 w-4 text-brand transition-all shrink-0 group-hover:translate-x-1" 
                  />
                </Link>
              </li>
            )}
            {readinessScore === 100 && modulesCompleted === totalModules && (
              <li className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-success">Mashallah!</p>
                  <p className="text-[10px] sm:text-xs text-success/80">You've completed all preparation tasks!</p>
                </div>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <ul className="space-y-2 sm:space-y-3">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </ul>
            {recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity. Start completing tasks to see your progress here!
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'checklist':
        return <CheckSquare className="h-4 w-4 text-success" />
      case 'module':
        return <BookOpen className="h-4 w-4 text-primary" />
      case 'discussion':
        return <MessageSquare className="h-4 w-4 text-islamic-purple" />
      case 'budget':
        return <DollarSign className="h-4 w-4 text-islamic-gold" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })

  const content = (
    <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-accent transition-colors group min-h-[56px]">
      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-accent flex items-center justify-center shrink-0 transition-opacity group-hover:opacity-90">
        {getActivityIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium group-hover:text-brand transition-colors">
          {activity.title}
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
          {activity.description}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <p className="text-[10px] sm:text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>
      {activity.link && (
        <ArrowRight className="h-4 w-4 text-brand transition-all shrink-0 group-hover:translate-x-1 opacity-0 group-hover:opacity-100" />
      )}
    </div>
  )

  if (activity.link) {
    return (
      <li>
        <Link to={activity.link} className="block">
          {content}
        </Link>
      </li>
    )
  }

  return <li>{content}</li>
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-2 w-full mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
