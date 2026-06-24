import { motion } from 'framer-motion'
import { useTrackingStore } from '../../stores/tracking-store'
import { useSettingsStore } from '../../stores/settings-store'
import { formatDuration } from '../../lib/formatters'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { FocusRings } from './FocusRings'
import { CATEGORY_COLORS } from '../../lib/constants'

export function CompactWidget() {
  const { todayStats, totalActiveSeconds, categoryTotals, currentApp, currentCategory, isIdle, isPaused, systemInfo } =
    useTrackingStore()
  const { toggleWidgetMode } = useSettingsStore()

  const productivityScore = todayStats?.productivity_score || 0
  const systemOnToday = systemInfo?.onTodaySeconds || 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full relative overflow-hidden"
    >
      {/* Decorative background glows */}
      <div className="bg-glow" style={{ width: 120, height: 120, background: '#7c3aed', top: -20, right: -20 }} />
      <div className="bg-glow" style={{ width: 100, height: 100, background: '#3b82f6', bottom: 40, left: -30, animationDelay: '2s' }} />

      {/* Header */}
      <div className="drag-handle flex items-center justify-between px-5 pt-4 pb-1 relative z-10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full status-dot"
            style={{
              backgroundColor: isPaused ? '#f59e0b' : isIdle ? '#475569' : '#86efac',
              color: isPaused ? '#f59e0b40' : '#86efac30'
            }}
          />
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em]">
            Focus Today
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* System uptime badge */}
          {systemOnToday > 0 && (
            <span className="text-[8px] text-white/20 font-medium tabular-nums" title="System on-time today">
              ⏻ {formatDuration(systemOnToday)}
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleWidgetMode}
            className="no-drag w-6 h-6 rounded-lg flex items-center justify-center text-white/25 hover:text-white/50 transition-colors text-[10px]"
            title="Expand"
          >
            ⤢
          </motion.button>
        </div>
      </div>

      {/* Large Screen Time Display */}
      <div className="px-5 pt-2 pb-1 relative z-10">
        <div className="text-[40px] font-light tracking-tight leading-none gradient-text">
          <AnimatedNumber
            value={totalActiveSeconds}
            formatFn={(v) => formatDuration(Math.round(v))}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/25 font-medium tracking-wide">
            active screen time
          </span>
          {systemOnToday > 0 && totalActiveSeconds > 0 && (
            <span className="text-[9px] text-white/15 tabular-nums">
              {Math.round((totalActiveSeconds / systemOnToday) * 100)}% of uptime
            </span>
          )}
        </div>
      </div>

      {/* Current App Status — subtle */}
      {(currentApp || isIdle || isPaused) && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-2 mb-1 flex items-center gap-2 relative z-10"
        >
          <div
            className="w-1 h-1 rounded-full"
            style={{
              backgroundColor: isPaused
                ? '#f59e0b'
                : isIdle
                  ? '#475569'
                  : CATEGORY_COLORS[currentCategory || ''] || '#64748b'
            }}
          />
          <span className="text-[10px] text-white/30 truncate">
            {isPaused ? 'Paused' : isIdle ? 'Idle' : currentApp || '—'}
          </span>
        </motion.div>
      )}

      {/* Focus Rings */}
      <div className="px-3 py-3 relative z-10">
        <FocusRings />
      </div>

      {/* Productivity Score — Minimal */}
      <div className="mx-5 mb-3 relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] text-white/25 uppercase tracking-[0.12em] font-medium">
            Productivity
          </span>
          <span className="text-sm font-semibold text-white/70">
            <AnimatedNumber
              value={productivityScore}
              formatFn={(v) => `${Math.round(v)}%`}
            />
          </span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${productivityScore}%` }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background:
                productivityScore >= 80
                  ? 'linear-gradient(90deg, #a78bfa, #86efac)'
                  : productivityScore >= 50
                    ? 'linear-gradient(90deg, #93c5fd, #a78bfa)'
                    : 'linear-gradient(90deg, #f97316, #f59e0b)'
            }}
          />
        </div>
      </div>

      {/* Quick Categories */}
      <div className="px-5 pb-4 flex-1 relative z-10">
        <QuickCategories />
      </div>
    </motion.div>
  )
}

function QuickCategories() {
  const { categoryTotals, totalActiveSeconds } = useTrackingStore()

  const sorted = Object.entries(categoryTotals)
    .filter(([cat]) => cat !== 'Idle' && cat !== 'Uncategorized')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[10px] text-white/15">No activity yet today</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map(([category, seconds], i) => {
        const pct = totalActiveSeconds > 0 ? (seconds / totalActiveSeconds) * 100 : 0
        const color = CATEGORY_COLORS[category] || '#64748b'

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.06 }}
            className="flex items-center gap-2.5"
          >
            <div
              className="w-[3px] h-3.5 rounded-full"
              style={{ backgroundColor: color, opacity: 0.7 }}
            />
            <span className="text-[10px] text-white/40 flex-1 font-medium">{category}</span>
            <span className="text-[10px] font-semibold text-white/60 tabular-nums">
              {formatDuration(seconds)}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
