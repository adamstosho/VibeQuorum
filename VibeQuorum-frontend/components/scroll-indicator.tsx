"use client"

import { useEffect, useState } from "react"

export default function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-float">
      <div className="flex flex-col items-center gap-2 text-primary/70 hover:text-primary transition-colors">
        <span className="text-xs font-medium uppercase tracking-wide">Scroll to explore</span>
        <div className="h-5 w-5 text-primary animate-bounce">
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}
