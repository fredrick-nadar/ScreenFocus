import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTrackingStore } from './stores/tracking-store'
import { useSettingsStore } from './stores/settings-store'
import { Widget, WidgetData } from './components/Widget'
import { getTimeOfDay } from './utils/timeOfDay'
import { AppCategory } from './scenes'
import api from './lib/ipc'

export default function App() {
  const { fetchAll, handleTrackingUpdate, updateCustomIcon, todaySessions, totalActiveSeconds, systemInfo, isPaused, isIdle, currentCategory, customIcons } = useTrackingStore()
  const { fetchSettings, widgetMode, toggleWidgetMode } = useSettingsStore()
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

  const { settings } = useSettingsStore()
  useEffect(() => {
    if (settings && settings['accent_color']) {
      document.documentElement.style.setProperty('--accent-color', settings['accent_color'])
    }
  }, [settings])

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
    .slice(0, 3) // Only show the top 3 apps used

    return {
      activeMinutes: totalMinutes,
      systemUptimeMinutes: systemInfo ? Math.round(systemInfo.onTodaySeconds / 60) : 0,
      isTracking: !isPaused,
      isIdle: isIdle,
      currentCategory: currentCategory,
      apps
    }
  }, [todaySessions, totalActiveSeconds, systemInfo, isPaused, isIdle, currentCategory, customIcons])

  const { backgroundImage } = useTrackingStore()

  return (
    <div 
      className="widget-container h-full w-full relative"
      style={
        backgroundImage
          ? {
              backgroundImage: backgroundImage.startsWith('data:') || backgroundImage.startsWith('file:') ? `url("${backgroundImage}")` : `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      {/* Contrast scenery overlay to ensure readability */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-0" />
      )}

      {/* Main content wrapper */}
      <div className="flex-1 overflow-hidden relative z-10 flex flex-col h-full">
        <div className="flex-1 overflow-hidden h-full">
          <motion.div
            key="widget"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full"
          >
            <Widget 
              data={widgetData} 
              timeOfDay={timeOfDay} 
              isExpanded={widgetMode === 'expanded'}
              onToggleExpand={toggleWidgetMode}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
