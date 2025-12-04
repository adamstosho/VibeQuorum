"use client"

import { useEffect, useState, useRef } from "react"

export default function HeroAnimation() {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px] lg:min-h-[600px]">
      {/* Main SVG Animation Container */}
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 40px rgba(37, 99, 235, 0.3))" }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06d6a0" />
          </linearGradient>
          
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          
          <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00b4ff" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          <linearGradient id="nodeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
          </linearGradient>

          {/* Glow filters */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Animated gradient for flowing effect */}
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0">
              <animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#7c3aed" stopOpacity="1">
              <animate attributeName="offset" values="0.5;1.5;0.5" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#06d6a0" stopOpacity="0">
              <animate attributeName="offset" values="1;2;1" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* Radial glow */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0a0e27" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <circle cx="300" cy="300" r="250" fill="url(#centerGlow)" className="animate-pulse-slow" />

        {/* Outer rotating ring */}
        <g className="origin-center" style={{ transformOrigin: "300px 300px" }}>
          <circle
            cx="300"
            cy="300"
            r="220"
            fill="none"
            stroke="url(#primaryGradient)"
            strokeWidth="1"
            strokeDasharray="20 10 5 10"
            opacity="0.4"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 300 300"
              to="360 300 300"
              dur="60s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Middle rotating ring - opposite direction */}
        <g>
          <circle
            cx="300"
            cy="300"
            r="180"
            fill="none"
            stroke="url(#cyanGradient)"
            strokeWidth="1.5"
            strokeDasharray="30 20"
            opacity="0.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 300 300"
              to="0 300 300"
              dur="45s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Inner ring */}
        <g>
          <circle
            cx="300"
            cy="300"
            r="140"
            fill="none"
            stroke="url(#purpleGradient)"
            strokeWidth="2"
            strokeDasharray="10 5"
            opacity="0.6"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 300 300"
              to="360 300 300"
              dur="30s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Blockchain Hexagon Network */}
        <g filter="url(#glow)">
          {/* Central hexagon */}
          <polygon
            points="300,240 352,270 352,330 300,360 248,330 248,270"
            fill="none"
            stroke="url(#primaryGradient)"
            strokeWidth="2"
            opacity="0.9"
          >
            <animate
              attributeName="opacity"
              values="0.9;0.6;0.9"
              dur="3s"
              repeatCount="indefinite"
            />
          </polygon>
          
          {/* Inner hexagon */}
          <polygon
            points="300,260 332,280 332,320 300,340 268,320 268,280"
            fill="url(#nodeGlow)"
            opacity="0.3"
          >
            <animate
              attributeName="opacity"
              values="0.3;0.5;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          </polygon>
        </g>

        {/* Orbiting nodes - Token symbols */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <g key={i}>
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`${angle} 300 300`}
                to={`${angle + 360} 300 300`}
                dur={`${20 + i * 2}s`}
                repeatCount="indefinite"
              />
              <circle
                cx="300"
                cy={100 + i * 10}
                r={8 + (i % 3) * 2}
                fill={i % 2 === 0 ? "url(#goldGradient)" : "url(#cyanGradient)"}
                filter="url(#glow)"
              >
                <animate
                  attributeName="r"
                  values={`${8 + (i % 3) * 2};${10 + (i % 3) * 2};${8 + (i % 3) * 2}`}
                  dur={`${2 + i * 0.3}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </g>
        ))}

        {/* Floating connection lines */}
        <g opacity="0.5">
          {[45, 135, 225, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const x1 = 300 + Math.cos(rad) * 60
            const y1 = 300 + Math.sin(rad) * 60
            const x2 = 300 + Math.cos(rad) * 160
            const y2 = 300 + Math.sin(rad) * 160
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#primaryGradient)"
                strokeWidth="1"
              >
                <animate
                  attributeName="opacity"
                  values="0.3;0.8;0.3"
                  dur={`${2 + i * 0.5}s`}
                  repeatCount="indefinite"
                />
              </line>
            )
          })}
        </g>

        {/* AI Brain Neural Network */}
        <g filter="url(#softGlow)" opacity="0.7">
          {/* Neural connections */}
          {[
            { x1: 300, y1: 300, x2: 220, y2: 200 },
            { x1: 300, y1: 300, x2: 380, y2: 200 },
            { x1: 300, y1: 300, x2: 200, y2: 350 },
            { x1: 300, y1: 300, x2: 400, y2: 350 },
            { x1: 300, y1: 300, x2: 300, y2: 180 },
            { x1: 300, y1: 300, x2: 300, y2: 420 },
          ].map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="url(#cyanGradient)"
              strokeWidth="1"
              strokeDasharray="5 5"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;20"
                dur={`${1 + i * 0.2}s`}
                repeatCount="indefinite"
              />
            </line>
          ))}

          {/* Neural nodes */}
          {[
            { cx: 220, cy: 200, r: 6 },
            { cx: 380, cy: 200, r: 6 },
            { cx: 200, cy: 350, r: 5 },
            { cx: 400, cy: 350, r: 5 },
            { cx: 300, cy: 180, r: 7 },
            { cx: 300, cy: 420, r: 7 },
            { cx: 160, cy: 280, r: 4 },
            { cx: 440, cy: 280, r: 4 },
          ].map((node, i) => (
            <circle
              key={i}
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="url(#primaryGradient)"
              filter="url(#glow)"
            >
              <animate
                attributeName="r"
                values={`${node.r};${node.r + 2};${node.r}`}
                dur={`${1.5 + i * 0.2}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur={`${2 + i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>

        {/* Floating data particles */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * Math.PI / 180
          const radius = 100 + (i % 3) * 40
          return (
            <circle
              key={i}
              cx={300 + Math.cos(angle) * radius}
              cy={300 + Math.sin(angle) * radius}
              r="2"
              fill="#ffd166"
              opacity="0.8"
            >
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur={`${1.5 + (i % 4) * 0.3}s`}
                repeatCount="indefinite"
              />
              <animateMotion
                dur={`${8 + i}s`}
                repeatCount="indefinite"
                path={`M0,0 Q${10 + i * 2},${-10 - i} ${20 + i * 3},0 T${40 + i * 4},0`}
              />
            </circle>
          )
        })}

        {/* Central VIBE Token Symbol */}
        <g filter="url(#softGlow)">
          <circle cx="300" cy="300" r="35" fill="none" stroke="url(#goldGradient)" strokeWidth="3">
            <animate
              attributeName="stroke-width"
              values="3;4;3"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="300" cy="300" r="25" fill="url(#goldGradient)" opacity="0.2">
            <animate
              attributeName="r"
              values="25;28;25"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          
          {/* V Symbol for VIBE */}
          <path
            d="M285 285 L300 320 L315 285"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <animate
              attributeName="opacity"
              values="0.8;1;0.8"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* Sparkle effects */}
        {[
          { cx: 180, cy: 160 },
          { cx: 420, cy: 180 },
          { cx: 150, cy: 400 },
          { cx: 450, cy: 380 },
          { cx: 350, cy: 130 },
          { cx: 250, cy: 470 },
        ].map((sparkle, i) => (
          <g key={i}>
            <circle
              cx={sparkle.cx}
              cy={sparkle.cy}
              r="3"
              fill="#ffd166"
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur={`${2 + i * 0.3}s`}
                repeatCount="indefinite"
                begin={`${i * 0.4}s`}
              />
              <animate
                attributeName="r"
                values="2;4;2"
                dur={`${2 + i * 0.3}s`}
                repeatCount="indefinite"
                begin={`${i * 0.4}s`}
              />
            </circle>
          </g>
        ))}

        {/* Data flow paths */}
        <g opacity="0.6">
          <path
            d="M150 250 Q200 200 250 240 T350 200 Q400 220 450 180"
            fill="none"
            stroke="url(#cyanGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dasharray"
              values="0 1000;500 500;1000 0"
              dur="4s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M150 400 Q220 450 300 380 T450 420"
            fill="none"
            stroke="url(#purpleGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dasharray"
              values="0 1000;500 500;1000 0"
              dur="5s"
              repeatCount="indefinite"
              begin="1s"
            />
          </path>
        </g>

        {/* Pulsing circles emanating from center */}
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx="300"
            cy="300"
            r="50"
            fill="none"
            stroke="url(#primaryGradient)"
            strokeWidth="1"
          >
            <animate
              attributeName="r"
              values="50;200"
              dur="4s"
              repeatCount="indefinite"
              begin={`${i * 1.3}s`}
            />
            <animate
              attributeName="opacity"
              values="0.6;0"
              dur="4s"
              repeatCount="indefinite"
              begin={`${i * 1.3}s`}
            />
          </circle>
        ))}
      </svg>

      {/* Floating elements overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Code brackets floating */}
        <div className="absolute top-[10%] left-[10%] text-primary/30 text-4xl font-mono animate-float" style={{ animationDelay: "0s" }}>
          {"</>"}
        </div>
        <div className="absolute bottom-[20%] right-[15%] text-secondary/30 text-3xl font-mono animate-float-alt" style={{ animationDelay: "1s" }}>
          {"{ }"}
        </div>
        <div className="absolute top-[30%] right-[5%] text-cyan-400/20 text-2xl font-mono animate-float" style={{ animationDelay: "0.5s" }}>
          {"0x"}
        </div>
        <div className="absolute bottom-[10%] left-[20%] text-amber-400/20 text-2xl font-mono animate-float-alt" style={{ animationDelay: "1.5s" }}>
          {"#"}
        </div>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 -left-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-10 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
    </div>
  )
}

