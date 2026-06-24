import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

interface ProgressRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color: string
  secondaryColor?: string
  label?: string
  sublabel?: string
  showValue?: boolean
  className?: string
  delay?: number
}

export function ProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 10,
  color,
  secondaryColor,
  label,
  sublabel,
  showValue = true,
  className = '',
  delay = 0
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = Math.min(value / max, 1)

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 22,
    mass: 1
  })

  const strokeDashoffset = useTransform(
    springValue,
    [0, 1],
    [circumference, circumference * (1 - percentage)]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      springValue.set(1)
    }, delay * 1000 + 300)
    return () => clearTimeout(timer)
  }, [percentage, delay, springValue])

  // Update when value changes
  useEffect(() => {
    springValue.set(0)
    requestAnimationFrame(() => {
      springValue.set(1)
    })
  }, [value, max, springValue])

  const gradientId = `ring-gradient-${color.replace('#', '')}-${size}`

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="ring-glow" style={{ color }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={secondaryColor || color} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />

        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {/* Center text */}
      {(showValue || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label && (
            <span className="text-[9px] font-medium text-white/35 uppercase tracking-wider">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-base font-semibold text-white/70" style={{ color }}>
              {Math.round(percentage * 100)}%
            </span>
          )}
          {sublabel && (
            <span className="text-[8px] text-white/30 mt-0.5">{sublabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
