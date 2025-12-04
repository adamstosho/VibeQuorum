"use client"

import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { ArrowUp, MessageCircle, Award, CheckCircle, Sparkles, Copy, Share2, Bookmark, ArrowLeft } from "lucide-react"

export default function QuestionPage() {
  const [userUpvote, setUserUpvote] = useState(false)
  const [showAIDraft, setShowAIDraft] = useState(false)
  const [showAnswerEditor, setShowAnswerEditor] = useState(false)
  const [answerText, setAnswerText] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  const question = {
    id: 1,
    title: "Why does my ERC20 transfer revert on Goerli testnet?",
    description:
      "I'm implementing an ERC20 token contract using OpenZeppelin standards. The contract deploys successfully, but when I try to transfer tokens, I get a revert. Here's my contract:\n\n```solidity\nimport '@openzeppelin/contracts/token/ERC20/ERC20.sol';\n\ncontract MyToken is ERC20 {\n    constructor() ERC20('My', 'MY') {\n        _mint(msg.sender, 1000 * 10 ** 18);\n    }\n}\n```\n\nAnd I'm calling transfer like: `await token.transfer(recipient, amount)`. What am I missing?",
    author: "0x742d35Cc6634C0532925a3b844Bc9e7595f89Ac",
    displayName: "alice.eth",
    tags: ["solidity", "erc20", "debugging"],
    upvotes: 24,
    createdAt: "2025-01-15 14:32",
    answers: 3,
    acceptedAnswerId: 1,
  }

  const answers = [
    {
      id: 1,
      author: "0x8a14A6B4b4F1c1E3F5B7d8A9e2c4d6f8A9e2c4d",
      displayName: "bob.dev",
      content:
        "You need to approve the transfer first! ERC20 requires approval before transferring. Here's the fix:\n\n```solidity\n// First approve\nawait token.approve(recipient, amount);\n// Then transfer\nawait token.transfer(recipient, amount);\n```\n\nOr use transferFrom which is safer in many cases. Make sure the recipient address is valid and you have enough balance.",
      upvotes: 18,
      createdAt: "2025-01-15 14:45",
      isAccepted: true,
      aiGenerated: false,
      vibe: 50,
      txHash: "0x1234...5678",
    },
    {
      id: 2,
      author: "0x1234567890123456789012345678901234567890",
      displayName: "charlie.web3",
      content:
        "I had the same issue. Check your gas settings too. Sometimes reverts happen silently if gas is too low.",
      upvotes: 5,
      createdAt: "2025-01-15 15:20",
      isAccepted: false,
      aiGenerated: false,
      vibe: 0,
      txHash: null,
    },
  ]

  const aiDraft = {
    content:
      "The issue is likely that you're not calling approve before transfer. ERC20 tokens require explicit approval for transfers to proceed.\n\nIn your case, you should:\n1. Call `approve(recipient, amount)` first\n2. Then call `transfer(recipient, amount)`\n\nAlternatively, use `transferFrom` with proper authorization setup. Also verify:\n- The recipient address is valid (not 0x0)\n- You have sufficient balance\n- Gas is sufficient",
  }

  const handleGenerateAIDraft = () => {
    setAiLoading(true)
    setTimeout(() => {
      setAiLoading(false)
      setShowAIDraft(true)
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Back Navigation */}
        <Link
          href="/questions"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors duration-200 animate-slide-in-down"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Questions
        </Link>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Main Column */}
          <div className="md:col-span-3 space-y-8">
            {/* Question */}
            <div className="card-base space-y-6 animate-slide-in-up">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl font-bold leading-tight">{question.title}</h1>
                </div>

                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <span key={tag} className="badge text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="prose prose-invert text-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">{question.description}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-mono text-xs">{question.author}</p>
                  <p className="text-xs">
                    {question.displayName} • {question.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    onClick={() => setUserUpvote(!userUpvote)}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-all duration-200 ${
                      userUpvote
                        ? "bg-primary/20 text-primary shadow-lg shadow-primary/20"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <ArrowUp className="h-4 w-4" />
                    {question.upvotes + (userUpvote ? 1 : 0)}
                  </button>
                  <button className="btn-secondary gap-2 text-sm">
                    <MessageCircle className="h-4 w-4" />
                    {question.answers}
                  </button>
                  <button className="btn-ghost gap-2 text-sm">
                    <Bookmark className="h-4 w-4" />
                  </button>
                  <button className="btn-ghost gap-2 text-sm">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="card-base border-2 border-secondary/30 space-y-3 animate-slide-in-up">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
                <span className="font-semibold text-sm">AI Assistant</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Get an AI-generated draft answer to help you write your response quickly.
              </p>
              <button
                onClick={handleGenerateAIDraft}
                disabled={aiLoading}
                className="btn-primary gap-2 text-sm disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin">⚙️</div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate AI Draft
                  </>
                )}
              </button>

              {/* AI Draft Preview */}
              {showAIDraft && (
                <div className="mt-4 space-y-3 pt-4 border-t border-border animate-slide-in-up">
                  <div className="bg-muted/30 p-4 rounded border border-secondary/20 text-sm">
                    <div className="flex items-start gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                      <p className="font-semibold text-secondary">AI-Generated Draft (Review before posting):</p>
                    </div>
                    <p className="text-foreground leading-relaxed">{aiDraft.content}</p>
                  </div>
                  <button
                    onClick={() => {
                      setAnswerText(aiDraft.content)
                      setShowAnswerEditor(true)
                    }}
                    className="btn-secondary gap-2 text-sm w-full hover:shadow-lg transition-all duration-200"
                  >
                    <Copy className="h-4 w-4" />
                    Use This Draft
                  </button>
                </div>
              )}
            </div>

            {/* Answers */}
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">{question.answers} Answers</h2>

              {answers.map((answer, idx) => (
                <div
                  key={answer.id}
                  className="card-base space-y-4 animate-slide-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {answer.isAccepted && (
                    <div className="flex items-center gap-2 text-success text-xs font-semibold bg-success/10 px-3 py-2 rounded w-fit">
                      <CheckCircle className="h-4 w-4" />
                      Accepted Answer
                    </div>
                  )}

                  {answer.aiGenerated && (
                    <div className="flex items-center gap-2 text-secondary text-xs font-semibold px-2 py-1 bg-secondary/10 rounded w-fit">
                      <Sparkles className="h-3 w-3" />
                      AI Generated
                    </div>
                  )}

                  <p className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">{answer.content}</p>

                  {answer.isAccepted && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-success/10 rounded text-success text-xs font-semibold">
                      <Award className="h-4 w-4" />
                      Rewarded: {answer.vibe} VIBE
                      {answer.txHash && (
                        <a href="#" className="ml-auto text-success hover:underline text-xs font-mono">
                          {answer.txHash}
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      <p className="font-mono text-xs">{answer.author}</p>
                      <p className="text-xs">
                        {answer.displayName} • {answer.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-muted hover:bg-muted/80 transition-colors duration-200">
                        <ArrowUp className="h-4 w-4" />
                        {answer.upvotes}
                      </button>
                      {!answer.isAccepted && (
                        <button className="btn-ghost text-xs hover:shadow-lg transition-all duration-200">
                          Mark Accepted
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Answer Editor */}
            <div className="card-base space-y-4 animate-slide-in-up">
              <h3 className="font-semibold">Post Your Answer</h3>

              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write your answer here... (Markdown supported)"
                className="w-full h-32 bg-muted p-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              />

              <div className="flex gap-2 justify-end">
                <button className="btn-secondary text-sm hover:shadow-lg transition-all duration-200">Cancel</button>
                <button className="btn-primary text-sm hover:shadow-lg transition-all duration-200">Post Answer</button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4 h-fit sticky top-20 animate-slide-in-up">
            <div className="card-base space-y-3">
              <h3 className="font-semibold text-sm">Question Info</h3>

              <div className="space-y-3 text-sm border-t border-border pt-3">
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p className="font-semibold text-success">Answered</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Votes</p>
                  <p className="font-semibold">{question.upvotes}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Views</p>
                  <p className="font-semibold">342</p>
                </div>
              </div>
            </div>

            <div className="card-base space-y-3">
              <h3 className="font-semibold text-sm">Related Tags</h3>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge text-xs cursor-pointer hover:bg-primary/20 transition-colors duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
