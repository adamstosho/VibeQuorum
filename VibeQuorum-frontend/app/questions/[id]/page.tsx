"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { 
  ArrowUp, 
  ArrowDown, 
  CheckCircle, 
  MessageCircle, 
  ArrowLeft, 
  Share2, 
  Flag, 
  Loader2,
  Sparkles,
  Send,
  AlertCircle,
  Wallet,
  Zap,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { useWallet } from "@/hooks/use-wallet"
import { useQuestion, useAnswers, useVoting } from "@/hooks/use-questions"
import { useRewardManager } from "@/hooks/use-contracts"
import { useApiAuth } from "@/hooks/use-api-auth"
import { api } from "@/lib/api"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params?.id as string
  
  const { address, isConnected, shortAddress } = useWallet()
  const { question, loading: questionLoading, updateQuestion } = useQuestion(questionId)
  const { answers, loading: answersLoading, createAnswer, acceptAnswer, addRewardToAnswer } = useAnswers(questionId)
  const { vote, getUserVote } = useVoting(address)
  const { rewardAcceptedAnswer, isPending: rewardPending } = useRewardManager()
  const { signRequest } = useApiAuth()
  
  const [answerContent, setAnswerContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAccepting, setIsAccepting] = useState<string | null>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showShareToast, setShowShareToast] = useState(false)

  const loading = questionLoading || answersLoading

  // Check if user is question owner
  const isQuestionOwner = useMemo(() => {
    if (!address || !question) return false
    return question.author.toLowerCase() === address.toLowerCase()
  }, [address, question])

  // Handle share
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 2000)
  }

  // Handle vote on question
  const handleQuestionVote = (value: 1 | -1) => {
    if (!isConnected || !address) return
    vote('question', questionId, value)
    // Force re-render - in production this would be handled by state management
  }

  // Handle vote on answer
  const handleAnswerVote = (answerId: string, value: 1 | -1) => {
    if (!isConnected || !address) return
    vote('answer', answerId, value)
  }

  // Handle submit answer
  const handleSubmitAnswer = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first")
      return
    }

    if (!answerContent.trim()) {
      setError("Please enter your answer")
      return
    }

    if (answerContent.trim().length < 30) {
      setError("Answer must be at least 30 characters")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      createAnswer({
        content: answerContent.trim(),
        author: address,
        displayName: shortAddress || undefined,
        aiGenerated: false,
      })
      
      setAnswerContent("")
    } catch (err) {
      setError("Failed to submit answer. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle accept answer
  const handleAcceptAnswer = async (answerId: string, answererAddress: string) => {
    if (!isConnected || !isQuestionOwner || !address) return
    
    setIsAccepting(answerId)
    setError(null)
    
    try {
      // Sign request for backend authentication
      const { signature, timestamp } = await signRequest()
      
      // Call backend API to accept answer (backend will auto-trigger reward)
      const result = await api.questions.acceptAnswer(
        questionId,
        answerId,
        address,
        signature,
        timestamp
      )
      
      // Update local state
      if (result?.data?.answer) {
        // Refresh answers to get updated data from backend (including rewards)
        acceptAnswer(answerId)
        
        // If reward was triggered, update with tx hash and amount
        if (result.data.reward?.txHash) {
          const rewardAmount = result.data.reward.amount 
            ? Number(result.data.reward.amount) / 1e18 // Convert from wei to VIBE
            : 50 // Default fallback
          addRewardToAnswer(answerId, result.data.reward.txHash, rewardAmount)
          
          // Show success message
          setError(null)
          console.log('✅ Reward distributed:', result.data.reward.txHash)
        } else if (result.data.rewardError) {
          // Reward failed but answer was accepted
          // Admin can trigger reward manually later
          console.warn('Answer accepted but reward failed:', result.data.rewardError)
          setError('Answer accepted! Reward will be processed by admin.')
        }
        
        // Refresh answers after a short delay to get updated reward data from backend
        setTimeout(() => {
          acceptAnswer(answerId) // Refresh again to get updated data
        }, 3000) // Wait 3 seconds for blockchain transaction to be confirmed and indexed
      }
    } catch (err: any) {
      console.error("Failed to accept answer:", err)
      setError(err.message || "Failed to accept answer. Please try again.")
    } finally {
      setIsAccepting(null)
    }
  }

  // Handle AI draft generation
  const handleGenerateAI = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first")
      return
    }

    setIsGeneratingAI(true)
    setError(null)

    try {
      const auth = await signRequest()
      if (!auth || !auth.signature || !auth.timestamp) {
        setError("Failed to sign request. Please try again.")
        setIsGeneratingAI(false)
        return
      }

      const result = await api.ai.generateDraft(
        questionId,
        {},
        address,
        auth.signature,
        auth.timestamp
      )

      if (result?.draft) {
        setAnswerContent(result.draft)
      } else {
        setError("No draft generated. Please try again.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate AI draft. Please try again.")
    } finally {
      setIsGeneratingAI(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading question...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!question) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <div className="card-base text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <h1 className="text-2xl font-bold">Question Not Found</h1>
            <p className="text-muted-foreground">
              This question doesn't exist or has been removed.
            </p>
            <Link href="/questions" className="btn-primary inline-flex">
              Browse Questions
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Back Button */}
        <Link
          href="/questions"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors duration-200 animate-slide-in-down"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Questions
        </Link>

        {/* Question */}
        <article className="card-base space-y-6 animate-slide-in-up overflow-hidden">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 min-w-0">
              {/* Vote Column */}
              <div className="flex flex-col items-center gap-1 min-w-[40px]">
                <button 
                  onClick={() => handleQuestionVote(1)}
                  className="p-2 rounded hover:bg-muted transition-colors disabled:opacity-50"
                  disabled={!isConnected}
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
                <span className="font-bold text-lg">{question.votesCount}</span>
                <button 
                  onClick={() => handleQuestionVote(-1)}
                  className="p-2 rounded hover:bg-muted transition-colors disabled:opacity-50"
                  disabled={!isConnected}
                >
                  <ArrowDown className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex items-start gap-3">
                  <h1 className="text-2xl font-bold flex-1 break-words">{question.title}</h1>
                  {question.status === 'closed' && (
                    <span className="flex items-center gap-1 bg-success/20 text-success px-2 py-1 rounded text-xs">
                      <CheckCircle className="h-3 w-3" />
                      Solved
                    </span>
                  )}
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap break-words text-foreground" style={{ overflowWrap: 'anywhere' }}>{question.description}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/questions?tag=${tag}`}
                      className="text-xs badge hover:bg-primary/20 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border text-sm">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-muted-foreground">Asked by </span>
                      <span className="font-mono text-primary">
                        {question.displayName || question.author.slice(0, 6) + '...' + question.author.slice(-4)}
                      </span>
                    </div>
                    <span className="text-muted-foreground">{formatTimeAgo(question.createdAt)}</span>
                    <span className="text-muted-foreground">{question.viewsCount} views</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleShare}
                      className="btn-ghost p-2 text-xs gap-1"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                    <button className="btn-ghost p-2 text-xs gap-1">
                      <Flag className="h-4 w-4" />
                      Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Share Toast */}
        {showShareToast && (
          <div className="fixed bottom-4 right-4 bg-success/90 text-white px-4 py-2 rounded-lg animate-slide-in-up">
            Link copied to clipboard!
          </div>
        )}

        {/* Answers Section */}
        <section className="mt-8 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>

          {answers.length > 0 ? (
            <div className="space-y-4">
              {answers.map((answer, idx) => (
                <div
                  key={answer.id}
                  className={`card-base space-y-4 animate-slide-in-up overflow-hidden ${
                    answer.isAccepted ? 'border-success/50 bg-success/5' : ''
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Vote Column */}
                    <div className="flex flex-col items-center gap-1 min-w-[40px]">
                      <button 
                        onClick={() => handleAnswerVote(answer.id, 1)}
                        className="p-2 rounded hover:bg-muted transition-colors disabled:opacity-50"
                        disabled={!isConnected}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </button>
                      <span className="font-bold">{answer.upvotes - answer.downvotes}</span>
                      <button 
                        onClick={() => handleAnswerVote(answer.id, -1)}
                        className="p-2 rounded hover:bg-muted transition-colors disabled:opacity-50"
                        disabled={!isConnected}
                      >
                        <ArrowDown className="h-5 w-5" />
                      </button>
                      
                      {/* Accept Button (only for question owner) */}
                      {isQuestionOwner && !answer.isAccepted && question.status !== 'closed' && (
                        <button
                          onClick={() => handleAcceptAnswer(answer.id, answer.author)}
                          disabled={isAccepting === answer.id}
                          className="mt-2 p-2 rounded border border-success/50 text-success hover:bg-success/10 transition-colors disabled:opacity-50"
                          title="Accept this answer"
                        >
                          {isAccepting === answer.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-5 w-5" />
                          )}
                        </button>
                      )}
                      
                      {/* Accepted Badge */}
                      {answer.isAccepted && (
                        <div className="mt-2 p-2 text-success" title="Accepted Answer">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      {/* AI Badge */}
                      {answer.aiGenerated && (
                        <div className="flex items-center gap-2 text-xs text-secondary">
                          <Sparkles className="h-4 w-4" />
                          AI-assisted answer
                        </div>
                      )}

                      <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-wrap break-words text-foreground" style={{ overflowWrap: 'anywhere' }}>{answer.content}</p>
                      </div>

                      {/* Reward Badge */}
                      {answer.vibeReward > 0 && (
                        <div className="flex flex-wrap items-center gap-2 bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 text-sm">
                          <Zap className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="text-accent font-bold whitespace-nowrap">+{answer.vibeReward} VIBE</span>
                          {answer.txHashes.length > 0 && (
                            <a
                              href={`https://sepolia.basescan.org/tx/${answer.txHashes[0]}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View tx
                            </a>
                          )}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-4 border-t border-border text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-muted-foreground">Answered by </span>
                          <span className="font-mono text-primary break-all">
                            {answer.displayName || answer.author.slice(0, 6) + '...' + answer.author.slice(-4)}
                          </span>
                          <span className="text-muted-foreground whitespace-nowrap">{formatTimeAgo(answer.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-base text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No answers yet. Be the first to help!</p>
            </div>
          )}
        </section>

        {/* Answer Form */}
        <section className="mt-8 card-base space-y-4 animate-slide-in-up">
          <h2 className="text-xl font-bold">Your Answer</h2>

          {!isConnected ? (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
              <Wallet className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">Wallet not connected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Connect your wallet to answer questions and earn VIBE rewards.
                </p>
                <div className="mt-3">
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <button
                        onClick={openConnectModal}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        Connect Wallet
                      </button>
                    )}
                  </ConnectButton.Custom>
                </div>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Share your knowledge... Include code examples if helpful. Markdown supported."
                className="w-full h-48 bg-muted p-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                disabled={isSubmitting}
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI || isSubmitting}
                    className="btn-secondary gap-2 text-sm disabled:opacity-50 whitespace-nowrap"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate AI Draft
                      </>
                    )}
                  </button>
                  <p className="text-xs text-muted-foreground break-words">
                    {answerContent.length} characters • Accepted answers earn VIBE tokens!
                  </p>
                </div>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !answerContent.trim()}
                  className="btn-primary gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Post Answer
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
      <Footer />
    </main>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return date.toLocaleDateString()
}

