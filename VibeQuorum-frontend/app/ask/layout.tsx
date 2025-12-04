import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#0a0e27",
}

export const metadata: Metadata = {
  title: "Ask a Question",
  description: "Ask your Web3 development question and get expert answers from the community. Supports Solidity, smart contracts, DeFi, NFTs, and more.",
  openGraph: {
    title: "Ask a Question | VibeQuorum",
    description: "Ask your Web3 development question and get expert answers from the community.",
  },
  twitter: {
    title: "Ask a Question | VibeQuorum",
    description: "Ask your Web3 development question and get expert answers from the community.",
  },
}

export default function AskLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

