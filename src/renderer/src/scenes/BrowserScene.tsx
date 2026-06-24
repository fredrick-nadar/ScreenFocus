import React from 'react'
import { SceneProps } from './index'

export const BrowserScene: React.FC<SceneProps> = ({ timeOfDay }) => {
  const isDawn = timeOfDay === 'dawn'
  const isDusk = timeOfDay === 'dusk'
  const isNight = timeOfDay === 'night'

  const skyColor = isDawn ? '#261800' : isDusk ? '#0f0900' : isNight ? '#0a0600' : '#1a1200'
  const starOpacity = isNight ? 0.6 : 0.0

  return (
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 340 88" xmlns="http://www.w3.org/2000/svg">
      {/* Sky */}
      <rect width="100%" height="100%" fill={skyColor} />

      {/* Stars */}
      <circle cx="50" cy="20" r="1" fill={`rgba(255,255,255,${starOpacity})`} />
      <circle cx="150" cy="15" r="1.5" fill={`rgba(255,255,255,${starOpacity})`} />
      <circle cx="280" cy="30" r="1" fill={`rgba(255,255,255,${starOpacity})`} />

      {/* Sun / Moon */}
      {isNight ? (
        // Moon
        <g transform="translate(260, 30)">
          <circle cx="0" cy="0" r="16" fill="#e2e8f0" />
          <circle cx="4" cy="-4" r="14" fill={skyColor} />
        </g>
      ) : (
        // Sun
        <g transform="translate(260, 40)">
          <circle cx="0" cy="0" r="28" fill="#cc8800" />
          <circle cx="0" cy="0" r="20" fill="#ffaa00" />
          <circle cx="0" cy="0" r="12" fill="#ffd060" />
        </g>
      )}

      {/* Clouds */}
      <ellipse cx="80" cy="25" rx="35" ry="10" fill="#291c00" opacity="0.4" />
      <ellipse cx="200" cy="15" rx="45" ry="12" fill="#291c00" opacity="0.5" />

      {/* Dunes */}
      <ellipse cx="80" cy="100" rx="180" ry="50" fill="#291c00" />
      <ellipse cx="280" cy="110" rx="160" ry="60" fill="#3d2900" />
      <ellipse cx="170" cy="130" rx="200" ry="70" fill="#4a3400" />
    </svg>
  )
}
