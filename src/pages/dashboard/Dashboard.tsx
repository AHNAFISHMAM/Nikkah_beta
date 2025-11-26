import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { useDashboardData, RecentActivity } from '../../hooks/useDashboardData'
import { useReminders } from '../../hooks/useReminders'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
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
      <motion.div
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-4 sm:p-6 border border-primary/10 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.6, -0.05, 0.01, 0.99],
        }}
      >
        {/* Animated gradient background overlay */}
        <motion.div
          className="absolute inset-0 opacity-50"
          animate={{
            background: [
              "radial-gradient(circle at 0% 50%, rgba(0, 255, 135, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 50%, rgba(184, 50, 128, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 50%, rgba(0, 255, 135, 0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="relative z-10"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
              },
            },
          }}
        >
          {/* Arabic greeting with fade-in */}
          <motion.p
            className="text-xs sm:text-sm text-brand font-medium mb-0.5 sm:mb-1"
            variants={{
              hidden: { opacity: 0, y: -10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                },
              },
            }}
          >
            {greeting.arabic}
          </motion.p>

          {/* Main greeting with animated gradient text */}
          <motion.h1
            className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            <motion.span
              className="bg-gradient-to-r from-islamic-green via-islamic-gold to-islamic-purple bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift inline-block"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 12,
                  },
                },
              }}
            >
              {greeting.english},
            </motion.span>
            {' '}
            <motion.span
              className="text-foreground inline-block"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 12,
                    delay: 0.1,
                  },
                },
              }}
            >
              {profile?.first_name || 'there'}!
            </motion.span>
          </motion.h1>

          {/* Subtitle with fade-in */}
          <motion.p
            className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  delay: 0.3,
                  duration: 0.5,
                },
              },
            }}
          >
            Welcome to your marriage preparation journey
          </motion.p>
        </motion.div>

        {/* Animated Sparkles icon */}
        <motion.div
          className="absolute right-3 sm:right-4 top-3 sm:top-4 z-0"
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{
            opacity: 0.3,
            scale: 1,
            rotate: 0,
          }}
          transition={{
            delay: 0.4,
            duration: 0.6,
            type: "spring",
            stiffness: 200,
          }}
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-brand" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4 items-stretch"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.15, // 150ms - more noticeable stagger (best practice: 50-100ms, but cards benefit from 120-150ms)
              delayChildren: 0.1, // 100ms initial delay
            },
          },
        }}
      >
        {/* Readiness Score */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.9 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.5, // 500ms - best practice: 200-500ms for complex transitions
              },
            },
          }}
        >
          <motion.div
            whileHover={{
              y: -6,
              scale: 1.02,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 17,
              },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="group relative overflow-hidden h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Readiness</CardTitle>
                <motion.div
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full icon-chip flex items-center justify-center shadow-sm"
                  whileHover={{
                    scale: 1.15,
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    rotate: {
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }}
                >
                  <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </motion.div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 flex-1 flex flex-col">
                <motion.div
                  className="text-2xl sm:text-3xl font-bold text-brand"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  {readinessScore}%
                </motion.div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  style={{ originX: 0 }}
                  className="mt-2 sm:mt-3"
                >
                  <Progress value={readinessScore} variant="islamic" size="sm" />
                </motion.div>
                <motion.p
                  className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {completedCount}/{totalItems} complete
                </motion.p>
              </CardContent>
              {/* Hover shadow overlay */}
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{
                  opacity: 1,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.3 }}
              />
            </Card>
          </motion.div>
        </motion.div>

        {/* Wedding Countdown */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.9 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.5, // 500ms - best practice: 200-500ms for complex transitions
              },
            },
          }}
        >
          <motion.div
            whileHover={{
              y: -6,
              scale: 1.02,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 17,
              },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="group relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Wedding</CardTitle>
                <motion.div
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full icon-chip flex items-center justify-center shadow-sm"
                  whileHover={{
                    scale: 1.15,
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    rotate: {
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }}
                >
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </motion.div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 flex-1 flex flex-col">
                {daysUntilWedding !== null ? (
                  <>
                    <motion.div
                      className="text-2xl sm:text-3xl font-bold text-brand"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.3,
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      {daysUntilWedding}
                    </motion.div>
                    {/* Spacer to match progress bar height */}
                    <div className="h-2 sm:h-3 mt-2 sm:mt-3" />
                    <motion.p
                      className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {daysUntilWedding > 0 ? 'days left' : 'Congrats!'}
                    </motion.p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl sm:text-3xl font-bold text-muted-foreground">--</div>
                    {/* Spacer to match progress bar height */}
                    <div className="h-2 sm:h-3 mt-2 sm:mt-3" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                      Set in profile
                    </p>
                  </>
                )}
              </CardContent>
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{
                  opacity: 1,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.3 }}
              />
            </Card>
          </motion.div>
        </motion.div>

        {/* Budget Summary */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.9 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.5, // 500ms - best practice: 200-500ms for complex transitions
              },
            },
          }}
        >
          <motion.div
            whileHover={{
              y: -6,
              scale: 1.02,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 17,
              },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="group relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Budget</CardTitle>
                <motion.div
                  className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center ${surplus >= 0 ? 'bg-success/10' : 'bg-error/10'}`}
                  whileHover={{
                    scale: 1.15,
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    rotate: {
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }}
                >
                  <DollarSign className={`h-3 w-3 sm:h-4 sm:w-4 ${surplus >= 0 ? 'text-success' : 'text-error'}`} />
                </motion.div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 flex-1 flex flex-col">
                {hasBudget ? (
                  <>
                    <motion.div
                      className={`text-2xl sm:text-3xl font-bold ${surplus >= 0 ? 'text-success' : 'text-error'}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.3,
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      ${surplus.toLocaleString()}
                    </motion.div>
                    {/* Spacer to match progress bar height */}
                    <div className="h-2 sm:h-3 mt-2 sm:mt-3" />
                    <motion.p
                      className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {totalIncome > 0 ? (
                        <>${totalIncome.toLocaleString()} income • ${totalExpenses.toLocaleString()} expenses</>
                      ) : (
                        surplus >= 0 ? 'Looking good!' : 'Review budget'
                      )}
                    </motion.p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl sm:text-3xl font-bold text-muted-foreground">--</div>
                    {/* Spacer to match progress bar height */}
                    <div className="h-2 sm:h-3 mt-2 sm:mt-3" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                      Set up budget
                    </p>
                  </>
                )}
              </CardContent>
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{
                  opacity: 1,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.3 }}
              />
            </Card>
          </motion.div>
        </motion.div>

        {/* Modules Progress */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.9 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.5, // 500ms - best practice: 200-500ms for complex transitions
              },
            },
          }}
        >
          <motion.div
            whileHover={{
              y: -6,
              scale: 1.02,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 17,
              },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="group relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Learning</CardTitle>
                <motion.div
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full icon-chip flex items-center justify-center shadow-sm"
                  whileHover={{
                    scale: 1.15,
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    rotate: {
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }}
                >
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </motion.div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0 flex-1 flex flex-col">
                <motion.div
                  className="text-2xl sm:text-3xl font-bold text-brand"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  {modulesCompleted}/{totalModules}
                </motion.div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  style={{ originX: 0 }}
                  className="mt-2 sm:mt-3"
                >
                  <Progress value={(modulesCompleted / totalModules) * 100} variant="success" size="sm" />
                </motion.div>
                <motion.p
                  className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  modules done
                </motion.p>
              </CardContent>
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{
                  opacity: 1,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.3 }}
              />
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }} // Trigger when 100px before entering viewport
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1, // 100ms stagger for quick actions (best practice: 50-100ms)
              delayChildren: 0.1,
            },
          },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 15,
                duration: 0.4,
              },
            },
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.02,
              y: -2,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 17,
              },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/dashboard/checklist"
              className="group relative flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/60 min-h-[60px] sm:min-h-[72px] cursor-pointer overflow-hidden"
            >
              {/* Ripple effect on click */}
              <motion.div
                className="absolute inset-0 bg-brand/10 rounded-xl"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{
                  scale: 2,
                  opacity: [0, 0.3, 0],
                  transition: { duration: 0.4 },
                }}
              />
              
              {/* Border glow on hover */}
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{
                  opacity: 1,
                  borderColor: "rgba(0, 255, 135, 0.4)",
                  boxShadow: "0 0 0 1px rgba(0, 255, 135, 0.2)",
                }}
                transition={{ duration: 0.2 }}
              />

              <motion.div
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg icon-chip flex items-center justify-center shrink-0 relative z-10"
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0 relative z-10">
                <p className="font-medium text-xs sm:text-sm">Checklist</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">Track progress</p>
              </div>
              <motion.div
                className="hidden sm:block relative z-10"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-brand" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 15,
                duration: 0.4,
              },
            },
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.02,
              y: -2,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 17,
              },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/dashboard/financial"
              className="group relative flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/60 min-h-[60px] sm:min-h-[72px] cursor-pointer overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-brand/10 rounded-xl"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{
                  scale: 2,
                  opacity: [0, 0.3, 0],
                  transition: { duration: 0.4 },
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{
                  opacity: 1,
                  borderColor: "rgba(0, 255, 135, 0.4)",
                  boxShadow: "0 0 0 1px rgba(0, 255, 135, 0.2)",
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg icon-chip flex items-center justify-center shrink-0 relative z-10"
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0 relative z-10">
                <p className="font-medium text-xs sm:text-sm">Financial</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">Manage budget</p>
              </div>
              <motion.div
                className="hidden sm:block relative z-10"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-brand" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 15,
                duration: 0.4,
              },
            },
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.02,
              y: -2,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 17,
              },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/dashboard/modules"
              className="group relative flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/60 min-h-[60px] sm:min-h-[72px] cursor-pointer overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-brand/10 rounded-xl"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{
                  scale: 2,
                  opacity: [0, 0.3, 0],
                  transition: { duration: 0.4 },
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{
                  opacity: 1,
                  borderColor: "rgba(0, 255, 135, 0.4)",
                  boxShadow: "0 0 0 1px rgba(0, 255, 135, 0.2)",
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg icon-chip flex items-center justify-center shrink-0 relative z-10"
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0 relative z-10">
                <p className="font-medium text-xs sm:text-sm">Learn</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">Education</p>
              </div>
              <motion.div
                className="hidden sm:block relative z-10"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-brand" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 15,
                duration: 0.4,
              },
            },
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.02,
              y: -2,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 17,
              },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/dashboard/discussions"
              className="group relative flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/60 min-h-[60px] sm:min-h-[72px] cursor-pointer overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-brand/10 rounded-xl"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{
                  scale: 2,
                  opacity: [0, 0.3, 0],
                  transition: { duration: 0.4 },
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{
                  opacity: 1,
                  borderColor: "rgba(0, 255, 135, 0.4)",
                  boxShadow: "0 0 0 1px rgba(0, 255, 135, 0.2)",
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg icon-chip flex items-center justify-center shrink-0 relative z-10"
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0 relative z-10">
                <p className="font-medium text-xs sm:text-sm">Discuss</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">Conversations</p>
              </div>
              <motion.div
                className="hidden sm:block relative z-10"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-brand" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Pending Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }} // Trigger when 100px before entering viewport
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <motion.div
                initial={{ rotate: 0 }}
                whileInView={{
                  rotate: [0, 5, -5, 0],
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              >
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
              </motion.div>
              Suggested Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <motion.ul
              className="space-y-2 sm:space-y-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }} // Trigger when 50px before entering viewport
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1, // 100ms stagger for list items (best practice: 50-100ms)
                    delayChildren: 0.1,
                  },
                },
              }}
            >
            {completedCount < totalItems && (
              <motion.li
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      duration: 0.4,
                    },
                  },
                }}
              >
                <Link
                  to="/dashboard/checklist"
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-accent transition-colors group min-h-[56px] active:bg-accent/80 cursor-pointer"
                >
                  <motion.div
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full icon-chip flex items-center justify-center shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckSquare className="h-4 w-4 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium group-hover:text-brand transition-colors">Complete readiness checklist</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{totalItems - completedCount} items remaining</p>
                  </div>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowRight 
                      className="h-4 w-4 text-brand transition-all shrink-0" 
                    />
                  </motion.div>
                </Link>
              </motion.li>
            )}
            {modulesCompleted < totalModules && (
              <motion.li
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      duration: 0.4,
                    },
                  },
                }}
              >
                <Link
                  to="/dashboard/modules"
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-accent transition-colors group min-h-[56px] active:bg-accent/80 cursor-pointer"
                >
                  <motion.div
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full icon-chip flex items-center justify-center shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <BookOpen className="h-4 w-4 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium group-hover:text-brand transition-colors">Continue learning modules</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{totalModules - modulesCompleted} modules remaining</p>
                  </div>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowRight 
                      className="h-4 w-4 text-brand transition-all shrink-0" 
                    />
                  </motion.div>
                </Link>
              </motion.li>
            )}
            {!hasBudget && (
              <motion.li
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      duration: 0.4,
                    },
                  },
                }}
              >
                <Link
                  to="/dashboard/financial"
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-accent transition-colors group min-h-[56px] active:bg-accent/80 cursor-pointer"
                >
                  <motion.div
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full icon-chip flex items-center justify-center shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <DollarSign className="h-4 w-4 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium group-hover:text-brand transition-colors">Set up your budget</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Plan your finances together</p>
                  </div>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowRight 
                      className="h-4 w-4 text-brand transition-all shrink-0" 
                    />
                  </motion.div>
                </Link>
              </motion.li>
            )}
            {readinessScore === 100 && modulesCompleted === totalModules && (
              <motion.li
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-success/10 border border-success/20"
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      duration: 0.4,
                    },
                  },
                }}
              >
                <motion.div
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-success/20 flex items-center justify-center shrink-0"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-success">Mashallah!</p>
                  <p className="text-[10px] sm:text-xs text-success/80">You&apos;ve completed all preparation tasks!</p>
                </div>
              </motion.li>
            )}
            </motion.ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }} // Trigger when 100px before entering viewport
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <motion.div
                  initial={{ rotate: 0 }}
                  whileInView={{
                    rotate: [0, 5, -5, 0],
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                >
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
                </motion.div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              <motion.ul
                className="space-y-2 sm:space-y-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }} // Trigger when 50px before entering viewport
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1, // 100ms stagger for list items (best practice: 50-100ms)
                      delayChildren: 0.1,
                    },
                  },
                }}
              >
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={activity.id} activity={activity} index={index} />
                ))}
              </motion.ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

function ActivityItem({ activity, index }: { activity: RecentActivity; index: number }) {
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
    <motion.div
      className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg group min-h-[56px] relative overflow-hidden"
      variants={{
        hidden: {
          opacity: 0,
          x: -20,
          scale: 0.95,
        },
        visible: {
          opacity: 1,
          x: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.4,
          },
        },
      }}
      whileHover={{
        x: 4,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 17,
        },
      }}
    >
      {/* Background color on hover */}
      <motion.div
        className="absolute inset-0 bg-accent rounded-lg"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* Icon container */}
      <motion.div
        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-accent flex items-center justify-center shrink-0 relative z-10"
        whileHover={{
          scale: 1.1,
          rotate: 5,
        }}
        transition={{ type: "spring", stiffness: 300 }}
        variants={{
          hidden: { scale: 0, rotate: -180 },
          visible: {
            scale: 1,
            rotate: 0,
            transition: {
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: index * 0.1,
            },
          },
        }}
      >
        {getActivityIcon()}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0 relative z-10">
        <motion.p
          className="text-xs sm:text-sm font-medium"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delay: index * 0.1 + 0.05,
                duration: 0.3,
              },
            },
          }}
          whileHover={{ color: "hsl(var(--brand))" }}
        >
          {activity.title}
        </motion.p>
        <motion.p
          className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delay: index * 0.1 + 0.1,
                duration: 0.3,
              },
            },
          }}
        >
          {activity.description}
        </motion.p>
        <motion.div
          className="flex items-center gap-1.5 mt-0.5"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delay: index * 0.1 + 0.15,
                duration: 0.3,
              },
            },
          }}
        >
          <Clock className="h-3 w-3 text-muted-foreground" />
          <p className="text-[10px] sm:text-xs text-muted-foreground">{timeAgo}</p>
        </motion.div>
      </div>

      {/* Arrow icon */}
      {activity.link && (
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0, x: -10 }}
          whileHover={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
          }}
        >
          <ArrowRight className="h-4 w-4 text-brand shrink-0" />
        </motion.div>
      )}
    </motion.div>
  )

  if (activity.link) {
    return (
      <motion.li
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Link to={activity.link} className="block">
          {content}
        </Link>
      </motion.li>
    )
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {content}
    </motion.li>
  )
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
