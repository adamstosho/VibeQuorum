import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#0a0e27",
}

export const metadata: Metadata = {
  title: "Browse Questions",
  description: "Explore Web3 development questions on Solidity, DeFi, NFTs, smart contracts, and more. Find answers from expert developers and earn VIBE tokens.",
  openGraph: {
    title: "Browse Questions | VibeQuorum",
    description: "Explore Web3 development questions on Solidity, DeFi, NFTs, smart contracts, and more.",
  },
  twitter: {
    title: "Browse Questions | VibeQuorum",
    description: "Explore Web3 development questions on Solidity, DeFi, NFTs, smart contracts, and more.",
  },
}

export default function QuestionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

