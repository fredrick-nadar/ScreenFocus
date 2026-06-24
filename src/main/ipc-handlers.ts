import { ipcMain } from 'electron'
import { getTodaySessions, getHourlyBreakdown, getTodayCategoryTotals, getTodayTotalActiveSeconds } from './database/sessions'
import { getTodayStats, getWeeklyStats, getStreaks } from './database/daily-stats'
import { getGoalProgress, upsertGoal, deleteGoal } from './database/goals'
import { setCategoryOverride, getCategoryOverrides, getAllCategories } from './tracking/categorizer'
import { generateDailyInsights } from './utils/insights'
import { getDb } from './database/db'
import { TrackingService } from './tracking/tracker'
import { app, powerMonitor } from 'electron'
import * as os from 'os'

export function registerIpcHandlers(trackingService: TrackingService): void {
  // ── Tracking Data ──────────────────────────────────────────────
  ipcMain.handle('get-today-sessions', () => {
    return getTodaySessions()
  })

  ipcMain.handle('get-today-stats', () => {
    return getTodayStats()
  })

  ipcMain.handle('get-today-category-totals', () => {
    return getTodayCategoryTotals()
  })

  ipcMain.handle('get-today-total-active', () => {
    return getTodayTotalActiveSeconds()
  })

  ipcMain.handle('get-hourly-breakdown', (_event, date?: string) => {
    return getHourlyBreakdown(date)
  })

  ipcMain.handle('get-weekly-stats', () => {
    return getWeeklyStats()
  })

  // ── Insights & Streaks ─────────────────────────────────────────
  ipcMain.handle('get-insights', () => {
    return generateDailyInsights()
  })

  ipcMain.handle('get-streaks', () => {
    return getStreaks()
  })

  // ── Goals ──────────────────────────────────────────────────────
  ipcMain.handle('get-goals', () => {
    return getGoalProgress()
  })

  ipcMain.handle('upsert-goal', (_event, goal) => {
    return upsertGoal(goal)
  })

  ipcMain.handle('delete-goal', (_event, id: number) => {
    deleteGoal(id)
    return true
  })

  // ── Categories ─────────────────────────────────────────────────
  ipcMain.handle('get-categories', () => {
    return getAllCategories()
  })

  ipcMain.handle('get-category-overrides', () => {
    return getCategoryOverrides()
  })

  ipcMain.handle('set-category-override', (_event, appName: string, category: string) => {
    setCategoryOverride(appName, category)
    return true
  })

  // ── Settings ───────────────────────────────────────────────────
  ipcMain.handle('get-settings', () => {
    const db = getDb()
    const rows = db.prepare('SELECT key, value FROM settings').all() as {
      key: string
      value: string
    }[]
    const result: Record<string, string> = {}
    for (const row of rows) {
      result[row.key] = row.value
    }
    return result
  })

  ipcMain.handle('set-setting', (_event, key: string, value: string) => {
    const db = getDb()
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)

    // Handle side effects
    if (key === 'start_with_windows') {
      app.setLoginItemSettings({
        openAtLogin: value === 'true'
      })
    }

    return true
  })

  // ── Tracking Control ───────────────────────────────────────────
  ipcMain.handle('toggle-tracking', () => {
    if (trackingService.paused) {
      trackingService.resume()
    } else {
      trackingService.pause()
    }
    return trackingService.paused
  })

  ipcMain.handle('get-tracking-status', () => {
    return {
      isPaused: trackingService.paused
    }
  })

  // ── System Info (uptime, power stats) ─────────────────────────
  ipcMain.handle('get-system-info', () => {
    const uptimeSeconds = os.uptime()
    const idleSeconds = powerMonitor.getSystemIdleTime()

    // Calculate "on since" time
    const bootTime = Date.now() - uptimeSeconds * 1000
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Time the system has been on since midnight today
    const onSinceMidnight = Math.max(0, Math.floor((Date.now() - Math.max(bootTime, todayStart.getTime())) / 1000))

    return {
      uptimeSeconds,           // Total system uptime since boot
      idleSeconds,             // Current idle time
      onTodaySeconds: onSinceMidnight, // System on-time today
      bootTimestamp: bootTime  // When the system was booted
    }
  })
}
