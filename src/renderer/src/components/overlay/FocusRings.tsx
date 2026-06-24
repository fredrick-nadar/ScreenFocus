import { motion } from 'framer-motion'
import { useTrackingStore } from '../../stores/tracking-store'
import { formatDuration } from '../../lib/formatters'
import { COLORS } from '../../lib/constants'
import { ProgressRing } from '../ui/ProgressRing'

export function FocusRings() {
  const { goals, todayStats, categoryTotals } = useTrackingStore()

  const codingSeconds = categoryTotals['Coding'] || 0
  const learningSeconds = categoryTotals['Learning'] || 0
  const screenTimeSeconds = todayStats?.screen_time || 0

  const codingGoal = goals.find((g) => g.category === 'Coding')
  const learningGoal = goals.find((g) => g.category === 'Learning')
  const screenGoal = goals.find((g) => g.category === 'Screen Time')

  const codingTarget = (codingGoal?.target_minutes || 360) * 60
  const learningTarget = (learningGoal?.target_minutes || 120) * 60
  const screenTarget = (screenGoal?.target_minutes || 480) * 60

  const rings = [
    {
      label: 'Coding',
      value: codingSeconds,
      max: codingTarget,
      color: '#a78bfa',
      secondaryColor: '#c4b5fd',
      icon: '💻'
    },
    {
      label: 'Learning',
      value: learningSeconds,
      max: learningTarget,
      color: '#6ee7b7',
      secondaryColor: '#86efac',
      icon: '📚'
    },
    {
      label: 'Screen',
      value: screenTimeSeconds,
      max: screenTarget,
      color: '#60a5fa',
      secondaryColor: '#93c5fd',
      icon: '🖥️'
    }
  ]

  return (
    <div className="flex items-center justify-center gap-1">
      {rings.map((ring, i) => (
        <motion.div
          key={ring.label}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <ProgressRing
              value={ring.value}
              max={ring.max}
              size={72}
              strokeWidth={5}
              color={ring.color}
              secondaryColor={ring.secondaryColor}
              showValue={false}
              delay={i * 0.12}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base">{ring.icon}</span>
            </div>
          </div>
          <span className="text-[9px] font-medium text-white/35 mt-1">{ring.label}</span>
          <span className="text-[10px] font-semibold text-white/65 tabular-nums">
            {formatDuration(ring.value)}
          </span>
          <span className="text-[8px] text-white/20 tabular-nums">
            / {formatDuration(ring.max)}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
