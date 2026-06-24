import { motion } from 'framer-motion'
import { useTrackingStore } from '../../stores/tracking-store'
import { useSettingsStore } from '../../stores/settings-store'
import { formatDuration } from '../../lib/formatters'
import { CATEGORY_COLORS } from '../../lib/constants'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { ProductivityScore } from '../dashboard/ProductivityScore'
import { AppIcon } from '../ui/AppIcon'

export function ExpandedWidget() {
  const { todaySessions, todayStats, totalActiveSeconds, currentApp, isIdle, isPaused, systemInfo } =
    useTrackingStore()
  const { toggleWidgetMode } = useSettingsStore()

  const systemOnToday = systemInfo?.onTodaySeconds || 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full relative overflow-hidden"
    >
      {/* Decorative background glows */}
      <div className="bg-glow" style={{ width: 140, height: 140, background: '#7c3aed', top: -30, right: -30 }} />
      <div className="bg-glow" style={{ width: 110, height: 110, background: '#3b82f6', bottom: 60, left: -40, animationDelay: '3s' }} />
      <div className="bg-glow" style={{ width: 80, height: 80, background: '#10b981', bottom: -20, right: 40, animationDelay: '1.5s' }} />

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
            Today's Overview
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.06)' }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleWidgetMode}
          className="no-drag w-6 h-6 rounded-lg flex items-center justify-center text-white/25 hover:text-white/50 transition-colors text-[10px]"
          title="Collapse"
        >
          ⤡
        </motion.button>
      </div>

      {/* Status + Screen Time */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-5 mt-2 mb-3 relative z-10"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[32px] font-light tracking-tight leading-none gradient-text">
              <AnimatedNumber
                value={totalActiveSeconds}
                formatFn={(v) => formatDuration(Math.round(v))}
              />
            </div>
            <span className="text-[9px] text-white/25 font-medium">
              {isPaused ? 'Paused' : isIdle ? 'Idle' : currentApp ? `Using ${currentApp}` : 'Tracking...'}
            </span>
          </div>
          {/* System uptime mini card */}
          {systemOnToday > 0 && (
            <div className="text-right">
              <div className="text-[9px] text-white/20 uppercase tracking-wider font-medium">System On</div>
              <div className="text-sm font-semibold text-white/40 tabular-nums">
                {formatDuration(systemOnToday)}
              </div>
              {totalActiveSeconds > 0 && (
                <div className="text-[8px] text-white/15 tabular-nums">
                  {Math.round((totalActiveSeconds / systemOnToday) * 100)}% active
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4 relative z-10 scrollbar-none">
        {/* Productivity */}
        <ProductivityScore />

        {/* App Usage List */}
        <div>
          <h3 className="text-[9px] font-semibold text-white/25 uppercase tracking-[0.12em] mb-2.5">
            App Usage
          </h3>
          <div className="space-y-1">
            {todaySessions.length === 0 ? (
              <div className="text-center py-4">
                <span className="text-[10px] text-white/15">No app usage yet</span>
              </div>
            ) : (
              todaySessions.slice(0, 10).map((session, i) => (
                <AppUsageRow
                  key={session.app_name}
                  appName={session.app_name}
                  category={session.category}
                  seconds={session.total_seconds}
                  totalSeconds={totalActiveSeconds}
                  index={i}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AppUsageRow({
  appName,
  category,
  seconds,
  totalSeconds,
  index
}: {
  appName: string
  category: string
  seconds: number
  totalSeconds: number
  index: number
}) {
  const percentage = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0
  const color = CATEGORY_COLORS[category] || '#64748b'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.03 }}
      className="flex items-center gap-3 py-1 px-2 rounded-xl hover:bg-white/[0.02] transition-colors group cursor-help"
      title={`${appName} (${formatDuration(seconds)})`}
    >
      <AppIcon appName={appName} className="w-8 h-8" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-white/70 tabular-nums">
            {formatDuration(seconds)}
          </span>
          <span className="text-[9px] text-white/20 uppercase tracking-wider font-semibold">
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="progress-bar rounded-full" style={{ height: 6, background: 'rgba(255, 255, 255, 0.06)' }}>
          <motion.div
            className="progress-bar-fill rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.03 }}
            style={{ backgroundColor: color, opacity: 0.8, borderRadius: 999 }}
          />
        </div>
      </div>
    </motion.div>
  )
}
