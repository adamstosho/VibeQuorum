"use client"

import { ArrowUp, MessageCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface QuestionCardProps {
  id: number
  title: string
  excerpt: string
  author: string
  displayName: string
  tags: string[]
  answers: number
  upvotes: number
  createdAt: string
  acceptedAnswer: boolean
}

export default function QuestionCard({
  id,
  title,
  excerpt,
  author,
  displayName,
  tags,
  answers,
  upvotes,
  createdAt,
  acceptedAnswer,
}: QuestionCardProps) {
  return (
    <Link href={`/question/${id}`}>
      <div className="card-base space-y-3 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors duration-200 line-clamp-2">
                {title}
              </h3>
              {acceptedAnswer && <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5 animate-pulse" />}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-muted-foreground transition-colors duration-200">
              {excerpt}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="text-xs badge hover:bg-primary/20 transition-colors duration-200">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border text-xs text-muted-foreground">
          <div className="space-y-1">
            <p className="font-mono text-xs">{displayName}</p>
            <p className="text-xs">{createdAt}</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1 transition-colors duration-200 group-hover:text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              {answers}
            </div>
            <div className="flex items-center gap-1 text-primary transition-colors duration-200 group-hover:text-primary/80">
              <ArrowUp className="h-3 w-3" />
              {upvotes}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
