// ── Color Palette ─────────────────────────────────────────────
export const COLORS = {
  lavender: '#D8C4F8',
  mint: '#C8F7DC',
  blue: '#BFD7FF',
  peach: '#FFD8BE',
  rose: '#FFC8DD',
  surfaceDark: '#111827',
  surfaceDarker: '#0a0f1a'
} as const

// ── Category → Color Mapping ──────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  Coding: COLORS.lavender,
  Learning: COLORS.mint,
  Communication: COLORS.blue,
  Entertainment: COLORS.peach,
  Gaming: COLORS.rose,
  Uncategorized: '#94a3b8',
  Idle: '#475569',
  'Screen Time': COLORS.blue
}

// ── Category → Emoji Mapping ──────────────────────────────────
export const CATEGORY_ICONS: Record<string, string> = {
  Coding: '💻',
  Learning: '📚',
  Communication: '💬',
  Entertainment: '🎵',
  Gaming: '🎮',
  Uncategorized: '📁',
  Idle: '💤'
}

// ── All Categories ────────────────────────────────────────────
export const ALL_CATEGORIES = [
  'Coding',
  'Learning',
  'Communication',
  'Entertainment',
  'Gaming',
  'Uncategorized'
] as const

// ── Day Names ─────────────────────────────────────────────────
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
export const DAY_NAMES_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const
