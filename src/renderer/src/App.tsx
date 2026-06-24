import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrackingStore } from './stores/tracking-store'
import { useSettingsStore } from './stores/settings-store'
import { Widget, WidgetData } from './components/Widget'
import { GeneralSettings } from './components/settings/GeneralSettings'
import { getTimeOfDay } from './utils/timeOfDay'
import { AppCategory } from './scenes'
import api from './lib/ipc'

type View = 'widget' | 'settings'

export default function App() {
  const { fetchAll, handleTrackingUpdate, updateCustomIcon, todaySessions, totalActiveSeconds, systemInfo, isPaused, isIdle, currentCategory, customIcons } = useTrackingStore()
  const { fetchSettings, widgetMode, toggleWidgetMode } = useSettingsStore()
  const [currentView, setCurrentView] = useState<View>('widget')
  const [timeOfDay, setTimeOfDay] = useState(() => getTimeOfDay())

  // Initialize data
  useEffect(() => {
    fetchSettings()
    fetchAll()

    // Set up polling for data refresh every 15 seconds
    const refreshInterval = setInterval(() => {
      fetchAll()
    }, 15000)

    // Update time of day every minute
    const timeInterval = setInterval(() => {
      setTimeOfDay(getTimeOfDay())
    }, 60000)

    return () => {
      clearInterval(refreshInterval)
      clearInterval(timeInterval)
    }
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

  // Listen for dynamic app icon extractions from main process
  useEffect(() => {
    if (api().onCustomIconsUpdated) {
      const cleanup = api().onCustomIconsUpdated((icons) => {
        for (const [appName, dataUrl] of Object.entries(icons)) {
          updateCustomIcon(appName, dataUrl)
        }
      })
      return cleanup
    }
    return undefined
  }, [updateCustomIcon])

  // Map Zustand state to WidgetData safely
  const widgetData = useMemo<WidgetData>(() => {
    const totalMinutes = Math.round(totalActiveSeconds / 60)
    
    const apps = todaySessions.map(s => {
      const mins = Math.round(s.total_seconds / 60)
      return {
        exeName: s.app_name,
        displayName: s.app_name, // You can map nice names later if you want
        category: (s.category || 'default') as AppCategory,
        minutes: mins,
        percentage: totalActiveSeconds > 0 ? Math.round((s.total_seconds / totalActiveSeconds) * 100) : 0,
        iconDataUrl: customIcons[s.app_name] ?? null
      }
    })
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 7) // Limit to 7 apps as instructed

    return {
      activeMinutes: totalMinutes,
      systemUptimeMinutes: systemInfo ? Math.round(systemInfo.onTodaySeconds / 60) : 0,
      isTracking: !isPaused,
      isIdle: isIdle,
      currentCategory: currentCategory,
      apps
    }
  }, [todaySessions, totalActiveSeconds, systemInfo, isPaused, isIdle, currentCategory, customIcons])

  return (
    <div className="widget-container">
      {/* Main content wrapper */}
      <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
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
            ) : (
              <motion.div
                key="widget"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <Widget 
                  data={widgetData} 
                  timeOfDay={timeOfDay} 
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  isExpanded={widgetMode === 'expanded'}
                  onToggleExpand={toggleWidgetMode}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
