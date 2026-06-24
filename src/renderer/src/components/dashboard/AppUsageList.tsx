import { motion } from 'framer-motion'
import { useTrackingStore } from '../../stores/tracking-store'
import { formatDuration } from '../../lib/formatters'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../lib/constants'
import { CategoryBadge } from '../ui/CategoryBadge'

export function AppUsageList() {
  const { todaySessions, totalActiveSeconds, customIcons } = useTrackingStore()

  if (todaySessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <span className="text-2xl mb-2">🖥️</span>
        <span className="text-xs text-white/20">No activity tracked yet</span>
        <span className="text-[10px] text-white/10 mt-1">Start using your apps to see data</span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {todaySessions.map((session, i) => {
        const pct = totalActiveSeconds > 0 ? (session.total_seconds / totalActiveSeconds) * 100 : 0
        const color = CATEGORY_COLORS[session.category] || '#94a3b8'
        const icon = CATEGORY_ICONS[session.category] || '📁'

        return (
          <motion.div
            key={session.app_name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 + i * 0.03 }}
            className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl hover:bg-white/[0.03] transition-colors group"
          >
            {/* App icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 overflow-hidden"
              style={{ backgroundColor: `${color}15` }}
            >
              {customIcons?.[session.app_name] ? (
                <img
                  src={customIcons[session.app_name]}
                  alt={session.app_name}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                icon
              )}
            </div>

            {/* App info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-medium text-white/85 truncate">
                  {session.app_name}
                </span>
                <span className="text-[12px] font-semibold ml-2 shrink-0" style={{ color }}>
                  {formatDuration(session.total_seconds)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="progress-bar">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.03 }}
                  style={{ backgroundColor: color, opacity: 0.7 }}
                />
              </div>

              {/* Category badge - visible on hover */}
              <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <CategoryBadge category={session.category} size="sm" />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
