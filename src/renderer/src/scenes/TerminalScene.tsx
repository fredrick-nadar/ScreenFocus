import React from 'react'
import { SceneProps } from './index'

export const TerminalScene: React.FC<SceneProps> = ({ timeOfDay }) => {
  const isNight = timeOfDay === 'night'
  const cursorOpacity = isNight ? 1.0 : 0.8
  const cursorColor = isNight ? '#00ff00' : '#4CAF50'

  return (
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 340 88" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="100%" height="100%" fill="#0d0d0d" />

      {/* Tabs */}
      <rect x="20" y="8" width="80" height="20" fill="#1a1a1a" rx="4" />
      <rect x="105" y="8" width="80" height="20" fill="#111111" rx="4" />

      {/* Main terminal pane */}
      <rect x="10" y="28" width="320" height="60" fill="#1a1a1a" rx="4" />

      {/* Traffic lights */}
      <circle cx="300" cy="18" r="4" fill="#ff5f57" />
      <circle cx="312" cy="18" r="4" fill="#febc2e" />
      <circle cx="324" cy="18" r="4" fill="#28c840" />

      {/* Terminal text / lines */}
      <text x="24" y="52" fontFamily="monospace" fontSize="12" fill="#4CAF50" fontWeight="bold">{`>`}</text>
      <rect x="40" y="46" width="60" height="6" fill="#666666" opacity="0.6" rx="2" />
      <rect x="105" y="44" width="8" height="12" fill={cursorColor} opacity={cursorOpacity} />

      <text x="24" y="70" fontFamily="monospace" fontSize="12" fill="#4CAF50" fontWeight="bold">{`>`}</text>
      <rect x="40" y="64" width="120" height="6" fill="#666666" opacity="0.6" rx="2" />
    </svg>
  )
}
