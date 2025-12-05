"use client"

import { useState, useEffect, useMemo } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import QuestionCard from "@/components/question-card"
import { Search, Plus, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import { useQuestions } from "@/hooks/use-questions"

const TAGS = ["solidity", "erc20", "security", "proxy", "web3", "react", "contract", "tooling", "defi", "nft", "debugging", "upgrades", "metamask"]

export default function QuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { questions, loading, totalCount } = useQuestions({
    searchQuery: debouncedSearch,
    tags: selectedTags,
    sortBy,
  })

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener("resize", checkDesktop)
    return () => window.removeEventListener("resize", checkDesktop)
  }, [])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Format question data for QuestionCard
  const formattedQuestions = useMemo(() => {
    return questions.map(q => ({
      id: q.id,
      title: q.title,
      excerpt: q.description.slice(0, 150) + (q.description.length > 150 ? "..." : ""),
      author: q.author.slice(0, 6) + "..." + q.author.slice(-4),
      displayName: q.displayName,
      tags: q.tags,
      answers: q.answersCount,
      upvotes: q.votesCount,
      createdAt: formatTimeAgo(q.createdAt),
      acceptedAnswer: q.status === 'closed',
    }))
  }, [questions])

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          <aside className="w-full lg:w-48 space-y-6">
            <div className="flex items-center justify-between lg:hidden mb-4">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn-ghost p-2">
                <Filter className="h-4 w-4" />
              </button>
            </div>

            {(filtersOpen || isDesktop) && (
              <div className="space-y-6 animate-slide-in-down lg:animate-none">
                {/* Sort By */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Sort by</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-card border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                  >
                    <option value="newest">Newest</option>
                    <option value="trending">Most Voted</option>
                    <option value="active">Recently Active</option>
                    <option value="unanswered">Unanswered</option>
                  </select>
                </div>

                {/* Tags Filter */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Tags</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-all duration-200 ${
                          selectedTags.includes(tag)
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            : "bg-card border border-border text-foreground hover:bg-muted hover:border-primary/50"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6 w-full">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch animate-slide-in-up">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                />
              </div>
              <Link
                href="/ask"
                className="btn-primary gap-2 whitespace-nowrap hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Ask Question
              </Link>
            </div>

            {/* Results info */}
            <div className="text-sm text-muted-foreground">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                <span>{totalCount} question{totalCount !== 1 ? 's' : ''} found</span>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-16 space-y-4 card-base animate-pulse">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Loading questions...</p>
                </div>
              ) : formattedQuestions.length > 0 ? (
                formattedQuestions.map((q, idx) => (
                  <div key={q.id} className="animate-slide-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                    <QuestionCard {...q} />
                  </div>
                ))
              ) : (
                /* Empty State */
                <div className="text-center py-16 space-y-4 card-base animate-slide-in-up">
                  <p className="text-muted-foreground">No questions found. Try adjusting your filters.</p>
                  <Link href="/ask" className="btn-primary inline-flex">
                    Ask Your First Question
                  </Link>
                </div>
              )}
            </div>

            {/* Pagination placeholder */}
            {formattedQuestions.length > 0 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <span className="text-sm text-muted-foreground px-4">
                  Showing {formattedQuestions.length} of {totalCount} questions
                </span>
              </div>
            )}
          </div>
        </div>
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
