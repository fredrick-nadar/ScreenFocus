import { getDb } from './db'
import { getTodayCategoryTotals, getTodayTotalActiveSeconds, getTodayIdleSeconds } from './sessions'

export interface DailyStats {
  date: string
  coding_time: number
  learning_time: number
  communication_time: number
  entertainment_time: number
  gaming_time: number
  productive_time: number
  screen_time: number
  idle_time: number
  productivity_score: number
}

export interface StreakInfo {
  category: string
  streak_days: number
  last_active_date: string
}

export function aggregateAndSaveTodayStats(): DailyStats {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  const categoryTotals = getTodayCategoryTotals()
  const totalActive = getTodayTotalActiveSeconds()
  const totalIdle = getTodayIdleSeconds()

  const coding = (categoryTotals['editor'] || 0) + (categoryTotals['terminal'] || 0)
  const learning = (categoryTotals['browser'] || 0) + (categoryTotals['ai'] || 0)
  const communication = categoryTotals['comms'] || 0
  const entertainment = 0 // No direct map anymore
  const gaming = 0 // No direct map anymore
  const productive = coding + learning + (categoryTotals['design'] || 0)
  const score = totalActive > 0 ? Math.round((productive / totalActive) * 100) : 0

  const stats: DailyStats = {
    date: today,
    coding_time: coding,
    learning_time: learning,
    communication_time: communication,
    entertainment_time: entertainment,
    gaming_time: gaming,
    productive_time: productive,
    screen_time: totalActive,
    idle_time: totalIdle,
    productivity_score: score
  }

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO daily_stats
    (date, coding_time, learning_time, communication_time, entertainment_time, gaming_time,
     productive_time, screen_time, idle_time, productivity_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    stats.date,
    stats.coding_time,
    stats.learning_time,
    stats.communication_time,
    stats.entertainment_time,
    stats.gaming_time,
    stats.productive_time,
    stats.screen_time,
    stats.idle_time,
    stats.productivity_score
  )

  return stats
}

export function getTodayStats(): DailyStats {
  return aggregateAndSaveTodayStats()
}

export function getWeeklyStats(): DailyStats[] {
  const db = getDb()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const startDate = sevenDaysAgo.toISOString().split('T')[0]

  const stmt = db.prepare(`
    SELECT * FROM daily_stats
    WHERE date >= ?
    ORDER BY date ASC
  `)

  const stats = stmt.all(startDate) as DailyStats[]

  // Fill in missing days with zero values
  const result: DailyStats[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split('T')[0]
    const existing = stats.find((s) => s.date === dateStr)
    if (existing) {
      result.push(existing)
    } else {
      result.push({
        date: dateStr,
        coding_time: 0,
        learning_time: 0,
        communication_time: 0,
        entertainment_time: 0,
        gaming_time: 0,
        productive_time: 0,
        screen_time: 0,
        idle_time: 0,
        productivity_score: 0
      })
    }
  }

  return result
}

export function getStreaks(): StreakInfo[] {
  const db = getDb()
  const categories = ['editor', 'browser', 'design']
  const streaks: StreakInfo[] = []

  for (const category of categories) {
    const stmt = db.prepare(`
      SELECT date FROM daily_stats
      WHERE ${getCategoryColumn(category)} > 0
      ORDER BY date DESC
    `)

    const rows = stmt.all() as { date: string }[]

    if (rows.length === 0) {
      streaks.push({ category, streak_days: 0, last_active_date: '' })
      continue
    }

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < rows.length; i++) {
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      const expectedStr = expectedDate.toISOString().split('T')[0]

      if (rows[i].date === expectedStr) {
        streak++
      } else {
        break
      }
    }

    streaks.push({
      category,
      streak_days: streak,
      last_active_date: rows[0]?.date || ''
    })
  }

  return streaks
}

function getCategoryColumn(category: string): string {
  const map: Record<string, string> = {
    editor: 'coding_time',
    terminal: 'coding_time',
    browser: 'learning_time',
    ai: 'learning_time',
    comms: 'communication_time',
    design: 'productive_time', // or just map it somewhere to keep stats working
    os: 'screen_time',
    default: 'screen_time'
  }
  return map[category] || 'screen_time'
}

export function getLongestFocusSession(date?: string): { app_name: string; duration_seconds: number } | null {
  const db = getDb()
  const targetDate = date || new Date().toISOString().split('T')[0]
  const dayStart = new Date(targetDate).setHours(0, 0, 0, 0)
  const dayEnd = new Date(targetDate).setHours(23, 59, 59, 999)

  const stmt = db.prepare(`
    SELECT app_name, duration_seconds
    FROM sessions
    WHERE start_time >= ? AND start_time <= ? AND is_idle = 0
    ORDER BY duration_seconds DESC
    LIMIT 1
  `)

  return stmt.get(dayStart, dayEnd) as { app_name: string; duration_seconds: number } | null
}
