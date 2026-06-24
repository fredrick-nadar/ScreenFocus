import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrackingStore } from '../stores/tracking-store'
import { SceneCard } from './SceneCard'
import { AppCategory } from '../scenes'

export function HistoryView() {
  const { weeklyStats, historySessions, fetchSessionsForDate } = useTrackingStore()
  
  // Default to today using local timezone, not UTC
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })

  // Ensure sessions for the selected date are fetched
  useEffect(() => {
    if (!historySessions[selectedDate]) {
      fetchSessionsForDate(selectedDate)
    }
  }, [selectedDate, historySessions, fetchSessionsForDate])

  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    // Prevent going into the future
    const td = new Date()
    const todayStr = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, '0')}-${String(td.getDate()).padStart(2, '0')}`
    const nextStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (nextStr <= todayStr) {
      setSelectedDate(nextStr)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const isToday = useMemo(() => {
    const td = new Date()
    return selectedDate === `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, '0')}-${String(td.getDate()).padStart(2, '0')}`
  }, [selectedDate])

  // Prepare chart data (last 7 days from weeklyStats)
  const chartData = useMemo(() => {
    if (!weeklyStats || weeklyStats.length === 0) return []
    // weeklyStats is sorted old to new usually. We want the last 7 items.
    const last7 = weeklyStats.slice(-7)
    const maxTime = Math.max(...last7.map(s => s.screen_time), 1)
    return last7.map(s => ({
      date: s.date,
      label: new Date(s.date).toLocaleDateString('en-GB', { weekday: 'short' }),
      heightPct: (s.screen_time / maxTime) * 100,
      timeText: `${Math.floor(s.screen_time / 3600)}h ${Math.floor((s.screen_time % 3600) / 60)}m`
    }))
  }, [weeklyStats])

  const sessions = historySessions[selectedDate] || []
  const totalSeconds = sessions.reduce((sum, s) => sum + s.total_seconds, 0)
  const formattedTotal = `${Math.floor(totalSeconds / 3600)} hrs, ${Math.floor((totalSeconds % 3600) / 60)} mins`

  const mappedApps = sessions.slice(0, 7).map((s) => ({
    exeName: s.app_name,
    displayName: s.app_name,
    category: (s.category || 'default') as AppCategory,
    minutes: Math.round(s.total_seconds / 60),
    percentage: totalSeconds > 0 ? Math.round((s.total_seconds / totalSeconds) * 100) : 0,
    iconDataUrl: null
  }))

  return (
    <div className="flex flex-col h-full text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── HEADER ── */}
      <div className="px-4 py-4 shrink-0 flex flex-col items-center">
        <h2 className="text-xl font-light text-white/90 mb-1">App activity details</h2>
        
        {/* Total Time */}
        <div className="text-3xl font-light mt-4">{formattedTotal}</div>
        
        {/* Date Navigator */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <button onClick={handlePrevDay} className="text-white/50 hover:text-white/90 p-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <span className="text-sm font-medium text-white/70 w-28 text-center">{formatDate(selectedDate)}</span>
          <button onClick={handleNextDay} disabled={isToday} className={`p-1 ${isToday ? 'text-white/10' : 'text-white/50 hover:text-white/90'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>

      {/* ── BAR CHART ── */}
      <div className="px-4 shrink-0 h-[100px] flex items-end justify-between gap-1 mb-4 border-b border-white/10 pb-2 relative">
        {/* Horizontal Lines */}
        <div className="absolute left-0 right-0 top-0 border-t border-white/10 z-0"></div>
        <div className="absolute left-0 right-0 top-1/2 border-t border-white/5 z-0"></div>

        {chartData.map((d, i) => {
          const isSelected = d.date === selectedDate
          return (
            <div key={i} className="relative z-10 flex flex-col items-center justify-end w-full h-full group" title={d.timeText}>
              <div 
                className="w-full rounded-t-sm transition-all cursor-pointer"
                style={{ 
                  height: `${Math.max(d.heightPct, 2)}%`, 
                  background: isSelected ? 'var(--accent-color, rgba(255,255,255,0.9))' : 'rgba(255,255,255,0.3)' 
                }}
                onClick={() => setSelectedDate(d.date)}
              />
              <span className="text-[10px] text-white/50 mt-1">{d.label}</span>
            </div>
          )
        })}
      </div>

      {/* ── APP LIST ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 styled-scrollbar">
        {mappedApps.length === 0 ? (
          <div className="text-center text-white/40 mt-8 text-sm">No activity recorded for this day.</div>
        ) : (
          <div className="space-y-3">
            {mappedApps.map((app, index) => (
              <SceneCard
                key={app.exeName}
                appName={app.displayName}
                category={app.category}
                minutes={app.minutes}
                percentage={app.percentage}
                isHero={false}
                index={index}
                timeOfDay="night" // Static or derived from context if you have it
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
