"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Bold, Italic, Code2, Plus, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, Wallet } from "lucide-react"
import Link from "next/link"
import { useWallet } from "@/hooks/use-wallet"
import { useQuestions } from "@/hooks/use-questions"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function AskPage() {
  const router = useRouter()
  const { address, isConnected, shortAddress } = useWallet()
  const { createQuestion } = useQuestions()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const suggestedTags = ["solidity", "erc20", "web3", "react", "security", "proxy", "defi", "nft"]

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first")
      return
    }

    if (!title.trim()) {
      setError("Please enter a title")
      return
    }

    if (title.trim().length < 10) {
      setError("Title must be at least 10 characters")
      return
    }

    if (!description.trim()) {
      setError("Please enter a description")
      return
    }

    if (description.trim().length < 30) {
      setError("Description must be at least 30 characters")
      return
    }

    if (tags.length === 0) {
      setError("Please add at least one tag")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const question = createQuestion({
        title: title.trim(),
        description: description.trim(),
        tags,
        author: address,
        displayName: shortAddress,
      })

      // Redirect to the new question
      router.push(`/questions/${question.id}`)
    } catch (err) {
      setError("Failed to create question. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/questions"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors duration-200 animate-slide-in-down"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Questions
        </Link>

        <div className="card-base space-y-6 animate-slide-in-up">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ask a Question</h1>
            <p className="text-muted-foreground">
              Help the community help you. Provide context, code examples, and clear description.
            </p>
          </div>

          {/* Wallet Connection Warning */}
          {!isConnected && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
              <Wallet className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">Wallet not connected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Connect your wallet to ask questions and earn VIBE rewards.
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
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2 animate-slide-in-up" style={{ animationDelay: "50ms" }}>
            <label className="text-sm font-semibold">Question Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Why does my ERC20 transfer revert?"
              className="w-full bg-muted p-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              maxLength={120}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">{title.length}/120 • Be specific and descriptive</p>
          </div>

          <div className="space-y-2 animate-slide-in-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Description *</label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {showPreview ? (
                  <>
                    <Eye className="h-3 w-3" />
                    Preview
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    Editor
                  </>
                )}
              </button>
            </div>

            <div className="border border-border rounded overflow-hidden">
              {/* Toolbar */}
              <div className="flex gap-1 p-2 border-b border-border bg-muted/30 flex-wrap">
                <button className="p-2 hover:bg-muted rounded transition-colors duration-200" title="Bold">
                  <Bold className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-muted rounded transition-colors duration-200" title="Italic">
                  <Italic className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-muted rounded transition-colors duration-200" title="Code">
                  <Code2 className="h-4 w-4" />
                </button>
                <div className="flex-1" />
                <span className="text-xs text-muted-foreground px-2 py-2">Markdown supported</span>
              </div>

              {/* Editor/Preview */}
              {!showPreview ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your problem in detail. Include code snippets, error messages, and what you've already tried."
                  className="w-full h-48 bg-background p-3 text-sm focus:outline-none resize-none"
                  disabled={isSubmitting}
                />
              ) : (
                <div className="w-full h-48 bg-background p-3 text-sm overflow-auto">
                  <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-foreground">{description || "No content to preview"}</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">{description.length} characters • Min 30 required</p>
          </div>

          {/* Tags */}
          <div className="space-y-2 animate-slide-in-up" style={{ animationDelay: "150ms" }}>
            <label className="text-sm font-semibold">Tags (1-5) *</label>

            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span key={tag} className="badge gap-2 bg-primary text-primary-foreground">
                  {tag}
                  <button 
                    onClick={() => removeTag(tag)} 
                    className="hover:opacity-70 transition-opacity duration-200"
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tags..."
                className="flex-1 bg-muted p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                disabled={isSubmitting}
              />
              <button
                onClick={addTag}
                disabled={tags.length >= 5 || isSubmitting}
                className="btn-secondary gap-2 disabled:opacity-50 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Suggested tags:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => !tags.includes(tag) && tags.length < 5 && setTags([...tags, tag])}
                    disabled={tags.includes(tag) || tags.length >= 5 || isSubmitting}
                    className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/70 disabled:opacity-50 transition-all duration-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex gap-3 pt-4 border-t border-border animate-slide-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !isConnected}
              className="btn-primary flex-1 hover:shadow-lg transition-all duration-200 disabled:opacity-50 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Question"
              )}
            </button>
            <Link href="/questions" className="btn-secondary hover:shadow-lg transition-all duration-200">
              Cancel
            </Link>
          </div>

          {/* Help Text */}
          <div
            className="bg-muted/20 border border-border/50 rounded p-4 space-y-2 animate-slide-in-up"
            style={{ animationDelay: "250ms" }}
          >
            <p className="font-semibold text-sm">Tips for great questions:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Be specific - include code, error messages, and context</li>
              <li>Search first - your question might already be answered</li>
              <li>Use proper formatting - code blocks and markdown</li>
              <li>Show what you've tried - community appreciates effort</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
