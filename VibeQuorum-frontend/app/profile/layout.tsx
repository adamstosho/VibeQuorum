import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#0a0e27",
}

export const metadata: Metadata = {
  title: "Profile",
  description: "View your VibeQuorum profile, reputation score, VIBE token balance, questions, answers, and on-chain reward history.",
  openGraph: {
    title: "Profile | VibeQuorum",
    description: "View your VibeQuorum profile, reputation score, and VIBE token rewards.",
  },
  twitter: {
    title: "Profile | VibeQuorum",
    description: "View your VibeQuorum profile, reputation score, and VIBE token rewards.",
  },
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

