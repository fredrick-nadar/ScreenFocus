import { getDb } from './db'

export interface Goal {
  id: number
  goal_name: string
  category: string | null
  target_minutes: number
  is_active: number
}

export interface GoalProgress extends Goal {
  current_minutes: number
  percentage: number
}

export function getGoals(): Goal[] {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM goals WHERE is_active = 1')
  return stmt.all() as Goal[]
}

export function getGoalProgress(): GoalProgress[] {
  const db = getDb()
  const goals = getGoals()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  return goals.map((goal) => {
    let currentMinutes = 0

    if (goal.category === 'Screen Time') {
      const stmt = db.prepare(`
        SELECT COALESCE(SUM(duration_seconds), 0) as total
        FROM sessions
        WHERE start_time >= ? AND is_idle = 0
      `)
      const result = stmt.get(todayStart.getTime()) as { total: number }
      currentMinutes = Math.round(result.total / 60)
    } else if (goal.category) {
      const stmt = db.prepare(`
        SELECT COALESCE(SUM(duration_seconds), 0) as total
        FROM sessions
        WHERE start_time >= ? AND is_idle = 0 AND category = ?
      `)
      const result = stmt.get(todayStart.getTime(), goal.category) as { total: number }
      currentMinutes = Math.round(result.total / 60)
    }

    return {
      ...goal,
      current_minutes: currentMinutes,
      percentage: Math.min(100, Math.round((currentMinutes / goal.target_minutes) * 100))
    }
  })
}

export function upsertGoal(goal: Omit<Goal, 'id'> & { id?: number }): number {
  const db = getDb()

  if (goal.id) {
    const stmt = db.prepare(`
      UPDATE goals SET goal_name = ?, category = ?, target_minutes = ?, is_active = ?
      WHERE id = ?
    `)
    stmt.run(goal.goal_name, goal.category, goal.target_minutes, goal.is_active, goal.id)
    return goal.id
  } else {
    const stmt = db.prepare(`
      INSERT INTO goals (goal_name, category, target_minutes, is_active)
      VALUES (?, ?, ?, ?)
    `)
    const result = stmt.run(goal.goal_name, goal.category, goal.target_minutes, goal.is_active)
    return result.lastInsertRowid as number
  }
}

export function deleteGoal(id: number): void {
  const db = getDb()
  const stmt = db.prepare('DELETE FROM goals WHERE id = ?')
  stmt.run(id)
}
