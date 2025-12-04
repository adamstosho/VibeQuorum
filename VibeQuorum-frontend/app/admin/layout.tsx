import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#0a0e27",
}

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "VibeQuorum admin dashboard for managing rewards, monitoring transactions, and platform metrics.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Admin Panel | VibeQuorum",
    description: "VibeQuorum admin dashboard for managing rewards and platform operations.",
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

