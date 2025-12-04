"use client"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  animated?: boolean
  className?: string
}

export default function Logo({ size = "md", showText = true, animated = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 44, text: "text-2xl" },
  }

  const { icon, text } = sizes[size]

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Animated SVG Logo Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          {/* Main gradient */}
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
            {animated && (
              <animateTransform
                attributeName="gradientTransform"
                type="rotate"
                from="0 0.5 0.5"
                to="360 0.5 0.5"
                dur="8s"
                repeatCount="indefinite"
              />
            )}
          </linearGradient>

          {/* Secondary gradient for inner elements */}
          <linearGradient id="logoGradientSecondary" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06d6a0" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* Gold accent gradient */}
          <linearGradient id="logoGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Drop shadow */}
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#2563eb" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Outer hexagon frame */}
        <path
          d="M24 4L42.5 14V34L24 44L5.5 34V14L24 4Z"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#logoShadow)"
        >
          {animated && (
            <animate
              attributeName="stroke-dasharray"
              values="0 200;200 0"
              dur="2s"
              fill="freeze"
            />
          )}
        </path>

        {/* Inner hexagon fill */}
        <path
          d="M24 8L38 16V32L24 40L10 32V16L24 8Z"
          fill="url(#logoGradient)"
          opacity="0.15"
        >
          {animated && (
            <animate
              attributeName="opacity"
              values="0.1;0.2;0.1"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Stylized V mark - main stroke */}
        <path
          d="M16 16L24 34L32 16"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#logoGlow)"
        >
          {animated && (
            <>
              <animate
                attributeName="stroke-dasharray"
                values="0 60;60 0"
                dur="1s"
                fill="freeze"
                begin="0.5s"
              />
              <animate
                attributeName="stroke-width"
                values="3.5;4;3.5"
                dur="2s"
                repeatCount="indefinite"
              />
            </>
          )}
        </path>

        {/* Inner V highlight */}
        <path
          d="M18 18L24 30L30 18"
          fill="none"
          stroke="url(#logoGradientSecondary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        >
          {animated && (
            <animate
              attributeName="opacity"
              values="0.4;0.8;0.4"
              dur="2.5s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Top accent dot */}
        <circle
          cx="24"
          cy="12"
          r="2"
          fill="url(#logoGoldGradient)"
          filter="url(#logoGlow)"
        >
          {animated && (
            <>
              <animate
                attributeName="r"
                values="1.5;2.5;1.5"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </>
          )}
        </circle>

        {/* Side node dots */}
        <circle cx="10" cy="24" r="1.5" fill="url(#logoGradient)" opacity="0.7">
          {animated && (
            <animate
              attributeName="opacity"
              values="0.5;0.9;0.5"
              dur="3s"
              repeatCount="indefinite"
              begin="0.5s"
            />
          )}
        </circle>
        <circle cx="38" cy="24" r="1.5" fill="url(#logoGradient)" opacity="0.7">
          {animated && (
            <animate
              attributeName="opacity"
              values="0.5;0.9;0.5"
              dur="3s"
              repeatCount="indefinite"
              begin="1s"
            />
          )}
        </circle>

        {/* Bottom accent */}
        <circle cx="24" cy="36" r="1.5" fill="url(#logoGoldGradient)" opacity="0.6">
          {animated && (
            <animate
              attributeName="opacity"
              values="0.4;0.8;0.4"
              dur="2.5s"
              repeatCount="indefinite"
              begin="0.3s"
            />
          )}
        </circle>

        {/* Connecting lines from V tip to bottom */}
        <line
          x1="24"
          y1="34"
          x2="24"
          y2="36"
          stroke="url(#logoGoldGradient)"
          strokeWidth="1"
          opacity="0.5"
        >
          {animated && (
            <animate
              attributeName="opacity"
              values="0.3;0.7;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </line>
      </svg>

      {/* Text */}
      {showText && (
        <span className={`font-bold ${text} bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto] ${animated ? 'animate-gradient-shift' : ''}`}>
          VibeQuorum
        </span>
      )}
    </div>
  )
}

// Compact icon-only version for favicons or small spaces
export function LogoIcon({ size = 36, animated = true }: { size?: number; animated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="logoIconGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd166" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="iconGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hexagon */}
      <path
        d="M24 4L42.5 14V34L24 44L5.5 34V14L24 4Z"
        fill="none"
        stroke="url(#logoIconGradient)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 8L38 16V32L24 40L10 32V16L24 8Z"
        fill="url(#logoIconGradient)"
        opacity="0.15"
      />

      {/* V */}
      <path
        d="M16 16L24 34L32 16"
        fill="none"
        stroke="url(#logoIconGradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#iconGlow)"
      />

      {/* Accents */}
      <circle cx="24" cy="12" r="2" fill="url(#logoIconGold)" />
    </svg>
  )
}

