import React from 'react'
import { SceneProps } from './index'

export const DefaultScene: React.FC<SceneProps> = () => {
  return (
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 340 88" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="100%" height="100%" fill="#141418" />

      {/* Fog layers */}
      <ellipse cx="100" cy="80" rx="150" ry="40" fill="#1e1e24" opacity="0.5" />
      <ellipse cx="250" cy="70" rx="180" ry="50" fill="#1e1e24" opacity="0.3" />
      <ellipse cx="40" cy="60" rx="120" ry="30" fill="#1e1e24" opacity="0.6" />
      <ellipse cx="300" cy="85" rx="140" ry="35" fill="#1e1e24" opacity="0.7" />
      <ellipse cx="170" cy="90" rx="200" ry="45" fill="#1e1e24" opacity="0.4" />
    </svg>
  )
}
