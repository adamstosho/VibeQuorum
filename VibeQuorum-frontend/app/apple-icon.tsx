import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="appleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="appleGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="appleCyan" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06d6a0" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="180" height="180" rx="40" fill="#0a0e27" />

        {/* Outer hexagon */}
        <path
          d="M90 25L155 57.5V122.5L90 155L25 122.5V57.5L90 25Z"
          fill="none"
          stroke="url(#appleGradient)"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Inner hexagon fill */}
        <path
          d="M90 38L142 65V115L90 142L38 115V65L90 38Z"
          fill="url(#appleGradient)"
          opacity="0.15"
        />

        {/* Main V mark */}
        <path
          d="M60 60L90 125L120 60"
          fill="none"
          stroke="url(#appleGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner V highlight */}
        <path
          d="M68 68L90 110L112 68"
          fill="none"
          stroke="url(#appleCyan)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />

        {/* Top accent dot */}
        <circle cx="90" cy="45" r="7" fill="url(#appleGold)" />

        {/* Side dots */}
        <circle cx="38" cy="90" r="5" fill="url(#appleGradient)" opacity="0.7" />
        <circle cx="142" cy="90" r="5" fill="url(#appleGradient)" opacity="0.7" />

        {/* Bottom accent */}
        <circle cx="90" cy="135" r="5" fill="url(#appleGold)" opacity="0.6" />
      </svg>
    ),
    {
      ...size,
    }
  )
}

