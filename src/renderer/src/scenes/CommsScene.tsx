import React from 'react'
import { SceneProps } from './index'

export const CommsScene: React.FC<SceneProps> = () => {
  return (
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 340 88" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="100%" height="100%" fill="#0e1520" />

      {/* Puddles */}
      <ellipse cx="60" cy="70" rx="40" ry="8" fill="#142233" />
      <ellipse cx="200" cy="80" rx="60" ry="12" fill="#142233" />
      <ellipse cx="300" cy="65" rx="30" ry="6" fill="#142233" />

      {/* Rain lines */}
      <g stroke="#2a4b66" strokeWidth="1" strokeLinecap="round" opacity="0.6">
        <line x1="20" y1="-10" x2="10" y2="40" />
        <line x1="60" y1="10" x2="50" y2="60" />
        <line x1="100" y1="-5" x2="90" y2="45" />
        <line x1="140" y1="20" x2="130" y2="70" />
        <line x1="180" y1="0" x2="170" y2="50" />
        <line x1="220" y1="-15" x2="210" y2="35" />
        <line x1="260" y1="15" x2="250" y2="65" />
        <line x1="300" y1="-5" x2="290" y2="45" />
        <line x1="340" y1="10" x2="330" y2="60" />
        
        {/* Layer 2 (lighter/faster rain) */}
        <line x1="40" y1="20" x2="35" y2="80" opacity="0.3" strokeWidth="0.5" />
        <line x1="120" y1="0" x2="115" y2="60" opacity="0.3" strokeWidth="0.5" />
        <line x1="200" y1="10" x2="195" y2="70" opacity="0.3" strokeWidth="0.5" />
        <line x1="280" y1="-10" x2="275" y2="50" opacity="0.3" strokeWidth="0.5" />
      </g>
    </svg>
  )
}
