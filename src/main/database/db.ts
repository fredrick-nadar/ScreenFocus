import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

let db: Database.Database | null = null

export function getDbPath(): string {
  const userDataPath = app.getPath('userData')
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true })
  }
  return join(userDataPath, 'screenfocus.db')
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export function initDatabase(): void {
  const dbPath = getDbPath()
  db = new Database(dbPath)

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')
  db.pragma('foreign_keys = ON')

  // Run migrations
  runMigrations(db)
}

function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_name TEXT NOT NULL,
      window_title TEXT,
      category TEXT DEFAULT 'Uncategorized',
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      duration_seconds INTEGER DEFAULT 0,
      is_idle INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_start ON sessions(start_time);
    CREATE INDEX IF NOT EXISTS idx_sessions_category ON sessions(category);
    CREATE INDEX IF NOT EXISTS idx_sessions_app ON sessions(app_name);

    CREATE TABLE IF NOT EXISTS daily_stats (
      date TEXT PRIMARY KEY,
      coding_time INTEGER DEFAULT 0,
      learning_time INTEGER DEFAULT 0,
      communication_time INTEGER DEFAULT 0,
      entertainment_time INTEGER DEFAULT 0,
      gaming_time INTEGER DEFAULT 0,
      productive_time INTEGER DEFAULT 0,
      screen_time INTEGER DEFAULT 0,
      idle_time INTEGER DEFAULT 0,
      productivity_score REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_name TEXT NOT NULL,
      category TEXT,
      target_minutes INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS category_overrides (
      app_name TEXT PRIMARY KEY,
      category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS app_custom_icons (
      app_name TEXT PRIMARY KEY,
      icon_data TEXT NOT NULL
    );
  `)

  // Insert default settings if they don't exist
  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  )

  const defaults: [string, string][] = [
    ['idle_threshold_minutes', '5'],
    ['polling_interval_ms', '1000'],
    ['always_on_top', 'false'],
    ['start_with_windows', 'false'],
    ['widget_opacity', '1.0'],
    ['widget_mode', 'compact'],
    ['tracking_paused', 'false'],
    ['auto_hide', 'false']
  ]

  const insertMany = db.transaction(() => {
    for (const [key, value] of defaults) {
      insertSetting.run(key, value)
    }
  })

  insertMany()

  // Insert default goals
  const insertGoal = db.prepare(
    'INSERT OR IGNORE INTO goals (id, goal_name, category, target_minutes) VALUES (?, ?, ?, ?)'
  )

  const defaultGoals: [number, string, string, number][] = [
    [1, 'Daily Coding', 'Coding', 360],
    [2, 'Daily Learning', 'Learning', 120],
    [3, 'Screen Time Limit', 'Screen Time', 480]
  ]

  const insertGoals = db.transaction(() => {
    for (const [id, name, cat, target] of defaultGoals) {
      insertGoal.run(id, name, cat, target)
    }
  })

  insertGoals()
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
