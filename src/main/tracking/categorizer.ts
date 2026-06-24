import { getDb } from '../database/db'

type Category = 'Coding' | 'Learning' | 'Communication' | 'Entertainment' | 'Gaming' | 'Uncategorized'

// Default app → category mappings (matched by lowercase process name substring)
const DEFAULT_CATEGORIES: Record<Category, string[]> = {
  Coding: [
    'code', 'vscode', 'visual studio', 'intellij', 'idea64', 'webstorm', 'pycharm',
    'cursor', 'sublime', 'atom', 'notepad++', 'vim', 'nvim', 'neovim',
    'terminal', 'windowsterminal', 'wt', 'powershell', 'cmd', 'bash', 'wsl',
    'github desktop', 'gitkraken', 'sourcetree', 'postman', 'insomnia',
    'android studio', 'xcode', 'eclipse', 'netbeans', 'rider', 'datagrip',
    'docker', 'figma', 'antigravity', 'zed', 'fleet', 'lapce'
  ],
  Learning: [
    'leetcode', 'hackerrank', 'codeforces', 'codechef',
    'chatgpt', 'claude', 'bard', 'copilot',
    'coursera', 'udemy', 'edx', 'khan academy', 'pluralsight',
    'notion', 'obsidian', 'anki',
    'adobe reader', 'foxit', 'sumatra'
  ],
  Communication: [
    'discord', 'slack', 'teams', 'zoom', 'skype',
    'telegram', 'whatsapp', 'signal', 'thunderbird',
    'outlook', 'gmail', 'mail'
  ],
  Entertainment: [
    'spotify', 'netflix', 'primevideo', 'amazon prime',
    'youtube', 'twitch', 'vlc', 'mpv', 'media player',
    'plex', 'disney', 'hbo', 'hulu',
    'reddit', 'twitter', 'instagram', 'tiktok', 'facebook'
  ],
  Gaming: [
    'valorant', 'steam', 'steamwebhelper', 'epicgames', 'epicgameslauncher',
    'riotclient', 'leagueclient', 'minecraft', 'fortnite',
    'csgo', 'cs2', 'dota2', 'apex', 'overwatch',
    'gta', 'roblox', 'battle.net', 'origin', 'ea app',
    'xbox', 'playnite', 'gog'
  ],
  Uncategorized: []
}

// Window title keywords for browser tab classification
const BROWSER_TITLE_KEYWORDS: Record<Category, string[]> = {
  Coding: [
    'github', 'gitlab', 'bitbucket', 'stackoverflow', 'stack overflow',
    'codepen', 'codesandbox', 'replit', 'jsfiddle',
    'npm', 'docs', 'documentation', 'api reference', 'developer',
    'mdn', 'w3schools', 'devtools'
  ],
  Learning: [
    'leetcode', 'hackerrank', 'codeforces', 'codechef', 'geeksforgeeks',
    'coursera', 'udemy', 'edx', 'khan academy',
    'chatgpt', 'claude', 'bard', 'perplexity',
    'tutorial', 'course', 'lecture', 'learn'
  ],
  Communication: [
    'gmail', 'outlook', 'mail', 'slack', 'discord',
    'teams', 'zoom', 'meet.google'
  ],
  Entertainment: [
    'youtube', 'netflix', 'twitch', 'reddit', 'twitter',
    'instagram', 'facebook', 'tiktok', 'spotify',
    'prime video', 'disney+', 'hulu'
  ],
  Gaming: [
    'steam', 'epic games', 'game', 'gaming'
  ],
  Uncategorized: []
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

  // 2. No automatic/upfront categorization - default to Uncategorized
  return 'Uncategorized'
}

function categorizeBrowserTitle(title: string): Category {
  // Check each category's title keywords
  for (const [category, keywords] of Object.entries(BROWSER_TITLE_KEYWORDS)) {
    if (category === 'Uncategorized') continue
    for (const keyword of keywords) {
      if (title.includes(keyword)) {
        return category as Category
      }
    }
  }

  return 'Uncategorized'
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
  return ['Coding', 'Learning', 'Communication', 'Entertainment', 'Gaming', 'Uncategorized']
}
