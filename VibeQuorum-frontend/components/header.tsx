"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Wallet, ChevronDown, Zap, ExternalLink, Copy, Check } from "lucide-react"
import Logo from "./logo"
import { useWallet } from "@/hooks/use-wallet"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const { 
    address, 
    isConnected, 
    isConnecting,
    shortAddress, 
    vibeBalanceFormatted, 
    nativeBalance,
    nativeSymbol,
    chainName,
    disconnect,
    explorerUrl,
  } = useWallet()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-xl animate-slide-in-down">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo with animation */}
        <Link
          href="/"
          className="group transition-all duration-300 hover:opacity-90"
        >
          <Logo size="md" showText={true} animated={true} className="hidden sm:flex" />
          <Logo size="sm" showText={false} animated={true} className="sm:hidden" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Questions", href: "/questions" },
            { label: "Ask", href: "/ask" },
            { label: "Profile", href: "/profile" },
            { label: "Admin", href: "/admin" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 relative group"
            >
              {item.label}
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </nav>

        {/* Wallet + Mobile Menu */}
        <div className="flex items-center gap-3 md:gap-4">
          {mounted && isConnected ? (
            <div className="relative group">
              <button
                onClick={() => setWalletOpen(!walletOpen)}
                className="btn-primary gap-2 relative text-sm md:text-base transition-all duration-300"
              >
                <Wallet className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">{shortAddress}</span>
                <span className="sm:hidden">Wallet</span>

                <span className="ml-1 inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-xs font-bold">
                  <Zap className="h-3 w-3" />
                  {vibeBalanceFormatted}
                </span>

                <ChevronDown
                  className="h-4 w-4 transition-transform duration-300"
                  style={{
                    transform: walletOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Wallet Dropdown */}
              {walletOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl shadow-primary/20 animate-scale-in origin-top-right">
                  <div className="p-4 space-y-3 text-sm">
                    {/* Connected Wallet */}
                    <div className="px-3 py-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground font-medium">Connected Wallet</p>
                        <span className="text-xs text-primary">{chainName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs font-bold text-foreground flex-1">{shortAddress}</p>
                        <button 
                          onClick={copyAddress}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Copy address"
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                        {explorerUrl && (
                          <a 
                            href={explorerUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="View on explorer"
                          >
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {/* VIBE Balance */}
                    <div className="px-3 py-3 rounded-lg bg-accent/10 border border-accent/20">
                      <p className="text-xs text-muted-foreground font-medium mb-1">VIBE Balance</p>
                      <p className="font-bold text-accent text-lg">{vibeBalanceFormatted} VIBE</p>
                    </div>
                    
                    {/* Native Balance */}
                    <div className="px-3 py-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Native Balance</p>
                      <p className="font-semibold text-sm">{parseFloat(nativeBalance).toFixed(4)} {nativeSymbol}</p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        disconnect()
                        setWalletOpen(false)
                      }}
                      className="w-full btn-secondary text-xs py-2 transition-all duration-200"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : mounted ? (
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, mounted: buttonMounted, openChainModal, openAccountModal }) => {
                const ready = buttonMounted
                const connected = ready && account && chain

                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    disabled={isConnecting || !ready}
                    className="btn-primary gap-2 text-sm md:text-base disabled:opacity-50"
                  >
                    <Wallet className="h-4 w-4 md:h-5 md:w-5" />
                    {isConnecting ? (
                      <span>Connecting...</span>
                    ) : (
                      <span className="hidden sm:inline">Connect Wallet</span>
                    )}
                    <span className="sm:hidden">{isConnecting ? "..." : "Connect"}</span>
                  </button>
                )
              }}
            </ConnectButton.Custom>
          ) : (
            <div className="btn-primary gap-2 text-sm md:text-base opacity-50">
              <Wallet className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden btn-ghost p-2 transition-all duration-300"
          >
            {menuOpen ? (
              <X className="h-5 w-5 transition-transform duration-300 rotate-90" />
            ) : (
              <Menu className="h-5 w-5 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card/50 backdrop-blur-xl p-4 space-y-2 animate-slide-in-down">
          {mounted && isConnected && (
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg mb-2">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm font-bold text-accent">{vibeBalanceFormatted} VIBE</span>
            </div>
          )}
          {[
            { label: "Questions", href: "/questions" },
            { label: "Ask", href: "/ask" },
            { label: "Profile", href: "/profile" },
            { label: "Admin", href: "/admin" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-primary px-4 py-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
      
      {/* Click outside to close wallet dropdown */}
      {walletOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setWalletOpen(false)}
        />
      )}
    </header>
  )
}
