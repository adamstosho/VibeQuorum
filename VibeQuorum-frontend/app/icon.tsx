import { ImageResponse } from "next/og"

export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width="32"
        height="32"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="faviconGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="48" height="48" rx="10" fill="#0a0e27" />

        {/* Hexagon */}
        <path
          d="M24 6L40 15V33L24 42L8 33V15L24 6Z"
          fill="none"
          stroke="url(#faviconGradient)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M24 10L36 17V31L24 38L12 31V17L24 10Z"
          fill="url(#faviconGradient)"
          opacity="0.2"
        />

        {/* V mark */}
        <path
          d="M17 17L24 33L31 17"
          fill="none"
          stroke="url(#faviconGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Top accent */}
        <circle cx="24" cy="12" r="2.5" fill="url(#faviconGold)" />
      </svg>
    ),
    {
      ...size,
    }
  )
}

