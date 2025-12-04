import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#0a0e27",
}

export const metadata: Metadata = {
  title: "Question Details",
  description: "View question details, expert answers, AI-generated drafts, and VIBE token rewards on VibeQuorum.",
  openGraph: {
    title: "Question | VibeQuorum",
    description: "View question details, expert answers, and earn VIBE token rewards.",
  },
  twitter: {
    title: "Question | VibeQuorum",
    description: "View question details, expert answers, and earn VIBE token rewards.",
  },
}

export default function QuestionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

