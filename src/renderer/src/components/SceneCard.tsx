import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AppCategory, SCENE_MAP, TimeOfDay } from '../scenes'

interface SceneCardProps {
  appName: string
  category: AppCategory
  minutes: number
  percentage: number
  isHero: boolean
  index: number
  timeOfDay: TimeOfDay
}

const DOMINO_COLORS: Record<AppCategory, string> = {
  editor: '#388bfd',
  browser: '#ffaa00',
  ai: '#1d9e75',
  os: '#4a6fa5',
  terminal: '#4CAF50',
  design: '#8b5cf6',
  comms: '#2a4b66',
  default: '#666666'
}

export const SceneCard: React.FC<SceneCardProps> = ({
  appName,
  category,
  minutes,
  percentage,
  isHero,
  index,
  timeOfDay
}) => {
  const SceneSvg = SCENE_MAP[category] || SCENE_MAP['default']
  const accentColor = DOMINO_COLORS[category] || DOMINO_COLORS['default']
  const shouldReduceMotion = useReducedMotion()
  const isLightScene = category === 'design'

  const litCount = Math.round(percentage / 20)
  const dominoes = Array.from({ length: 5 })

  // Layout values
  const height = isHero ? 120 : 112
  const textColor = isLightScene ? '#1a1a1a' : '#888'
  const timeColor = accentColor
  const secondaryColor = isLightScene ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.3,
        delay: shouldReduceMotion ? 0 : index * 0.04
      }
    }
  }

  const dominoVariants = {
    hidden: { height: 0 },
    visible: (custom: number) => {
      const isLit = custom < litCount
      const baseHeight = isLit ? (custom + 1) * 4 + 6 : 4
      const finalHeight = isHero ? baseHeight * 1.5 : baseHeight

      return {
        height: finalHeight,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 24,
          delay: shouldReduceMotion ? 0 : (index * 0.04) + (custom * 0.05)
        }
      }
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-xl"
      style={{ height, background: isLightScene ? '#f5f0e8' : '#141418' }}
    >
      {/* Layer 1: Scene SVG */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <SceneSvg timeOfDay={timeOfDay} width="100%" height="100%" />
      </div>

      {/* Layer 2: Text Overlay */}
      <div className="absolute top-0 left-0 z-10" style={{ padding: '11px 13px' }}>
        <div style={{ fontSize: '12px', fontWeight: 500, color: textColor, opacity: 0.95 }}>
          {appName}
        </div>
        <div className="flex items-baseline gap-1" style={{ marginTop: '2px' }}>
          <span style={{ fontSize: isHero ? '26px' : '22px', fontWeight: 300, color: timeColor }}>
            {minutes}
          </span>
          <span style={{ fontSize: '11px', color: timeColor, opacity: 0.6 }}>
            m
          </span>
        </div>
        <div style={{ fontSize: '10px', fontWeight: 400, color: secondaryColor }}>
          {percentage}%
        </div>
      </div>

      {/* Layer 3: Dominoes */}
      <div className="absolute bottom-0 right-0 z-10 flex items-end gap-[3px]" style={{ padding: '11px 13px' }}>
        {dominoes.map((_, i) => {
          const isLit = i < litCount
          return (
            <motion.div
              key={i}
              custom={i}
              variants={dominoVariants}
              initial="hidden"
              animate="visible"
              style={{
                width: '6px',
                borderRadius: '2px',
                backgroundColor: isLit ? accentColor : 'rgba(255,255,255,0.12)',
              }}
            />
          )
        })}
      </div>
    </motion.div>
  )
}
