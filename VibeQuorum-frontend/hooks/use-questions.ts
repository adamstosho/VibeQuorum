'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Question, 
  Answer,
} from '@/lib/stores/questions'
import { api } from '@/lib/api'
import { useApiAuth } from './use-api-auth'

// Hook for managing questions list
export function useQuestions(options?: {
  searchQuery?: string
  tags?: string[]
  status?: string
  sortBy?: string
}) {
  const { address, signRequest } = useApiAuth()
  const queryClient = useQueryClient()

  // Memoize query key to prevent unnecessary refetches
  const queryKey = useMemo(() => [
    'questions',
    options?.searchQuery || '',
    options?.tags?.join(',') || '',
    options?.status || '',
    options?.sortBy || 'newest',
  ], [options?.searchQuery, options?.tags, options?.status, options?.sortBy])

  const { data, isLoading, refetch, error } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const results = await api.questions.list({
          search: options?.searchQuery,
          tag: options?.tags?.[0],
          sort: options?.sortBy || 'newest',
        })
        
        // Map MongoDB _id to id for frontend compatibility
        const questionsArray = Array.isArray(results) ? results : []
        return questionsArray.map((q: any) => ({
          ...q,
          id: q._id || q.id,
        })) as Question[]
      } catch (err: any) {
        console.error('Failed to fetch questions:', err)
        // Return empty array on error instead of throwing
        // This prevents the entire component from breaking
        return [] as Question[]
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  })

  const refresh = useCallback(() => {
    refetch()
  }, [refetch])

  const createQuestion = useCallback(async (data: {
    title: string
    description: string
    tags: string[]
    author: string
    displayName?: string
  }) => {
    if (!address) throw new Error('Wallet not connected')
    const auth = await signRequest()
    const result = await api.questions.create(
      { title: data.title, description: data.description, tags: data.tags },
      address,
      auth?.signature,
      auth?.timestamp
    )
    await refresh()
    return result
  }, [refresh, address, signRequest])

  // Log error in development
  if (error && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn('Questions fetch error:', error)
  }

  return {
    questions: data || [],
    loading: isLoading,
    refresh,
    createQuestion,
    totalCount: data?.length || 0,
    error: error ? (error as Error).message : undefined,
  }
}

// Hook for a single question
export function useQuestion(questionId: string | null) {
  const { address, signRequest } = useApiAuth()
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ['question', questionId],
    queryFn: async () => {
      if (!questionId) return null
      try {
        const result = await api.questions.get(questionId)
        const question = result?.question
        if (question) {
          return {
            ...question,
            id: question._id || question.id,
          } as Question
        }
        return null
      } catch (err: any) {
        console.error('Failed to fetch question:', err)
        return null
      }
    },
    enabled: !!questionId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    retryDelay: 1000,
  })

  const refresh = useCallback(() => {
    refetch()
  }, [refetch])

  const updateQuestion = useCallback(async (updates: Partial<Question>) => {
    if (!questionId || !address) return null
    try {
      const auth = await signRequest()
      await api.questions.update(
        questionId,
        updates as { title?: string; description?: string; tags?: string[] },
        address,
        auth?.signature,
        auth?.timestamp
      )
      await refresh()
      return data
    } catch (error) {
      console.error('Failed to update question:', error)
      return null
    }
  }, [questionId, address, signRequest, refresh, data])

  const deleteQuestion = useCallback(async () => {
    if (!questionId || !address) return false
    try {
      const auth = await signRequest()
      await api.questions.delete(questionId, address, auth?.signature, auth?.timestamp)
      await refresh()
      return true
    } catch (error) {
      console.error('Failed to delete question:', error)
      return false
    }
  }, [questionId, address, signRequest, refresh])

  if (error && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn('Question fetch error:', error)
  }

  return {
    question: data || null,
    loading: isLoading,
    refresh,
    updateQuestion,
    deleteQuestion,
    error: error ? (error as Error).message : undefined,
  }
}

// Hook for answers
export function useAnswers(questionId: string | null) {
  const { address, signRequest } = useApiAuth()
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['answers', questionId],
    queryFn: async () => {
      if (!questionId) return []
      const results = await api.answers.list(questionId)
      return (results?.answers || []).map((a: any) => {
        // Handle txHashes - ensure it's always an array
        let txHashes = []
        if (Array.isArray(a.txHashes)) {
          txHashes = a.txHashes
        } else if (a.txHash) {
          txHashes = [a.txHash]
        } else if (typeof a.txHash === 'string' && a.txHash.length > 0) {
          txHashes = [a.txHash]
        }
        
        return {
          ...a,
          id: a._id || a.id,
          questionId: a.questionId || questionId,
          vibeReward: a.vibeReward || 0, // Ensure vibeReward is always a number
          txHashes: txHashes, // Always an array
        } as Answer
      })
    },
    enabled: !!questionId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  const refresh = useCallback(() => {
    refetch()
  }, [refetch])

  const createAnswer = useCallback(async (data: {
    content: string
    author: string
    displayName?: string
    aiGenerated: boolean
  }) => {
    if (!questionId || !address) return null
    const auth = await signRequest()
    const result = await api.answers.create(
      questionId,
      { content: data.content, aiGenerated: data.aiGenerated },
      address,
      auth?.signature,
      auth?.timestamp
    )
    await refresh()
    return result
  }, [questionId, refresh, address, signRequest])

  // Accept answer - now handled by backend API, this just refreshes data
  const acceptAnswer = useCallback((answerId: string, txHash?: string, vibeReward?: number) => {
    // Backend handles accepting answer and triggering reward
    // Refresh the data to get updated answer status and rewards
    refetch()
    // Return the answer from current data if available
    const currentAnswers = data || []
    return currentAnswers.find(a => a.id === answerId) || null
  }, [refetch, data])

  // Add reward tx hash to answer - backend already handles this, just refresh
  const addRewardToAnswer = useCallback((answerId: string, txHash: string, vibeReward: number) => {
    // Backend already saves txHash and vibeReward when reward is triggered
    // Refresh to get updated data from backend
    refetch()
    const currentAnswers = data || []
    return currentAnswers.find(a => a.id === answerId) || null
  }, [refetch, data])

  return {
    answers: data || [],
    loading: isLoading,
    refresh,
    createAnswer,
    acceptAnswer,
    addRewardToAnswer,
    totalCount: (data || []).length,
  }
}

// Hook for voting
export function useVoting(userAddress: string | undefined) {
  const { signRequest } = useApiAuth()
  const queryClient = useQueryClient()

  const vote = useCallback(async (
    targetType: 'question' | 'answer',
    targetId: string,
    value: 1 | -1
  ) => {
    if (!userAddress) return null
    try {
      const auth = await signRequest()
      const result = await api.votes.vote(
        targetType,
        targetId,
        value,
        userAddress,
        auth?.signature,
        auth?.timestamp
      )
      // Invalidate relevant queries to refresh vote counts
      if (targetType === 'question') {
        queryClient.invalidateQueries({ queryKey: ['question', targetId] })
        queryClient.invalidateQueries({ queryKey: ['questions'] })
      } else {
        // Find which question this answer belongs to
        queryClient.invalidateQueries({ queryKey: ['answers'] })
      }
      return result
    } catch (error) {
      console.error('Failed to vote:', error)
      return null
    }
  }, [userAddress, signRequest, queryClient])

  const getUserVote = useCallback(async (
    targetType: 'question' | 'answer',
    targetId: string
  ): Promise<number | null> => {
    if (!userAddress) return null
    try {
      const result = await api.votes.getUserVote(targetType, targetId, userAddress)
      return result?.vote || null
    } catch (error) {
      console.error('Failed to get user vote:', error)
      return null
    }
  }, [userAddress])

  const removeVote = useCallback(async (
    targetType: 'question' | 'answer',
    targetId: string
  ) => {
    if (!userAddress) return false
    try {
      const auth = await signRequest()
      await api.votes.remove(
        targetType,
        targetId,
        userAddress,
        auth?.signature,
        auth?.timestamp
      )
      // Invalidate relevant queries
      if (targetType === 'question') {
        queryClient.invalidateQueries({ queryKey: ['question', targetId] })
        queryClient.invalidateQueries({ queryKey: ['questions'] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['answers'] })
      }
      return true
    } catch (error) {
      console.error('Failed to remove vote:', error)
      return false
    }
  }, [userAddress, signRequest, queryClient])

  return {
    vote,
    getUserVote,
    removeVote,
  }
}

// Hook for user's questions and answers
export function useUserContent(userAddress: string | undefined) {
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ['user-questions', userAddress],
    queryFn: async () => {
      if (!userAddress) return []
      // Fetch all questions and filter client-side (backend should add endpoint for this)
      const allQuestionsResult = await api.questions.list()
      const allQuestions = Array.isArray(allQuestionsResult) ? allQuestionsResult : []
      return allQuestions
        .filter((q: any) => q.author?.toLowerCase() === userAddress.toLowerCase())
        .map((q: any) => ({
          ...q,
          id: q._id || q.id,
        })) as Question[]
    },
    enabled: !!userAddress,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  // For answers, we'd need an API endpoint for user's answers
  // For now, return empty array
  const answers: Answer[] = []

  // Calculate total rewards earned
  const totalRewardsEarned = useMemo(() => 
    answers.reduce((sum, a) => sum + a.vibeReward, 0),
    [answers]
  )
  
  // Calculate reputation (simplified)
  const reputation = useMemo(() => 
    answers.reduce((sum, a) => {
      let points = a.upvotes * 10 - a.downvotes * 5
      if (a.isAccepted) points += 50
      return sum + points
    }, 0),
    [answers]
  )

  return {
    questions: questionsData || [],
    answers,
    loading: questionsLoading,
    refresh: () => {}, // Not needed with React Query
    questionsCount: questionsData?.length || 0,
    answersCount: answers.length,
    acceptedAnswersCount: answers.filter(a => a.isAccepted).length,
    totalRewardsEarned,
    reputation,
  }
}

