import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SEO } from '../../components/SEO'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useConfetti } from '../../hooks/useConfetti'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Skeleton } from '../../components/ui/skeleton'
import { Progress } from '../../components/ui/progress'
import { ArrowLeft, CheckCircle, BookOpen, Download, Clock, Target, Lightbulb, FileText, Printer, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { generateModulePDF } from '../../lib/modulePdf'
import toast from 'react-hot-toast'
import { logError } from '../../lib/logger'

// Module metadata with learning objectives and estimated time
const MODULE_METADATA: Record<string, {
  estimatedTime: string
  learningObjectives: string[]
  keyTakeaways: string[]
  reflectionQuestions: string[]
}> = {
  '1': {
    estimatedTime: '45-60 minutes',
    learningObjectives: [
      'Understand the Islamic foundations of marriage (Nikah)',
      'Learn the pillars and conditions of a valid marriage contract',
      'Understand the rights and responsibilities of both spouses',
      'Identify and address common misconceptions about Islamic marriage'
    ],
    keyTakeaways: [
      'Marriage in Islam is a sacred covenant (mithaqan ghaleeza)',
      'A valid Nikah requires a guardian, witnesses, mahr, and consent',
      'Both spouses have specific rights and responsibilities',
      'Kind treatment and mutual respect are fundamental Islamic principles'
    ],
    reflectionQuestions: [
      'What does marriage mean to you in light of Islamic teachings?',
      'How will you ensure you fulfill your spouse\'s rights?',
      'What misconceptions about Islamic marriage have you encountered?',
      'How can you prepare yourself to be a good spouse according to Islamic principles?'
    ]
  },
  '2': {
    estimatedTime: '40-50 minutes',
    learningObjectives: [
      'Learn effective communication strategies in marriage',
      'Understand Islamic etiquette for resolving conflicts',
      'Recognize when to seek professional counseling',
      'Develop skills for healthy marital communication'
    ],
    keyTakeaways: [
      'Effective communication is essential for a successful marriage',
      'Islam provides clear guidance on resolving conflicts with kindness',
      'Seeking help is encouraged when needed',
      'Patience and understanding are key to resolving disagreements'
    ],
    reflectionQuestions: [
      'What communication patterns do you want to establish in your marriage?',
      'How will you handle disagreements with your spouse?',
      'What are your triggers, and how can you communicate about them?',
      'When would you consider seeking counseling?'
    ]
  },
  '3': {
    estimatedTime: '35-45 minutes',
    learningObjectives: [
      'Understand Islamic rulings on intimacy in marriage',
      'Learn about permissible contraception methods',
      'Plan for family size and timing',
      'Access reliable Islamic resources on family planning'
    ],
    keyTakeaways: [
      'Intimacy in marriage is encouraged and blessed in Islam',
      'Both spouses have rights regarding intimacy',
      'Family planning is permissible with mutual agreement',
      'Seek knowledge from authentic Islamic sources'
    ],
    reflectionQuestions: [
      'What are your expectations regarding intimacy in marriage?',
      'How do you plan to discuss family planning with your spouse?',
      'What are your thoughts on family size and timing?',
      'How will you ensure you follow Islamic guidelines?'
    ]
  },
  '4': {
    estimatedTime: '50-60 minutes',
    learningObjectives: [
      'Understand Islamic principles of financial management',
      'Learn about joint vs separate finances in Islam',
      'Understand Zakat obligations and calculations',
      'Learn how to avoid interest (riba) in financial dealings'
    ],
    keyTakeaways: [
      'Financial harmony is crucial for marital success',
      'Islam provides clear guidance on money management',
      'Zakat is an obligation that strengthens the community',
      'Avoiding interest is a fundamental Islamic principle'
    ],
    reflectionQuestions: [
      'How will you and your spouse manage finances together?',
      'What are your financial goals as a couple?',
      'How will you ensure you fulfill Zakat obligations?',
      'What steps will you take to avoid interest?'
    ]
  },
  '5': {
    estimatedTime: '40-50 minutes',
    learningObjectives: [
      'Understand the rights of parents and in-laws in Islam',
      'Learn to balance relationships with family and spouse',
      'Establish healthy boundaries while maintaining respect',
      'Distinguish between cultural practices and Islamic teachings'
    ],
    keyTakeaways: [
      'Respecting parents and in-laws is an Islamic obligation',
      'Balance is key in maintaining family relationships',
      'Healthy boundaries protect the marriage',
      'Cultural practices should align with Islamic principles'
    ],
    reflectionQuestions: [
      'How will you balance your spouse\'s needs with family obligations?',
      'What boundaries do you need to establish with extended family?',
      'How will you handle cultural expectations that may conflict with Islamic principles?',
      'What role do you want your families to play in your marriage?'
    ]
  }
}

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { triggerCelebration } = useConfetti()
  const [notes, setNotes] = useState('')
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>({})
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['module', id, user?.id],
    queryFn: async () => {
      if (!user || !id) throw new Error('Invalid request')

      const [
        { data: module },
        { data: allModules },
        userNotesResult
      ] = await Promise.all([
        supabase.from('modules').select('*').eq('id', id).single(),
        supabase.from('modules').select('id, title, order_index').order('order_index'),
        supabase.from('module_notes').select('*').eq('user_id', user.id).eq('module_id', id).maybeSingle()
      ])

      const userNotes = userNotesResult.data

      if (userNotes?.notes) {
        setNotes(userNotes.notes)
      }

      // Find next and previous modules
      const currentIndex = allModules?.findIndex(m => m.id === id) ?? -1
      const nextModule = currentIndex >= 0 && currentIndex < (allModules?.length ?? 0) - 1
        ? allModules?.[currentIndex + 1]
        : null
      const prevModule = currentIndex > 0
        ? allModules?.[currentIndex - 1]
        : null

      return { module, userNotes, nextModule, prevModule }
    },
    enabled: !!user && !!id,
  })

  const saveMutation = useMutation({
    mutationFn: async ({ isCompleted }: { isCompleted?: boolean }) => {
      if (!user || !id) throw new Error('Invalid request')

      const updateData: Record<string, unknown> = {
        user_id: user.id,
        module_id: id,
        notes,
      }

      if (isCompleted !== undefined) {
        updateData.is_completed = isCompleted
      }

      const { error } = await supabase
        .from('module_notes')
        .upsert(updateData, {
          onConflict: 'user_id,module_id'
        })

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['module'] })
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })

      if (variables.isCompleted !== undefined) {
        if (variables.isCompleted) {
          triggerCelebration()
          toast.success('Mashallah! Module completed!', { 
            icon: '📚',
            duration: 5000 
          })
        } else {
          toast.success('Module marked as incomplete')
        }
      } else {
        toast.success('Notes saved!')
      }
    },
    onError: () => {
      toast.error('Failed to save')
    },
  })

  // Extract data (hooks must be called before early returns)
  const module = data?.module
  const userNotes = data?.userNotes
  const nextModule = data?.nextModule
  const prevModule = data?.prevModule
  const isCompleted = userNotes?.is_completed || false

  // Get module metadata based on order_index (MUST be before early return)
  const moduleMetadata = useMemo(() => {
    if (!module) return null
    return MODULE_METADATA[module.order_index.toString()] || {
      estimatedTime: '45-60 minutes',
      learningObjectives: [],
      keyTakeaways: [],
      reflectionQuestions: []
    }
  }, [module])

  // Calculate reading progress (MUST be before early return)
  const readingProgress = useMemo(() => {
    if (!module?.content) return 0
    // Estimate: average reading speed is 200-250 words per minute
    // Assume user has read if they've scrolled or spent time
    // For now, return 0 if not completed, 100 if completed
    return isCompleted ? 100 : 0
  }, [module, isCompleted])

  // Early return AFTER all hooks
  if (isLoading) {
    return <ModuleDetailSkeleton />
  }

  const handleDownloadPDF = async () => {
    if (!module) return
    
    setIsGeneratingPDF(true)
    try {
      await generateModulePDF(
        module.title,
        module.description || '',
        module.content || '',
        notes,
        isCompleted,
        userNotes?.completed_at || null
      )
      toast.success('PDF downloaded successfully!', { icon: '📄' })
    } catch (error) {
      logError('PDF generation error', error, 'ModuleDetail')
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!module) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Module not found</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard/modules">Back to Modules</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SEO
        title={module.title}
        description={module.description || 'Learn about Islamic marriage preparation.'}
        path={`/dashboard/modules/${id}`}
        noIndex
      />

      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/modules">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
        <div className="flex-1 min-w-0">
          <motion.div
            className="flex items-center gap-2 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold">{module.title}</h1>
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  className="flex items-center gap-1.5 text-success bg-success/10 px-3 py-1.5 rounded-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <CheckCircle className="h-5 w-5" />
                  </motion.div>
                  <span className="text-sm font-medium">Completed</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <motion.p
            className="text-sm sm:text-base text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          >
            {module.description}
          </motion.p>
          {moduleMetadata && (
            <motion.div
              className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.7 }}
            >
              <motion.div
                className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground"
                whileHover={{ scale: 1.05 }}
              >
                <Clock className="h-4 w-4" />
                <span>Est. {moduleMetadata.estimatedTime}</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground"
                whileHover={{ scale: 1.05 }}
              >
                <BookOpen className="h-4 w-4" />
                <span>Module {module.order_index}</span>
              </motion.div>
            </motion.div>
          )}
        </div>
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="print:hidden"
            >
              <motion.div
                className="flex items-center"
                animate={isGeneratingPDF ? { rotate: 360 } : {}}
                transition={isGeneratingPDF ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
              >
                <Download className="h-4 w-4 mr-2" />
              </motion.div>
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="print:hidden"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Progress Indicator */}
      <AnimatePresence>
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30, height: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="print:hidden"
          >
            <Card>
              <CardContent className="p-4">
                <motion.div
                  className="flex items-center justify-between mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="text-sm font-medium">Reading Progress</span>
                  <motion.span
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    {readingProgress}%
                  </motion.span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                >
                  <Progress value={readingProgress} variant="islamic" size="sm" />
                </motion.div>
                <motion.p
                  className="text-xs text-muted-foreground mt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Mark as complete when you finish reading
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Learning Objectives */}
      {moduleMetadata && moduleMetadata.learningObjectives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0px' }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="print:hidden"
        >
          <Card>
            <CardHeader className="pb-3">
              <motion.div
                className="text-base sm:text-lg flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Target className="h-5 w-5 text-primary" />
                </motion.div>
                <CardTitle>Learning Objectives</CardTitle>
              </motion.div>
              <CardDescription className="text-xs sm:text-sm">
                What you'll learn from this module
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.ul
                className="space-y-2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2,
                    },
                  },
                }}
              >
                {moduleMetadata.learningObjectives.map((objective, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-2 text-sm"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                    >
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    </motion.div>
                    <span>{objective}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1, margin: '-150px 0px 0px 0px' }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1, margin: '-150px 0px 0px 0px' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <BookOpen className="h-5 w-5" />
              </motion.div>
              <CardTitle>Module Content</CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div
              className="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-ul:my-4 prose-ol:my-4"
              dangerouslySetInnerHTML={{ __html: module.content || 'No content available.' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1, margin: '-150px 0px 0px 0px' }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Takeaways */}
      {moduleMetadata && moduleMetadata.keyTakeaways.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0px' }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="print:hidden"
        >
          <Card>
            <CardHeader className="pb-3">
              <motion.div
                className="text-base sm:text-lg flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Lightbulb className="h-5 w-5 text-warning" />
                </motion.div>
                <CardTitle>Key Takeaways</CardTitle>
              </motion.div>
              <CardDescription className="text-xs sm:text-sm">
                Important points to remember
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.ul
                className="space-y-2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2,
                    },
                  },
                }}
              >
                {moduleMetadata.keyTakeaways.map((takeaway, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-2 text-sm"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-warning mt-2 shrink-0" />
                    <span>{takeaway}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reflection Questions */}
      {moduleMetadata && moduleMetadata.reflectionQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0px' }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="print:hidden"
        >
          <Card>
            <CardHeader className="pb-3">
              <motion.div
                className="text-base sm:text-lg flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <FileText className="h-5 w-5 text-primary" />
                </motion.div>
                <CardTitle>Reflection Questions</CardTitle>
              </motion.div>
              <CardDescription className="text-xs sm:text-sm">
                Take time to reflect on these questions. Consider discussing them with your partner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.15,
                      delayChildren: 0.2,
                    },
                  },
                }}
              >
                {moduleMetadata.reflectionQuestions.map((question, index) => (
                  <motion.div
                    key={index}
                    className="space-y-2"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    <motion.p
                      className="text-sm font-medium"
                      whileHover={{ x: 5 }}
                    >
                      {index + 1}. {question}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.15 + 0.3 }}
                    >
                      <Textarea
                        placeholder="Write your thoughts here..."
                        value={reflectionAnswers[index] || ''}
                        onChange={(e) => setReflectionAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                        className="min-h-[80px] text-sm"
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
              <AnimatePresence>
                {Object.keys(reflectionAnswers).length > 0 && (
                  <motion.div
                    className="flex gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Save reflection answers to notes
                          const reflectionText = moduleMetadata.reflectionQuestions
                            .map((q, i) => `Q${i + 1}: ${q}\nA: ${reflectionAnswers[i] || 'Not answered'}\n`)
                            .join('\n')
                          const newNotes = notes ? `${notes}\n\n--- Reflection Answers ---\n${reflectionText}` : `--- Reflection Answers ---\n${reflectionText}`
                          setNotes(newNotes)
                          // Auto-save to database
                          saveMutation.mutate({})
                          toast.success('Reflection answers added to notes and saved!')
                        }}
                      >
                        Add to Notes & Save
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReflectionAnswers({})
                          toast.success('Reflection answers cleared')
                        }}
                      >
                        Clear
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Related Resources Suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3, margin: '0px' }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className="print:hidden"
      >
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <motion.div
              className="flex items-start gap-3"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              </motion.div>
              <div className="flex-1">
                <motion.h3
                  className="font-semibold text-sm sm:text-base mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Want to Learn More?
                </motion.h3>
                <motion.p
                  className="text-xs sm:text-sm text-muted-foreground mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Explore our curated resources library for additional books, lectures, and Islamic guidance on marriage.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard/resources">
                      Browse Resources
                      <motion.div
                        className="inline-block"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                      >
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3, margin: '0px' }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <FileText className="h-5 w-5" />
              </motion.div>
              <CardTitle>Your Notes</CardTitle>
            </motion.div>
            <CardDescription className="text-xs sm:text-sm">
              Take notes as you study. These will be included in your PDF summary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Textarea
                placeholder="Take notes as you study this module... Your reflections, key points, and questions can go here."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[150px] text-sm"
              />
            </motion.div>
            <motion.div
              className="flex flex-col sm:flex-row gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 sm:flex-initial"
              >
                <Button
                  onClick={() => saveMutation.mutate({})}
                  disabled={saveMutation.isPending}
                  className="flex-1 sm:flex-initial w-full"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Notes'}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 sm:flex-initial"
              >
                <Button
                  variant={isCompleted ? 'outline' : 'default'}
                  onClick={() => saveMutation.mutate({ isCompleted: !isCompleted })}
                  disabled={saveMutation.isPending}
                  className="flex-1 sm:flex-initial w-full"
                >
                  {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Printable Module Summary (hidden on screen, visible when printing) */}
      <div className="hidden print:block">
        <div className="worksheet">
          <div className="worksheet-header">
            <h1 className="worksheet-title">{module.title}</h1>
            <p className="worksheet-subtitle">{module.description}</p>
            {isCompleted && (
              <p className="text-sm mt-2">
                <strong>Status:</strong> Completed
                {userNotes?.completed_at && ` on ${new Date(userNotes.completed_at).toLocaleDateString()}`}
              </p>
            )}
            {moduleMetadata && (
              <p className="text-sm mt-1">
                <strong>Estimated Time:</strong> {moduleMetadata.estimatedTime}
              </p>
            )}
            <p className="text-xs mt-2 text-muted-foreground">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>

          {moduleMetadata && moduleMetadata.learningObjectives.length > 0 && (
            <div className="worksheet-section">
              <h2 className="worksheet-section-title">Learning Objectives</h2>
              <ul className="space-y-1">
                {moduleMetadata.learningObjectives.map((obj, i) => (
                  <li key={i} className="text-sm">{i + 1}. {obj}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="worksheet-section">
            <h2 className="worksheet-section-title">Module Content</h2>
            <div
              className="text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: module.content || 'No content available.' }}
            />
          </div>

          {moduleMetadata && moduleMetadata.keyTakeaways.length > 0 && (
            <div className="worksheet-section">
              <h2 className="worksheet-section-title">Key Takeaways</h2>
              <ul className="space-y-1">
                {moduleMetadata.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="text-sm">• {takeaway}</li>
                ))}
              </ul>
            </div>
          )}

          {notes && notes.trim() && (
            <div className="worksheet-section">
              <h2 className="worksheet-section-title">Your Notes</h2>
              <div className="text-sm whitespace-pre-wrap">{notes}</div>
            </div>
          )}

          {moduleMetadata && moduleMetadata.reflectionQuestions.length > 0 && (
            <div className="worksheet-section">
              <h2 className="worksheet-section-title">Reflection Questions</h2>
              <ul className="space-y-3">
                {moduleMetadata.reflectionQuestions.map((q, i) => (
                  <li key={i} className="text-sm">
                    <strong>{i + 1}. {q}</strong>
                    {reflectionAnswers[i] && (
                      <div className="mt-1 ml-4 text-xs text-muted-foreground">
                        Answer: {reflectionAnswers[i]}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="worksheet-footer">
            <p>NikahPrep - Islamic Marriage Preparation Platform</p>
            <p>This is a personal study summary. Keep it private and secure.</p>
          </div>
        </div>
      </div>

      {/* Navigation to Next/Previous Module */}
      {(nextModule || prevModule) && (
        <motion.div
          className="flex flex-col sm:flex-row justify-between gap-4 print:hidden border-t pt-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0px' }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        >
          {prevModule ? (
            <motion.div
              className="flex-1 sm:flex-initial"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ x: -5 }}
            >
              <Button variant="outline" asChild className="flex-1 sm:flex-initial w-full">
                <Link to={`/dashboard/modules/${prevModule.id}`} className="flex items-center gap-2">
                  <motion.div
                    animate={{ x: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </motion.div>
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">Previous Module</div>
                    <div className="text-sm font-medium line-clamp-1">{prevModule.title}</div>
                  </div>
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="flex-1 sm:flex-initial" />
          )}
          {nextModule ? (
            <motion.div
              className="flex-1 sm:flex-initial"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ x: 5 }}
            >
              <Button variant="outline" asChild className="flex-1 sm:flex-initial w-full">
                <Link to={`/dashboard/modules/${nextModule.id}`} className="flex items-center gap-2">
                  <div className="text-right flex-1">
                    <div className="text-xs text-muted-foreground">Next Module</div>
                    <div className="text-sm font-medium line-clamp-1">{nextModule.title}</div>
                  </div>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="flex-1 sm:flex-initial" />
          )}
        </motion.div>
      )}
    </div>
  )
}

function ModuleDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
