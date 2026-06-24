import React from 'react'
import { SceneProps } from './index'

export const OsScene: React.FC<SceneProps> = ({ timeOfDay }) => {
  const isDusk = timeOfDay === 'dusk'
  const isNight = timeOfDay === 'night'

  const litWindowOpacity = isDusk ? 0.9 : 0.6
  const starOpacity = isNight ? 0.4 : 0.2

  return (
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 340 88" xmlns="http://www.w3.org/2000/svg">
      {/* Sky */}
      <rect width="100%" height="100%" fill="#0a0f1a" />

      {/* Stars */}
      <circle cx="30" cy="15" r="1" fill={`rgba(255,255,255,${starOpacity})`} />
      <circle cx="120" cy="10" r="1.5" fill={`rgba(255,255,255,${starOpacity})`} />
      <circle cx="210" cy="25" r="0.8" fill={`rgba(255,255,255,${starOpacity})`} />
      <circle cx="290" cy="12" r="1.2" fill={`rgba(255,255,255,${starOpacity})`} />

      {/* Buildings layer 1 (background) */}
      <rect x="40" y="20" width="30" height="40" fill="#0c1526" />
      <rect x="150" y="15" width="40" height="45" fill="#0c1526" />
      <rect x="260" y="25" width="35" height="35" fill="#0c1526" />

      {/* Buildings layer 2 (foreground) */}
      <rect x="20" y="30" width="40" height="50" fill="#111e33" />
      <rect x="80" y="10" width="45" height="70" fill="#111e33" />
      <rect x="140" y="35" width="50" height="45" fill="#111e33" />
      <rect x="210" y="20" width="40" height="60" fill="#111e33" />
      <rect x="270" y="40" width="50" height="40" fill="#111e33" />

      {/* Windows Building 1 (x:20, y:30) */}
      <rect x="25" y="35" width="6" height="8" fill="#1a2d4a" />
      <rect x="35" y="35" width="6" height="8" fill="#4a6fa5" opacity={litWindowOpacity} />
      <rect x="45" y="35" width="6" height="8" fill="#1a2d4a" />

      {/* Windows Building 2 (x:80, y:10) */}
      <rect x="85" y="20" width="8" height="12" fill="#1a2d4a" />
      <rect x="100" y="20" width="8" height="12" fill="#4a6fa5" opacity={litWindowOpacity} />
      <rect x="100" y="40" width="8" height="12" fill="#4a6fa5" opacity={litWindowOpacity} />

      {/* Windows Building 3 (x:140, y:35) */}
      <rect x="150" y="42" width="10" height="6" fill="#1a2d4a" />
      <rect x="165" y="42" width="10" height="6" fill="#4a6fa5" opacity={litWindowOpacity} />

      {/* Windows Building 4 (x:210, y:20) */}
      <rect x="218" y="30" width="6" height="10" fill="#4a6fa5" opacity={litWindowOpacity} />
      <rect x="230" y="30" width="6" height="10" fill="#1a2d4a" />

      {/* Ground plane */}
      <rect x="0" y="46" width="340" height="42" fill="#0d1526" />
    </svg>
  )
}
