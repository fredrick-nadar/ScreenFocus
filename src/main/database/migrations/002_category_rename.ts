import Database from 'better-sqlite3'

export function migrateCategoryRename(db: Database.Database): void {
  // Check if we've already run this migration by checking for a flag in settings
  const hasRun = db.prepare('SELECT value FROM settings WHERE key = ?').get('migration_002_category_rename')
  if (hasRun) return

  console.log('Running migration: 002_category_rename')
  
  const renameTx = db.transaction(() => {
    // 1. Rename existing categories in sessions
    db.prepare(`UPDATE sessions SET category = 'editor' WHERE category = 'Code editors / IDEs' OR category = 'Coding'`).run()
    db.prepare(`UPDATE sessions SET category = 'browser' WHERE category = 'Browsers'`).run()
    db.prepare(`UPDATE sessions SET category = 'ai' WHERE category = 'AI / Chat tools' OR category = 'Learning'`).run()
    db.prepare(`UPDATE sessions SET category = 'os' WHERE category = 'OS / System utilities'`).run()
    db.prepare(`UPDATE sessions SET category = 'terminal' WHERE category = 'Terminals / Shells'`).run()
    db.prepare(`UPDATE sessions SET category = 'design' WHERE category = 'Design tools'`).run()
    db.prepare(`UPDATE sessions SET category = 'comms' WHERE category = 'Productivity / Docs' OR category = 'Communication'`).run()
    db.prepare(`UPDATE sessions SET category = 'default' WHERE category = 'Uncategorized'`).run()
    
    // Also update overrides
    db.prepare(`UPDATE category_overrides SET category = 'editor' WHERE category = 'Code editors / IDEs' OR category = 'Coding'`).run()
    db.prepare(`UPDATE category_overrides SET category = 'browser' WHERE category = 'Browsers'`).run()
    db.prepare(`UPDATE category_overrides SET category = 'ai' WHERE category = 'AI / Chat tools' OR category = 'Learning'`).run()
    db.prepare(`UPDATE category_overrides SET category = 'os' WHERE category = 'OS / System utilities'`).run()
    db.prepare(`UPDATE category_overrides SET category = 'terminal' WHERE category = 'Terminals / Shells'`).run()
    db.prepare(`UPDATE category_overrides SET category = 'design' WHERE category = 'Design tools'`).run()
    db.prepare(`UPDATE category_overrides SET category = 'comms' WHERE category = 'Productivity / Docs' OR category = 'Communication'`).run()
    db.prepare(`UPDATE category_overrides SET category = 'default' WHERE category = 'Uncategorized'`).run()

    // 2. Mark migration as complete
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('migration_002_category_rename', 'true')
  })

  renameTx()
}
