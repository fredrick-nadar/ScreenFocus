import React from 'react'
import { SceneProps } from './index'

export const EditorScene: React.FC<SceneProps> = ({ timeOfDay }) => {
  const isDusk = timeOfDay === 'dusk'
  const isDawn = timeOfDay === 'dawn'
  const isNight = timeOfDay === 'night'

  const brightLineColor = isDusk ? '#a06030' : '#388bfd'
  const brightLineOpacity = isDawn ? 0.4 : 1.0
  const starOpacity = isNight ? 0.4 : 0.0

  return (
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 340 88" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="100%" height="100%" fill="#0d1117" />
      
      {/* Stars (night modifier) */}
      <circle cx="280" cy="20" r="1" fill={`rgba(255,255,255,${starOpacity})`} />
      <circle cx="310" cy="40" r="1.5" fill={`rgba(255,255,255,${starOpacity})`} />
      <circle cx="260" cy="60" r="0.8" fill={`rgba(255,255,255,${starOpacity})`} />

      {/* Subtle cloud shapes top-right */}
      <ellipse cx="320" cy="10" rx="40" ry="20" fill="#1c2128" opacity="0.8" />
      <ellipse cx="280" cy="-5" rx="50" ry="25" fill="#1c2128" opacity="0.6" />

      {/* Vertical code lines */}
      <rect x="20" y="20" width="80" height="4" fill="#21262d" rx="2" />
      <rect x="20" y="32" width="120" height="4" fill="#21262d" rx="2" />
      <rect x="20" y="44" width="60" height="4" fill="#21262d" rx="2" />
      <rect x="85" y="44" width="40" height="4" fill={brightLineColor} opacity={brightLineOpacity} rx="2" />
      <rect x="20" y="56" width="100" height="4" fill="#21262d" rx="2" />
      <rect x="35" y="68" width="80" height="4" fill="#21262d" rx="2" />
      <rect x="120" y="68" width="30" height="4" fill={brightLineColor} opacity={brightLineOpacity} rx="2" />

      <rect x="160" y="20" width="40" height="4" fill="#21262d" rx="2" />
      <rect x="205" y="20" width="50" height="4" fill={brightLineColor} opacity={brightLineOpacity} rx="2" />
      <rect x="160" y="32" width="90" height="4" fill="#21262d" rx="2" />
      <rect x="175" y="44" width="70" height="4" fill="#21262d" rx="2" />
    </svg>
  )
}
