import React from 'react'
import { SceneProps } from './index'

export const AiScene: React.FC<SceneProps> = ({ timeOfDay }) => {
  const isNight = timeOfDay === 'night'
  const starOpacityMult = isNight ? 1.5 : 1.0

  return (
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 340 88" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="100%" height="100%" fill="#060d12" />

      {/* Stars */}
      <circle cx="40" cy="20" r="1" fill={`rgba(255,255,255,${0.4 * starOpacityMult})`} />
      <circle cx="90" cy="60" r="1.5" fill={`rgba(255,255,255,${0.3 * starOpacityMult})`} />
      <circle cx="160" cy="15" r="0.8" fill={`rgba(255,255,255,${0.6 * starOpacityMult})`} />
      <circle cx="220" cy="40" r="2" fill={`rgba(255,255,255,${0.3 * starOpacityMult})`} />
      <circle cx="280" cy="10" r="1.2" fill={`rgba(255,255,255,${0.5 * starOpacityMult})`} />
      <circle cx="310" cy="50" r="1" fill={`rgba(255,255,255,${0.4 * starOpacityMult})`} />

      {/* Crosshairs */}
      <line x1="170" y1="0" x2="170" y2="88" stroke="#ffffff" strokeWidth="1" opacity="0.08" />
      <line x1="0" y1="44" x2="340" y2="44" stroke="#ffffff" strokeWidth="1" opacity="0.08" />

      {/* Ground plane */}
      <ellipse cx="170" cy="110" rx="200" ry="40" fill="#03070a" />

      {/* Central orb */}
      <circle cx="170" cy="44" r="32" fill="#0a1f2e" />
      <circle cx="170" cy="44" r="22" fill="#0f3b4a" />
      <circle cx="170" cy="44" r="12" fill="#14665c" />
      <circle cx="170" cy="44" r="4" fill="#1d9e75" />
    </svg>
  )
}
