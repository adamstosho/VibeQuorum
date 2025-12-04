import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0e27",
}

export const metadata: Metadata = {
  title: {
    default: "VibeQuorum - Web3 Q&A Platform with On-Chain Rewards",
    template: "%s | VibeQuorum",
  },
  description: "Ask technical questions, get AI-assisted answers, and earn VibeTokens on-chain. The Web3 developer community powered by incentives.",
  keywords: ["Web3", "blockchain", "Q&A", "developer", "Solidity", "smart contracts", "DeFi", "NFT", "cryptocurrency", "token rewards"],
  authors: [{ name: "VibeQuorum" }],
  creator: "VibeQuorum",
  publisher: "VibeQuorum",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "VibeQuorum",
    title: "VibeQuorum - Web3 Q&A Platform with On-Chain Rewards",
    description: "Ask technical questions, get AI-assisted answers, and earn VibeTokens on-chain. The Web3 developer community powered by incentives.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeQuorum - Web3 Q&A Platform with On-Chain Rewards",
    description: "Ask technical questions, get AI-assisted answers, and earn VibeTokens on-chain.",
    creator: "@VibeQuorum",
  },
  metadataBase: new URL("https://vibequorum.com"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased bg-background text-foreground`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
