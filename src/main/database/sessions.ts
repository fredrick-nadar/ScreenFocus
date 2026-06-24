import { getDb } from './db'

export interface Session {
  id?: number
  app_name: string
  window_title: string
  category: string
  start_time: number
  end_time: number | null
  duration_seconds: number
  is_idle: number
}

export interface AppUsageSummary {
  app_name: string
  category: string
  total_seconds: number
  session_count: number
}

export function insertSession(session: Omit<Session, 'id'>): number {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO sessions (app_name, window_title, category, start_time, end_time, duration_seconds, is_idle)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    session.app_name,
    session.window_title,
    session.category,
    session.start_time,
    session.end_time,
    session.duration_seconds,
    session.is_idle
  )
  return result.lastInsertRowid as number
}

export function getTodaySessions(): AppUsageSummary[] {
  const db = getDb()
  const todayStart = getTodayStartTimestamp()

  const stmt = db.prepare(`
    SELECT
      app_name,
      category,
      SUM(duration_seconds) as total_seconds,
      COUNT(*) as session_count
    FROM sessions
    WHERE start_time >= ? AND is_idle = 0
    GROUP BY app_name
    ORDER BY total_seconds DESC
  `)

  return stmt.all(todayStart) as AppUsageSummary[]
}

export function getSessionsForDate(dateStr: string): AppUsageSummary[] {
  const db = getDb()
  // Generate start and end of that specific date
  const dayStart = new Date(dateStr).setHours(0, 0, 0, 0)
  const dayEnd = new Date(dateStr).setHours(23, 59, 59, 999)

  const stmt = db.prepare(`
    SELECT
      app_name,
      category,
      SUM(duration_seconds) as total_seconds,
      COUNT(*) as session_count
    FROM sessions
    WHERE start_time >= ? AND start_time <= ? AND is_idle = 0
    GROUP BY app_name
    ORDER BY total_seconds DESC
  `)

  return stmt.all(dayStart, dayEnd) as AppUsageSummary[]
}

export function getTodaySessionsRaw(): Session[] {
  const db = getDb()
  const todayStart = getTodayStartTimestamp()

  const stmt = db.prepare(`
    SELECT * FROM sessions
    WHERE start_time >= ?
    ORDER BY start_time DESC
  `)

  return stmt.all(todayStart) as Session[]
}

export function getSessionsByDateRange(startDate: string, endDate: string): Session[] {
  const db = getDb()
  const start = new Date(startDate).setHours(0, 0, 0, 0)
  const end = new Date(endDate).setHours(23, 59, 59, 999)

  const stmt = db.prepare(`
    SELECT * FROM sessions
    WHERE start_time >= ? AND start_time <= ?
    ORDER BY start_time ASC
  `)

  return stmt.all(start, end) as Session[]
}

export function getTodayCategoryTotals(): Record<string, number> {
  const db = getDb()
  const todayStart = getTodayStartTimestamp()

  const stmt = db.prepare(`
    SELECT category, SUM(duration_seconds) as total
    FROM sessions
    WHERE start_time >= ? AND is_idle = 0
    GROUP BY category
  `)

  const rows = stmt.all(todayStart) as { category: string; total: number }[]
  const result: Record<string, number> = {}
  for (const row of rows) {
    result[row.category] = row.total
  }
  return result
}

export function getHourlyBreakdown(date?: string): { hour: number; category: string; seconds: number }[] {
  const db = getDb()
  const targetDate = date || new Date().toISOString().split('T')[0]
  const dayStart = new Date(targetDate).setHours(0, 0, 0, 0)
  const dayEnd = new Date(targetDate).setHours(23, 59, 59, 999)

  const stmt = db.prepare(`
    SELECT
      CAST((start_time - ?) / 3600000 AS INTEGER) as hour,
      category,
      SUM(duration_seconds) as seconds
    FROM sessions
    WHERE start_time >= ? AND start_time <= ? AND is_idle = 0
    GROUP BY hour, category
    ORDER BY hour ASC
  `)

  return stmt.all(dayStart, dayStart, dayEnd) as { hour: number; category: string; seconds: number }[]
}

export function getTodayTotalActiveSeconds(): number {
  const db = getDb()
  const todayStart = getTodayStartTimestamp()

  const stmt = db.prepare(`
    SELECT COALESCE(SUM(duration_seconds), 0) as total
    FROM sessions
    WHERE start_time >= ? AND is_idle = 0
  `)

  const result = stmt.get(todayStart) as { total: number }
  return result.total
}

export function getTodayIdleSeconds(): number {
  const db = getDb()
  const todayStart = getTodayStartTimestamp()

  const stmt = db.prepare(`
    SELECT COALESCE(SUM(duration_seconds), 0) as total
    FROM sessions
    WHERE start_time >= ? AND is_idle = 1
  `)

  const result = stmt.get(todayStart) as { total: number }
  return result.total
}

function getTodayStartTimestamp(): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.getTime()
}
