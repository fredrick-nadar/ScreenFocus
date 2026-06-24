import { motion } from 'framer-motion'
import { useTrackingStore } from '../../stores/tracking-store'
import { DASHBOARD_COLORS } from '../../lib/constants'

export function StreakCards() {
  const { streaks } = useTrackingStore()

  const activeStreaks = streaks.filter((s) => s.streak_days > 0)

  if (activeStreaks.length === 0) return null

  const streakEmojis: Record<string, string> = {
    Coding: '💻',
    Learning: '📚',
    Gaming: '🎮'
  }

  return (
    <div>
      <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
        Streaks
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {activeStreaks.map((streak, i) => {
          const color = DASHBOARD_COLORS[streak.category] || '#94a3b8'
          return (
            <motion.div
              key={streak.category}
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-subtle rounded-xl px-3 py-2.5 min-w-[90px] flex flex-col items-center gap-1"
              style={{ borderColor: `${color}20` }}
            >
              <span className="text-lg">
                {streakEmojis[streak.category] || '📊'}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-base">🔥</span>
                <span
                  className="text-lg font-bold"
                  style={{ color }}
                >
                  {streak.streak_days}
                </span>
              </div>
              <span className="text-[9px] text-white/40 font-medium">
                {streak.category}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
