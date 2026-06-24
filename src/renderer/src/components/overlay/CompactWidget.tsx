import { motion } from 'framer-motion'
import { useTrackingStore } from '../../stores/tracking-store'
import { useSettingsStore } from '../../stores/settings-store'
import { formatDuration } from '../../lib/formatters'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { AppIcon } from '../ui/AppIcon'

export function CompactWidget() {
  const { todaySessions, todayStats, totalActiveSeconds, isIdle, isPaused, systemInfo } =
    useTrackingStore()
  const { toggleWidgetMode } = useSettingsStore()

  const productivityScore = todayStats?.productivity_score || 0
  const systemOnToday = systemInfo?.onTodaySeconds || 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full relative overflow-hidden justify-between"
    >
      {/* Decorative background glows */}
      <div className="bg-glow" style={{ width: 100, height: 100, background: '#7c3aed', top: -30, right: -30 }} />
      <div className="bg-glow" style={{ width: 80, height: 80, background: '#3b82f6', bottom: -20, left: -20, animationDelay: '2s' }} />

      {/* Header */}
      <div className="drag-handle flex items-center justify-between px-5 pt-3.5 pb-1 relative z-10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full status-dot"
            style={{
              backgroundColor: isPaused ? '#f59e0b' : isIdle ? '#475569' : '#86efac',
              boxShadow: isPaused ? '0 0 8px #f59e0b80' : isIdle ? 'none' : '0 0 8px #86efac80'
            }}
          />
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em]">
            ScreenFocus
          </span>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Time Stats Side by Side */}
      <div className="px-5 pt-1 pb-1.5 relative z-10 flex items-center justify-between">
        <div>
          <div className="text-[26px] font-light tracking-tight leading-none text-white/90">
            <AnimatedNumber
              value={totalActiveSeconds}
              formatFn={(v) => formatDuration(Math.round(v))}
            />
          </div>
          <span className="text-[8px] text-white/25 font-bold uppercase tracking-wider">
            Active Screen
          </span>
        </div>
        <div className="text-right">
          <div className="text-[22px] font-light tracking-tight leading-none text-white/50 tabular-nums">
            <AnimatedNumber
              value={systemOnToday}
              formatFn={(v) => formatDuration(Math.round(v))}
            />
          </div>
          <span className="text-[8px] text-white/25 font-bold uppercase tracking-wider">
            System Uptime
          </span>
        </div>
      </div>

      {/* Modern Active vs Uptime progress bar */}
      {systemOnToday > 0 && (
        <div className="px-5 pb-1 relative z-10">
          <div className="progress-bar rounded-full" style={{ height: 6, background: 'rgba(255, 255, 255, 0.06)' }}>
            <motion.div
              className="progress-bar-fill rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalActiveSeconds / systemOnToday) * 100, 100)}%` }}
              transition={{ duration: 1 }}
              style={{ background: 'linear-gradient(90deg, #3b82f6, #7c3aed)', borderRadius: 999 }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[8px] text-white/15">
            <span>{Math.round((totalActiveSeconds / systemOnToday) * 100)}% Active</span>
            <span>Idle: {formatDuration(Math.max(0, systemOnToday - totalActiveSeconds))}</span>
          </div>
        </div>
      )}

      {/* Top Apps Used - Logos Only */}
      <div className="px-5 pb-3 relative z-10">
        <h3 className="text-[8px] font-bold text-white/20 uppercase tracking-[0.15em] mb-2">
          Top Apps Used
        </h3>
        <div className="flex items-center gap-3.5 overflow-x-auto scrollbar-none py-0.5">
          {todaySessions.length === 0 ? (
            <span className="text-[10px] text-white/15 h-10 flex items-center">No active apps today</span>
          ) : (
            todaySessions.slice(0, 5).map((session, i) => (
              <motion.div
                key={session.app_name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-1.5 shrink-0 group relative cursor-help"
                title={`${session.app_name} (${formatDuration(session.total_seconds)})`}
              >
                <AppIcon appName={session.app_name} className="w-10 h-10" />
                <span className="text-[9px] font-semibold text-white/40 tabular-nums">
                  {formatDuration(session.total_seconds)}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}
