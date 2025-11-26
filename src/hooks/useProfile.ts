import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logError } from '../lib/logger'

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  date_of_birth: string | null
  age: number | null
  gender: 'male' | 'female' | 'prefer_not_to_say' | null
  marital_status: 'Single' | 'Engaged' | 'Researching' | null
  country: string | null
  city: string | null
  wedding_date: string | null
  partner_name: string | null
  partner_using_app: boolean | null
  partner_email: string | null
  profile_visibility: 'public' | 'private' | null
  created_at: string
  updated_at: string
}

export function useProfile() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!user,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        logError('Supabase update error', error, 'useProfile')
        throw new Error(error.message || 'Failed to update profile')
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
