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

  // ── Custom App Icons ──────────────────────────────────────────
  ipcMain.handle('get-custom-icons', async () => {
    const { join } = require('path')
    const { promises: fs } = require('fs')
    const ICON_CACHE_PATH = join(app.getPath('userData'), 'icon-cache')
    
    const result: Record<string, string> = {}
    try {
      const files = await fs.readdir(ICON_CACHE_PATH)
      for (const file of files) {
        if (file.endsWith('.png')) {
          const appName = file.replace('.png', '')
          result[appName] = `file:///${join(ICON_CACHE_PATH, file).replace(/\\/g, '/')}`
        }
      }
    } catch (err) {
      // Directory might not exist yet
    }
    return result
  })

  // ── Scenery Background Image ──────────────────────────────────
  ipcMain.handle('get-background-image', () => {
    const fs = require('fs')
    const { join } = require('path')
    const db = getDb()

    try {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('custom_background') as { value: string } | undefined
      if (row && row.value && fs.existsSync(row.value)) {
        return `file:///${row.value.replace(/\\/g, '/')}`
      }
    } catch (err) {
      console.error('[ipc-handlers] Failed to read custom background from db:', err)
    }

    let imagePath = join(app.getAppPath(), 'src/main/utils/draw1.webp')
    if (!fs.existsSync(imagePath)) {
      imagePath = join(__dirname, '../../src/main/utils/draw1.webp')
    }
    if (!fs.existsSync(imagePath)) {
      imagePath = join(__dirname, 'utils/draw1.webp')
    }
    if (!fs.existsSync(imagePath)) {
      imagePath = join(__dirname, '../src/main/utils/draw1.webp')
    }
    if (!fs.existsSync(imagePath)) {
      imagePath = join(__dirname, 'draw1.webp')
    }

    if (!fs.existsSync(imagePath)) {
      console.warn('[ipc-handlers] draw1.webp not found at path: ', imagePath)
      return null
    }

    try {
      const buffer = fs.readFileSync(imagePath)
      return `data:image/webp;base64,${buffer.toString('base64')}`
    } catch (err) {
      console.error('[ipc-handlers] Failed to read background scenery:', err)
      return null
    }
  })

  ipcMain.handle('select-and-set-background-image', async () => {
    const { dialog } = require('electron')
    const fs = require('fs')
    const { join } = require('path')

    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: `Select Background Image`,
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
      properties: ['openFile']
    })

    if (canceled || filePaths.length === 0) {
      return null
    }

    try {
      const sourcePath = filePaths[0]
      const bgDir = join(app.getPath('userData'), 'backgrounds')
      if (!fs.existsSync(bgDir)) {
        fs.mkdirSync(bgDir, { recursive: true })
      }

      const destPath = join(bgDir, `custom_bg_${Date.now()}.${sourcePath.split('.').pop()}`)
      fs.copyFileSync(sourcePath, destPath)

      const db = getDb()
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('custom_background', destPath)

      return `file:///${destPath.replace(/\\/g, '/')}`
    } catch (err) {
      console.error('[ipc-handlers] Failed to set background image:', err)
      return null
    }
  })

  ipcMain.handle('select-and-set-app-icon', async (_event, appName: string) => {
    const { dialog } = require('electron')
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: `Select icon for ${appName}`,
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'webp'] }],
      properties: ['openFile']
    })

    if (canceled || filePaths.length === 0) return null

    try {
      const fs = require('fs')
      const path = filePaths[0]
      const buffer = fs.readFileSync(path)
      const ext = path.split('.').pop()
      const base64 = buffer.toString('base64')
      const dataUrl = `data:image/${ext};base64,${base64}`

      const db = getDb()
      db.prepare('INSERT OR REPLACE INTO app_custom_icons (app_name, icon_data) VALUES (?, ?)').run(appName, dataUrl)

      return dataUrl
    } catch (err) {
      console.error('[ipc-handlers] Failed to read/set app icon:', err)
      return null
    }
  })

  ipcMain.handle('delete-custom-icon', (_event, appName: string) => {
    const db = getDb()
    db.prepare('DELETE FROM app_custom_icons WHERE app_name = ?').run(appName)
    return true
  })
}
