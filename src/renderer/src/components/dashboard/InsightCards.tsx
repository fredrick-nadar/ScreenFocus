import { motion } from 'framer-motion'
import { useTrackingStore } from '../../stores/tracking-store'

export function InsightCards() {
  const { insights } = useTrackingStore()

  if (insights.length === 0) return null

  const borderColors = {
    positive: 'rgba(200, 247, 220, 0.15)',
    neutral: 'rgba(191, 215, 255, 0.15)',
    negative: 'rgba(255, 200, 221, 0.15)'
  }

  return (
    <div>
      <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
        Daily Insights
      </h3>
      <div className="space-y-1.5">
        {insights.slice(0, 4).map((insight, i) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            className="glass-subtle rounded-xl px-3 py-2 flex items-start gap-2"
            style={{ borderColor: borderColors[insight.type] }}
          >
            <span className="text-sm mt-0.5 shrink-0">{insight.icon}</span>
            <span className="text-[11px] text-white/60 leading-relaxed">
              {insight.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
