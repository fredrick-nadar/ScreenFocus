import { motion } from 'framer-motion'
import { useTrackingStore } from '../../stores/tracking-store'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { CATEGORY_COLORS } from '../../lib/constants'

export function ProductivityScore() {
  const { todayStats, categoryTotals, totalActiveSeconds } = useTrackingStore()
  const score = todayStats?.productivity_score || 0

  const codingPct = totalActiveSeconds > 0 ? ((categoryTotals['Coding'] || 0) / totalActiveSeconds) * 100 : 0
  const learningPct = totalActiveSeconds > 0 ? ((categoryTotals['Learning'] || 0) / totalActiveSeconds) * 100 : 0
  const commPct = totalActiveSeconds > 0 ? ((categoryTotals['Communication'] || 0) / totalActiveSeconds) * 100 : 0
  const entPct = totalActiveSeconds > 0 ? ((categoryTotals['Entertainment'] || 0) / totalActiveSeconds) * 100 : 0
  const gamingPct = totalActiveSeconds > 0 ? ((categoryTotals['Gaming'] || 0) / totalActiveSeconds) * 100 : 0

  const segments = [
    { label: 'Coding', pct: codingPct, color: '#a78bfa' },
    { label: 'Learning', pct: learningPct, color: '#6ee7b7' },
    { label: 'Comms', pct: commPct, color: '#60a5fa' },
    { label: 'Fun', pct: entPct, color: '#fbbf24' },
    { label: 'Gaming', pct: gamingPct, color: '#f472b6' }
  ].filter((s) => s.pct > 0)

  return (
    <div className="glass-subtle rounded-2xl p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[9px] font-semibold text-white/25 uppercase tracking-[0.12em]">
          Productivity
        </span>
        <div className="flex items-baseline gap-0.5">
          <AnimatedNumber
            value={score}
            className="text-lg font-semibold text-white/80"
            formatFn={(v) => `${Math.round(v)}`}
          />
          <span className="text-[10px] text-white/25">%</span>
        </div>
      </div>

      {/* Segmented bar */}
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/[0.03] gap-[1px]">
        {segments.map((seg, i) => (
          <motion.div
            key={seg.label}
            initial={{ width: 0 }}
            animate={{ width: `${seg.pct}%` }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.05, ease: [0.4, 0, 0.2, 1] }}
            className="h-full rounded-full"
            style={{ backgroundColor: seg.color, opacity: 0.65 }}
            title={`${seg.label}: ${Math.round(seg.pct)}%`}
          />
        ))}
      </div>

      {/* Legend */}
      {segments.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1">
              <div
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: seg.color, opacity: 0.7 }}
              />
              <span className="text-[8px] text-white/30">{seg.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
