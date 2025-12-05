'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  questionStore, 
  answerStore, 
  voteStore,
  seedDemoData,
  Question, 
  Answer,
  Vote,
} from '@/lib/stores/questions'

// Hook for managing questions list
export function useQuestions(options?: {
  searchQuery?: string
  tags?: string[]
  status?: string
  sortBy?: string
}) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    // Seed demo data on first load
    seedDemoData()
    
    const results = questionStore.search(
      options?.searchQuery || '',
      options?.tags || [],
      options?.status,
      options?.sortBy || 'newest'
    )
    setQuestions(results)
    setLoading(false)
  }, [options?.searchQuery, options?.tags, options?.status, options?.sortBy])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createQuestion = useCallback((data: {
    title: string
    description: string
    tags: string[]
    author: string
    displayName?: string
  }) => {
    const question = questionStore.create(data)
    refresh()
    return question
  }, [refresh])

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

  const refresh = useCallback(() => {
    if (!questionId) {
      setQuestion(null)
      setLoading(false)
      return
    }
    
    setLoading(true)
    seedDemoData()
    
    const q = questionStore.getById(questionId)
    if (q) {
      questionStore.incrementViews(questionId)
    }
    setQuestion(q)
    setLoading(false)
  }, [questionId])

  useEffect(() => {
    refresh()
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

  const refresh = useCallback(() => {
    if (!questionId) {
      setAnswers([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    const results = answerStore.getByQuestionId(questionId)
    setAnswers(results)
    setLoading(false)
  }, [questionId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createAnswer = useCallback((data: {
    content: string
    author: string
    displayName?: string
    aiGenerated: boolean
  }) => {
    if (!questionId) return null
    const answer = answerStore.create({
      ...data,
      questionId,
    })
    refresh()
    return answer
  }, [questionId, refresh])

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

  const refresh = useCallback(() => {
    if (!userAddress) {
      setQuestions([])
      setAnswers([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    seedDemoData()
    
    setQuestions(questionStore.getByAuthor(userAddress))
    setAnswers(answerStore.getByAuthor(userAddress))
    setLoading(false)
  }, [userAddress])

  useEffect(() => {
    refresh()
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

