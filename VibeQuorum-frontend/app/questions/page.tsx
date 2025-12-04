"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import QuestionCard from "@/components/question-card"
import { Search, Plus, Filter } from "lucide-react"
import Link from "next/link"

const QUESTIONS = [
  {
    id: 1,
    title: "Why does my ERC20 transfer revert on Goerli testnet?",
    excerpt:
      "I'm implementing an ERC20 token contract and transfers are reverting. I've set up the contract with OpenZeppelin but...",
    author: "0x742d...89Ac",
    displayName: "alice.eth",
    tags: ["solidity", "erc20"],
    answers: 3,
    upvotes: 24,
    createdAt: "2 hours ago",
    acceptedAnswer: true,
  },
  {
    id: 2,
    title: "Best practices for secure contract upgrades",
    excerpt:
      "What are the best patterns for upgrading contracts while maintaining security? I've been reading about proxy patterns...",
    author: "0x8a14...3Ff2",
    displayName: "bob.dev",
    tags: ["security", "proxy", "contract"],
    answers: 5,
    upvotes: 42,
    createdAt: "5 hours ago",
    acceptedAnswer: true,
  },
  {
    id: 3,
    title: "How to integrate MetaMask in React app",
    excerpt: "I need to connect MetaMask to my React application. I've tried using web3.js but I'm not sure about...",
    author: "0x1234...5678",
    displayName: "charlie.web3",
    tags: ["web3", "react", "tooling"],
    answers: 7,
    upvotes: 31,
    createdAt: "1 day ago",
    acceptedAnswer: false,
  },
]

export default function QuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  const TAGS = ["solidity", "erc20", "security", "proxy", "web3", "react", "contract", "tooling", "defi", "nft"]

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener("resize", checkDesktop)
    return () => window.removeEventListener("resize", checkDesktop)
  }, [])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

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
                  <div className="space-y-2">
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

            {/* Questions List */}
            <div className="space-y-3">
              {QUESTIONS.length > 0 ? (
                QUESTIONS.map((q, idx) => (
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

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-8">
              <button className="btn-secondary text-sm">Previous</button>
              <span className="text-sm text-muted-foreground px-4">Page 1 of 3</span>
              <button className="btn-primary text-sm">Next</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
