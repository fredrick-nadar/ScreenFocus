import { getDb } from '../database/db'

type Category = 'editor' | 'browser' | 'ai' | 'os' | 'terminal' | 'design' | 'comms' | 'default'

// Default app → category mappings (matched by lowercase process name substring)
const DEFAULT_CATEGORIES: Record<Category, string[]> = {
  editor: [
    'code', 'vscode', 'visual studio', 'intellij', 'idea64', 'webstorm', 'pycharm',
    'cursor', 'sublime', 'atom', 'notepad++', 'vim', 'nvim', 'neovim',
    'android studio', 'xcode', 'eclipse', 'netbeans', 'rider', 'datagrip',
    'zed', 'fleet', 'lapce'
  ],
  browser: [
    'chrome', 'firefox', 'edge', 'msedge', 'brave', 'opera', 'vivaldi', 'arc', 'safari'
  ],
  ai: [
    'chatgpt', 'claude', 'bard', 'copilot'
  ],
  comms: [
    'discord', 'slack', 'teams', 'zoom', 'skype',
    'telegram', 'whatsapp', 'signal', 'outlook', 'thunderbird', 'gmail', 'mail'
  ],
  os: [
    'explorer', 'finder', 'control panel', 'settings', 'taskmgr'
  ],
  terminal: [
    'terminal', 'windowsterminal', 'wt', 'powershell', 'cmd', 'bash', 'wsl'
  ],
  design: [
    'figma', 'photoshop', 'illustrator', 'xd', 'sketch', 'affinity'
  ],
  default: []
}

// Window title keywords for browser tab classification
const BROWSER_TITLE_KEYWORDS: Record<Category, string[]> = {
  editor: [
    'github', 'gitlab', 'bitbucket', 'stackoverflow', 'stack overflow',
    'codepen', 'codesandbox', 'replit', 'jsfiddle',
    'npm', 'docs', 'documentation', 'api reference', 'developer',
    'mdn', 'w3schools', 'devtools'
  ],
  browser: [],
  ai: [
    'chatgpt', 'claude', 'bard', 'perplexity'
  ],
  comms: [
    'slack', 'discord', 'teams', 'zoom', 'meet.google', 'gmail', 'outlook', 'mail'
  ],
  os: [],
  terminal: [],
  design: ['figma'],
  default: []
}

// Browsers list for title-based categorization
const BROWSERS = ['chrome', 'firefox', 'edge', 'msedge', 'brave', 'opera', 'vivaldi', 'arc', 'safari']

export function categorizeApp(processName: string, windowTitle: string): Category {
  const db = getDb()

  // 1. Check user overrides first
  const override = db.prepare(
    'SELECT category FROM category_overrides WHERE app_name = ?'
  ).get(processName) as { category: Category } | undefined

  if (override) {
    return override.category
  }

  // 2. No automatic/upfront categorization - default to default
  return 'default'
}

function categorizeBrowserTitle(title: string): Category {
  // Check each category's title keywords
  for (const [category, keywords] of Object.entries(BROWSER_TITLE_KEYWORDS)) {
    if (category === 'default') continue
    for (const keyword of keywords) {
      if (title.includes(keyword)) {
        return category as Category
      }
    }
  }

  return 'default'
}

export function setCategoryOverride(appName: string, category: string): void {
  const db = getDb()
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO category_overrides (app_name, category) VALUES (?, ?)'
  )
  stmt.run(appName, category)
}

export function getCategoryOverrides(): Record<string, string> {
  const db = getDb()
  const stmt = db.prepare('SELECT app_name, category FROM category_overrides')
  const rows = stmt.all() as { app_name: string; category: string }[]
  const result: Record<string, string> = {}
  for (const row of rows) {
    result[row.app_name] = row.category
  }
  return result
}

export function getAllCategories(): string[] {
  return [
    'editor',
    'browser',
    'ai',
    'os',
    'terminal',
    'design',
    'comms',
    'default'
  ]
}
