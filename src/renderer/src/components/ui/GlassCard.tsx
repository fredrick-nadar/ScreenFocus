import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  padding?: string
  hover?: boolean
  onClick?: () => void
  delay?: number
}

export function GlassCard({
  children,
  className = '',
  padding = 'p-4',
  hover = false,
  onClick,
  delay = 0
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' } : undefined}
      onClick={onClick}
      className={`glass ${hover ? 'glass-hover cursor-pointer' : ''} ${padding} ${className}`}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}
