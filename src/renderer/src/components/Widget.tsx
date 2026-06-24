import React, { useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { SceneCard } from './SceneCard'
import { AppCategory, TimeOfDay } from '../scenes'
import { formatDuration } from '../lib/formatters'
import { useTrackingStore } from '../stores/tracking-store'
import { HistoryView } from './HistoryView'

export interface WidgetApp {
  exeName: string
  displayName: string
  category: AppCategory
  minutes: number
  percentage: number
  iconDataUrl: string | null
}

export interface WidgetData {
  activeMinutes: number
  systemUptimeMinutes: number
  isTracking: boolean
  isIdle: boolean
  currentCategory: string | null
  apps: WidgetApp[]
}

interface WidgetProps {
  data: WidgetData
  timeOfDay: TimeOfDay
  isExpanded: boolean
  onToggleExpand: () => void
}

export const Widget: React.FC<WidgetProps> = ({ data, timeOfDay, isExpanded, onToggleExpand }) => {
  const shouldReduceMotion = useReducedMotion()
  const [currentView, setCurrentView] = useState<'focus' | 'history'>('focus')
  
  // Format times nicely (e.g. 32m, 1h 4m)
  const formatMins = (mins: number) => {
    if (mins < 60) return `${mins}m`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  const { activeMinutes, systemUptimeMinutes, isTracking, currentCategory, apps } = data

  const heroApp = apps[0]
  const gridApps = apps.slice(1, 7)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
      className="flex flex-col h-full relative"
    >
      {/* ── HEADER ── */}
      <div className="drag-handle flex justify-between shrink-0" style={{ padding: '14px 16px 10px' }} onDoubleClick={onToggleExpand}>
        <div className="flex flex-col">
          <span style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Today's focus
          </span>
          <div style={{ fontSize: '30px', fontWeight: 300, color: 'var(--accent-color, #fff)', lineHeight: 1.1, marginTop: '2px', marginBottom: '6px' }}>
            {formatMins(activeMinutes)}
          </div>
          
          <div className="flex gap-2">
            {/* Tracking Pill */}
            <div className="flex items-center gap-1.5 rounded-full" style={{ padding: '2px 8px', background: isTracking ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.1)', border: `0.5px solid ${isTracking ? 'rgba(93,202,165,0.3)' : 'rgba(255,255,255,0.2)'}` }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: isTracking ? '#5DCAA5' : '#888' }} />
              <span style={{ fontSize: '9px', fontWeight: 500, color: isTracking ? '#5DCAA5' : '#aaa' }}>
                {isTracking ? 'Tracking' : 'Paused'}
              </span>
            </div>

            {/* Category Pill */}
            {currentCategory && currentCategory !== 'default' && currentCategory !== 'Uncategorized' && (
              <div className="flex items-center rounded-full" style={{ padding: '2px 8px', background: 'rgba(127,119,221,0.15)', border: '0.5px solid rgba(175,169,236,0.2)' }}>
                <span style={{ fontSize: '9px', fontWeight: 500, color: '#AFA9EC', textTransform: 'capitalize' }}>
                  {currentCategory}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col text-right items-end">
          <button onClick={onToggleExpand} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isExpanded ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
            </svg>
          </button>
          <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
            System on
          </span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent-color, rgba(255,255,255,0.45))', marginTop: '2px' }}>
            {formatMins(systemUptimeMinutes)}
          </span>
        </div>
      </div>

      {/* ── MAIN CONTENT (CARD STACK OR HISTORY) ── */}
      {isExpanded && (
        <div className="flex-1 overflow-hidden flex flex-col h-full relative z-10">
          <AnimatePresence mode="wait">
            {currentView === 'focus' ? (
              <motion.div 
                key="focus"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-y-auto scrollbar-none px-[16px] pb-[10px] flex flex-col gap-2 h-full"
              >
                {heroApp && (
                  <SceneCard
                    appName={heroApp.displayName}
                    category={heroApp.category}
                    minutes={heroApp.minutes}
                    percentage={heroApp.percentage}
                    isHero={true}
                    index={0}
                    timeOfDay={timeOfDay}
                  />
                )}
                
                {gridApps.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '8px' }}>
                    {gridApps.map((app, idx) => (
                      <SceneCard
                        key={app.exeName}
                        appName={app.displayName}
                        category={app.category}
                        minutes={app.minutes}
                        percentage={app.percentage}
                        isHero={false}
                        index={idx + 1}
                        timeOfDay={timeOfDay}
                      />
                    ))}
                  </div>
                )}

                {apps.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-metadata">
                    No active apps tracked yet
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto"
              >
                <HistoryView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div className="no-drag shrink-0 flex items-center justify-between" style={{ padding: '9px 14px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#5DCAA5' }} />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>
              Idle detection on
            </span>
          </div>

          <button 
            onClick={() => setCurrentView(currentView === 'focus' ? 'history' : 'focus')}
            title="Toggle History"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', opacity: currentView === 'history' ? 1 : 0.5, transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => { if (currentView !== 'history') e.currentTarget.style.opacity = '0.5' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
              <path d="M3 3v18h18" />
              <path d="M18 17V9" />
              <path d="M13 17V5" />
              <path d="M8 17v-3" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Accent Color Picker */}
          <div title="Set Accent Color" style={{ position: 'relative', width: '20px', height: '20px', opacity: 0.5, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}>
             <input 
              type="color" 
              defaultValue="#ffffff"
              onChange={(e) => {
                document.documentElement.style.setProperty('--accent-color', e.target.value)
                window.electronAPI.setSetting('accent_color', e.target.value)
              }}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
            />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff', position: 'absolute', top: '4px', left: '4px', pointerEvents: 'none' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>

          <button 
            onClick={useTrackingStore.getState().selectAndSetBackgroundImage}
            title="Set Background Image"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', opacity: 0.5, transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
