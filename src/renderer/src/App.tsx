import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrackingStore } from './stores/tracking-store'
import { useSettingsStore } from './stores/settings-store'
import { CompactWidget } from './components/overlay/CompactWidget'
import { ExpandedWidget } from './components/overlay/ExpandedWidget'
import { GeneralSettings } from './components/settings/GeneralSettings'
import api from './lib/ipc'

type View = 'widget' | 'settings'

export default function App() {
  const { fetchAll, handleTrackingUpdate } = useTrackingStore()
  const { widgetMode, fetchSettings } = useSettingsStore()
  const [currentView, setCurrentView] = useState<View>('widget')

  // Initialize data
  useEffect(() => {
    fetchSettings()
    fetchAll()

    // Set up polling for data refresh every 15 seconds
    const refreshInterval = setInterval(() => {
      fetchAll()
    }, 15000)

    return () => clearInterval(refreshInterval)
  }, [fetchAll, fetchSettings])

  // Listen for tracking updates from main process
  useEffect(() => {
    const cleanup = api().onTrackingUpdate((data) => {
      handleTrackingUpdate(data)
    })
    return cleanup
  }, [handleTrackingUpdate])

  // Listen for tracking status changes
  useEffect(() => {
    const cleanup = api().onTrackingStatusChanged((data) => {
      handleTrackingUpdate({
        currentApp: null,
        currentCategory: null,
        isIdle: false,
        isPaused: data.isPaused,
        sessionStart: null
      })
    })
    return cleanup
  }, [handleTrackingUpdate])

  return (
    <div className="h-full w-full glass rounded-3xl overflow-hidden flex flex-col">
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="h-full overflow-y-auto px-4 py-3"
            >
              <GeneralSettings />
            </motion.div>
          ) : widgetMode === 'compact' ? (
            <motion.div
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <CompactWidget />
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ExpandedWidget />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation bar — Ultra minimal */}
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
    </div>
  )
}

function BottomNav({
  currentView,
  onViewChange
}: {
  currentView: View
  onViewChange: (view: View) => void
}) {
  const { isPaused, toggleTracking } = useTrackingStore()

  const navItems: { id: View; icon: string; label: string }[] = [
    { id: 'widget', icon: '◉', label: 'Focus' },
    { id: 'settings', icon: '⚙', label: 'Settings' }
  ]

  return (
    <div className="no-drag flex items-center justify-between px-4 py-2.5 border-t border-white/[0.03]">
      <div className="flex gap-1">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onViewChange(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-medium transition-all duration-200 ${
              currentView === item.id
                ? 'bg-white/[0.06] text-white/60'
                : 'text-white/20 hover:text-white/35 hover:bg-white/[0.02]'
            }`}
          >
            <span className="text-[10px]">{item.icon}</span>
            {item.label}
          </motion.button>
        ))}
      </div>

      {/* Pause/Resume button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTracking}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-medium transition-all duration-200 ${
          isPaused
            ? 'bg-amber-500/8 text-amber-400/60 hover:bg-amber-500/12'
            : 'text-white/18 hover:text-white/30 hover:bg-white/[0.02]'
        }`}
        title={isPaused ? 'Resume' : 'Pause'}
      >
        <span className="text-[10px]">{isPaused ? '▶' : '⏸'}</span>
      </motion.button>
    </div>
  )
}
