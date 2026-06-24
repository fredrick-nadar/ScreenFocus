import React from 'react'
import { SceneProps } from './index'

export const DesignScene: React.FC<SceneProps> = () => {
  return (
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 340 88" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="100%" height="100%" fill="#f5f0e8" />

      {/* Grid */}
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Abstract Shapes */}
      <circle cx="100" cy="44" r="30" fill="#e2c8dc" opacity="0.8" />
      <rect x="180" y="20" width="80" height="50" fill="#d4cce6" opacity="0.9" rx="12" />
      <polygon points="280,20 320,44 280,68" fill="#e8c8c8" opacity="0.8" />

      {/* Selection Handles (around the rect) */}
      <rect x="176" y="16" width="88" height="58" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 2" />
      <rect x="174" y="14" width="4" height="4" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1" />
      <rect x="262" y="14" width="4" height="4" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1" />
      <rect x="174" y="72" width="4" height="4" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1" />
      <rect x="262" y="72" width="4" height="4" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1" />
    </svg>
  )
}
