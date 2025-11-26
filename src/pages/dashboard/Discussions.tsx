import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Skeleton } from '../../components/ui/skeleton'
import { Checkbox } from '../../components/ui/checkbox'
import { MessageSquare, Heart, ChevronDown, ChevronUp, CheckCircle2, User, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '../../lib/utils'

interface DiscussionPrompt {
  id: string
  title: string
  description: string
  category: string
  order_index: number
}

interface DiscussionAnswer {
  id: string
  user_id: string
  prompt_id: string
  answer: string | null
  is_discussed: boolean
  follow_up_notes: string | null
  discussed_at: string | null
  created_at: string
  updated_at: string
}

interface PartnerAnswer {
  answer: string | null
  is_discussed: boolean
  follow_up_notes: string | null
  discussed_at: string | null
}

export default function DiscussionsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set())

  // Get partner ID
  const { data: partnerId } = useQuery({
    queryKey: ['partner-id'],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase.rpc('get_partner_id', {
        current_user_id: user.id
      })

      if (error) {
        // Partner might not exist, that's okay
        return null
      }
      return data as string | null
    },
    enabled: !!user,
  })

  // Fetch all prompts
  const { data: prompts, isLoading } = useQuery({
    queryKey: ['discussions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discussion_prompts')
        .select('*')
        .order('order_index')

      if (error) throw error
      return data as DiscussionPrompt[]
    },
    enabled: !!user,
  })

  // Fetch user's answers for all prompts
  const { data: userAnswers } = useQuery({
    queryKey: ['discussion-answers', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('user_discussion_answers')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      return (data || []) as DiscussionAnswer[]
    },
    enabled: !!user,
  })

  // Fetch partner's answers if partner exists
  const { data: partnerAnswers } = useQuery({
    queryKey: ['discussion-answers', partnerId],
    queryFn: async () => {
      if (!partnerId) return []

      const { data, error } = await supabase
        .from('user_discussion_answers')
        .select('*')
        .eq('user_id', partnerId)

      if (error) {
        // Partner answers might not be accessible, that's okay
        return []
      }
      return (data || []) as DiscussionAnswer[]
    },
    enabled: !!partnerId,
  })

  // Save/update answer mutation
  const saveAnswerMutation = useMutation({
    mutationFn: async ({ promptId, answer, isDiscussed, notes }: {
      promptId: string
      answer: string
      isDiscussed: boolean
      notes: string
    }) => {
      if (!user) throw new Error('Not authenticated')

      const updateData: any = {
        user_id: user.id,
        prompt_id: promptId,
        answer: answer.trim() || null,
        is_discussed: isDiscussed,
        follow_up_notes: notes.trim() || null,
      }

      if (isDiscussed && !userAnswers?.find(a => a.prompt_id === promptId)?.is_discussed) {
        updateData.discussed_at = new Date().toISOString()
      } else if (!isDiscussed) {
        updateData.discussed_at = null
      }

      const { error } = await supabase
        .from('user_discussion_answers')
        .upsert(updateData, {
          onConflict: 'user_id,prompt_id'
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-answers'] })
      toast.success('Answer saved!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save answer')
    },
  })

  const toggleExpanded = useCallback((promptId: string) => {
    setExpandedPrompts(prev => {
      const next = new Set(prev)
      if (next.has(promptId)) {
        next.delete(promptId)
      } else {
        next.add(promptId)
      }
      return next
    })
  }, [])

  const getAnswerForPrompt = useCallback((promptId: string) => {
    return userAnswers?.find(a => a.prompt_id === promptId)
  }, [userAnswers])

  const getPartnerAnswerForPrompt = useCallback((promptId: string) => {
    return partnerAnswers?.find(a => a.prompt_id === promptId)
  }, [partnerAnswers])

  if (isLoading) {
    return <DiscussionsSkeleton />
  }

  // Group by category
  const categories = prompts?.reduce((acc, prompt) => {
    if (!acc[prompt.category]) {
      acc[prompt.category] = []
    }
    acc[prompt.category].push(prompt)
    return acc
  }, {} as Record<string, DiscussionPrompt[]>) || {}

  return (
    <div className="space-y-6">
      <SEO
        title={PAGE_SEO.discussions.title}
        description={PAGE_SEO.discussions.description}
        path="/dashboard/discussions"
        noIndex
      />

      <div className="space-y-0.5 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Discussion Prompts</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Write your answers, share with your partner, and track your discussions
        </p>
      </div>

      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-4 sm:p-6 border border-primary/10">
        <div className="flex items-start gap-3 sm:gap-4">
          <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-0.5 sm:mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold text-sm sm:text-base">How to Use These</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Click on any prompt to write your answer. Your partner can see your answers if you're connected.
              Mark as discussed once you've talked about it together and add notes from your conversation.
            </p>
          </div>
        </div>
      </div>

      {Object.entries(categories).map(([category, categoryPrompts]) => (
        <div key={category} className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">{category}</h2>
          <div className="grid gap-3 sm:gap-4">
            {categoryPrompts.map((prompt) => {
              const userAnswer = getAnswerForPrompt(prompt.id)
              const partnerAnswer = getPartnerAnswerForPrompt(prompt.id)
              const isExpanded = expandedPrompts.has(prompt.id)
              const hasAnswer = !!userAnswer?.answer
              const isDiscussed = userAnswer?.is_discussed || false

              return (
                <DiscussionPromptCard
                  key={prompt.id}
                  prompt={prompt}
                  userAnswer={userAnswer}
                  partnerAnswer={partnerAnswer}
                  partnerId={partnerId}
                  isExpanded={isExpanded}
                  onToggle={() => toggleExpanded(prompt.id)}
                  onSave={(answer, isDiscussed, notes) => {
                    saveAnswerMutation.mutate({
                      promptId: prompt.id,
                      answer,
                      isDiscussed,
                      notes,
                    })
                  }}
                  isLoading={saveAnswerMutation.isPending}
                />
              )
            })}
          </div>
        </div>
      ))}

      {(!prompts || prompts.length === 0) && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No discussion prompts available yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface DiscussionPromptCardProps {
  prompt: DiscussionPrompt
  userAnswer: DiscussionAnswer | undefined
  partnerAnswer: DiscussionAnswer | undefined
  partnerId: string | null | undefined
  isExpanded: boolean
  onToggle: () => void
  onSave: (answer: string, isDiscussed: boolean, notes: string) => void
  isLoading: boolean
}

function DiscussionPromptCard({
  prompt,
  userAnswer,
  partnerAnswer,
  partnerId,
  isExpanded,
  onToggle,
  onSave,
  isLoading,
}: DiscussionPromptCardProps) {
  const [answer, setAnswer] = useState(userAnswer?.answer || '')
  const [notes, setNotes] = useState(userAnswer?.follow_up_notes || '')
  const [isDiscussed, setIsDiscussed] = useState(userAnswer?.is_discussed || false)

  const handleSave = useCallback(() => {
    onSave(answer, isDiscussed, notes)
  }, [answer, isDiscussed, notes, onSave])

  const hasChanges = 
    answer !== (userAnswer?.answer || '') ||
    notes !== (userAnswer?.follow_up_notes || '') ||
    isDiscussed !== (userAnswer?.is_discussed || false)

  return (
    <Card className={cn(
      "transition-all duration-200",
      isExpanded && "shadow-lg",
      userAnswer?.is_discussed && "border-primary/30 bg-primary/5"
    )}>
      <CardHeader 
        className="p-4 sm:p-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 sm:mt-1 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-sm sm:text-lg leading-tight">{prompt.title}</CardTitle>
                <CardDescription className="mt-0.5 sm:mt-1 text-xs sm:text-sm">
                  {prompt.description}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {userAnswer?.is_discussed && (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                )}
              </div>
            </div>
            {(userAnswer?.answer || partnerAnswer) && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                {userAnswer?.answer && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Your answer
                  </span>
                )}
                {partnerAnswer?.answer && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Partner's answer
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          {/* Your Answer Section */}
          <div className="space-y-2">
            <Label htmlFor={`answer-${prompt.id}`} className="text-sm font-medium">
              Your Answer
            </Label>
            <Textarea
              id={`answer-${prompt.id}`}
              placeholder="Write your thoughts and answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* Partner's Answer Section */}
          {partnerId && partnerAnswer?.answer && (
            <div className="space-y-2 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Partner's Answer
              </Label>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {partnerAnswer.answer}
              </p>
              {partnerAnswer.is_discussed && (
                <p className="text-xs text-muted-foreground mt-2">
                  ✓ Discussed on {new Date(partnerAnswer.discussed_at!).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor={`notes-${prompt.id}`} className="text-sm font-medium">
              Discussion Notes
            </Label>
            <Textarea
              id={`notes-${prompt.id}`}
              placeholder="Add notes from your discussion with your partner..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Mark as Discussed Checkbox */}
          <div className="flex items-center gap-2 flex-wrap">
            <Checkbox
              id={`discussed-${prompt.id}`}
              checked={isDiscussed}
              onChange={(e) => setIsDiscussed(e.target.checked)}
              label="Mark as discussed"
            />
            {isDiscussed && userAnswer?.discussed_at && (
              <span className="text-xs text-muted-foreground">
                on {new Date(userAnswer.discussed_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Save Button */}
          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Saving...' : 'Save Answer'}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}

function DiscussionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
      {[1, 2].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-4">
            {[1, 2, 3].map((j) => (
              <Card key={j}>
                <CardHeader>
                  <Skeleton className="h-16 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
