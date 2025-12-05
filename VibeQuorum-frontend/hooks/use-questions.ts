'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  questionStore, 
  answerStore, 
  voteStore,
  Question, 
  Answer,
  Vote,
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
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const { address, signRequest } = useApiAuth()
  const isMountedRef = useRef(true)

  const refresh = useCallback(async () => {
    if (!isMountedRef.current) return
    
    isMountedRef.current = true
    setLoading(true)
    try {
      const results = await api.questions.list({
        search: options?.searchQuery,
        tag: options?.tags?.[0],
        sort: options?.sortBy || 'newest',
      })
      if (isMountedRef.current) {
        // Backend returns: { success: true, data: questions[], pagination: {...} }
        // request() extracts data.data, so results is the questions array directly
        // The backend controller returns: res.json({ success: true, data: result.questions, pagination: ... })
        // So results is already the questions array
        const questionsArray = Array.isArray(results) ? results : []
        
        // Map MongoDB _id to id for frontend compatibility
        const mappedQuestions = questionsArray.map((q: any) => ({
          ...q,
          id: q._id || q.id, // Use _id from MongoDB or fallback to id
        }))
        setQuestions(mappedQuestions)
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Failed to fetch questions:', error)
        setQuestions([])
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [options?.searchQuery, options?.tags, options?.status, options?.sortBy])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    isMountedRef.current = true
    const timeoutId = setTimeout(() => {
      refresh()
    }, 0)
    
    return () => {
      clearTimeout(timeoutId)
      isMountedRef.current = false
    }
  }, [refresh])

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

  return {
    questions,
    loading,
    refresh,
    createQuestion,
    totalCount: questions.length,
  }
}

// Hook for a single question
export function useQuestion(questionId: string | null) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)

  const refresh = useCallback(async () => {
    if (!questionId) {
      setQuestion(null)
      setLoading(false)
      return
    }
    
    if (!isMountedRef.current) return
    
    isMountedRef.current = true
    setLoading(true)
    try {
      const result = await api.questions.get(questionId)
      if (isMountedRef.current) {
        const question = result?.question
        if (question) {
          // Map MongoDB _id to id for frontend compatibility
          setQuestion({
            ...question,
            id: question._id || question.id,
          })
        } else {
          setQuestion(null)
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Failed to fetch question:', error)
        setQuestion(null)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [questionId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    isMountedRef.current = true
    const timeoutId = setTimeout(() => {
      refresh()
    }, 0)
    
    return () => {
      clearTimeout(timeoutId)
      isMountedRef.current = false
    }
  }, [refresh])

  const updateQuestion = useCallback((updates: Partial<Question>) => {
    if (!questionId) return null
    const updated = questionStore.update(questionId, updates)
    if (updated) setQuestion(updated)
    return updated
  }, [questionId])

  const deleteQuestion = useCallback(() => {
    if (!questionId) return false
    const success = questionStore.delete(questionId)
    if (success) setQuestion(null)
    return success
  }, [questionId])

  return {
    question,
    loading,
    refresh,
    updateQuestion,
    deleteQuestion,
  }
}

// Hook for answers
export function useAnswers(questionId: string | null) {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const { address, signRequest } = useApiAuth()
  const isMountedRef = useRef(true)

  const refresh = useCallback(async () => {
    if (!questionId) {
      setAnswers([])
      setLoading(false)
      return
    }
    
    if (!isMountedRef.current) return
    
    isMountedRef.current = true
    setLoading(true)
    try {
      const results = await api.answers.list(questionId)
      if (isMountedRef.current) {
        // Map MongoDB _id to id for frontend compatibility
        const mappedAnswers = (results?.answers || []).map((a: any) => ({
          ...a,
          id: a._id || a.id,
          questionId: a.questionId || questionId,
        }))
        setAnswers(mappedAnswers)
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Failed to fetch answers:', error)
        setAnswers([])
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [questionId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    isMountedRef.current = true
    const timeoutId = setTimeout(() => {
      refresh()
    }, 0)
    
    return () => {
      clearTimeout(timeoutId)
      isMountedRef.current = false
    }
  }, [refresh])

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

  const acceptAnswer = useCallback((answerId: string, txHash?: string, vibeReward?: number) => {
    const answer = answerStore.accept(answerId, txHash, vibeReward)
    refresh()
    return answer
  }, [refresh])

  const addRewardToAnswer = useCallback((answerId: string, txHash: string, vibeReward: number) => {
    const answer = answerStore.addTxHash(answerId, txHash, vibeReward)
    refresh()
    return answer
  }, [refresh])

  return {
    answers,
    loading,
    refresh,
    createAnswer,
    acceptAnswer,
    addRewardToAnswer,
    totalCount: answers.length,
  }
}

// Hook for voting
export function useVoting(userAddress: string | undefined) {
  const vote = useCallback((
    targetType: 'question' | 'answer',
    targetId: string,
    value: 1 | -1
  ) => {
    if (!userAddress) return null
    return voteStore.vote({
      voter: userAddress,
      targetType,
      targetId,
      value,
    })
  }, [userAddress])

  const getUserVote = useCallback((
    targetType: 'question' | 'answer',
    targetId: string
  ): Vote | null => {
    if (!userAddress) return null
    return voteStore.getUserVote(userAddress, targetType, targetId)
  }, [userAddress])

  const removeVote = useCallback((
    targetType: 'question' | 'answer',
    targetId: string
  ) => {
    if (!userAddress) return false
    return voteStore.removeVote(userAddress, targetType, targetId)
  }, [userAddress])

  return {
    vote,
    getUserVote,
    removeVote,
  }
}

// Hook for user's questions and answers
export function useUserContent(userAddress: string | undefined) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)

  const refresh = useCallback(async () => {
    if (!userAddress) {
      setQuestions([])
      setAnswers([])
      setLoading(false)
      return
    }
    
    if (!isMountedRef.current) return
    
    isMountedRef.current = true
    setLoading(true)
    try {
      // Fetch user's questions and answers from API
      const allQuestionsResult = await api.questions.list()
      if (isMountedRef.current) {
        // Backend returns: { success: true, data: questions[], pagination: {...} }
        // request() extracts data.data, so allQuestionsResult is the questions array directly
        const allQuestions = Array.isArray(allQuestionsResult) ? allQuestionsResult : []
        
        const userQuestions = allQuestions.filter(
          (q: any) => q.author?.toLowerCase() === userAddress.toLowerCase()
        )
        setQuestions(userQuestions)
        
        // For answers, we'd need an API endpoint for user's answers
        // For now, return empty array
        setAnswers([])
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Failed to fetch user content:', error)
        setQuestions([])
        setAnswers([])
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [userAddress])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    isMountedRef.current = true
    const timeoutId = setTimeout(() => {
      refresh()
    }, 0)
    
    return () => {
      clearTimeout(timeoutId)
      isMountedRef.current = false
    }
  }, [refresh])

  // Calculate total rewards earned
  const totalRewardsEarned = answers.reduce((sum, a) => sum + a.vibeReward, 0)
  
  // Calculate reputation (simplified)
  const reputation = answers.reduce((sum, a) => {
    let points = a.upvotes * 10 - a.downvotes * 5
    if (a.isAccepted) points += 50
    return sum + points
  }, 0)

  return {
    questions,
    answers,
    loading,
    refresh,
    questionsCount: questions.length,
    answersCount: answers.length,
    acceptedAnswersCount: answers.filter(a => a.isAccepted).length,
    totalRewardsEarned,
    reputation,
  }
}

