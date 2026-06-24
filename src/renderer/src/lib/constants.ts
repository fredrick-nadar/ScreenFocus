// ── Color Palette ─────────────────────────────────────────────
export const CATEGORY_COLORS: Record<string, { fill: string; stroke: string }> = {
  'Code editors / IDEs': { fill: 'rgba(55, 138, 221, 0.18)', stroke: '#85B7EB' },
  Browsers: { fill: 'rgba(239, 159, 39, 0.15)', stroke: '#EF9F27' },
  'AI / Chat tools': { fill: 'rgba(93, 202, 165, 0.15)', stroke: '#5DCAA5' },
  'OS / System utilities': { fill: 'rgba(175, 169, 236, 0.15)', stroke: '#AFA9EC' },
  'Terminals / Shells': { fill: 'rgba(136, 135, 128, 0.12)', stroke: '#888780' },
  'Design tools': { fill: 'rgba(212, 83, 126, 0.15)', stroke: '#ED93B1' },
  'Productivity / Docs': { fill: 'rgba(99, 153, 34, 0.15)', stroke: '#97C459' },
  Uncategorized: { fill: 'rgba(136, 135, 128, 0.08)', stroke: '#5F5E5A' },
  Idle: { fill: 'rgba(136, 135, 128, 0.15)', stroke: 'rgba(255,255,255,0.40)' } // Fallback for idle
}

// ── Status Pills Colors ─────────────────────────────────────────
export const STATUS_COLORS = {
  tracking: { bg: 'rgba(29, 158, 117, 0.18)', text: '#5DCAA5', border: 'rgba(29,158,117,0.30)' },
  paused: { bg: 'rgba(136, 135, 128, 0.15)', text: 'rgba(255,255,255,0.40)', border: 'rgba(255,255,255,0.12)' },
  category: { bg: 'rgba(127, 119, 221, 0.16)', text: '#AFA9EC', border: 'rgba(127,119,221,0.25)' }
}

// ── Generic Fallback SVG Icons (Paths) ──────────────────────────
export const CATEGORY_SVG_PATHS: Record<string, string> = {
  'Code editors / IDEs': 'M4 10l-4 4 4 4m16-8l4 4-4 4m-4-10l-8 16',
  Browsers: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z M12 2a10 10 0 0 0-4 10 10 10 0 0 0 4 10 M12 2a10 10 0 0 1 4 10 10 10 0 0 1-4 10 M2 12h20',
  'AI / Chat tools': 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z M8 12h8 M12 8v8', // placeholder simplified AI/chat
  'OS / System utilities': 'M12 2l4 8h-8z M12 22l-4-8h8z', // abstract shapes
  'Terminals / Shells': 'M4 4l8 8-8 8 M12 20h8',
  'Design tools': 'M12 2L2 22h20Z', // placeholder pen tool/triangle
  'Productivity / Docs': 'M4 2h12v16H4z M4 6h12 M4 10h12 M4 14h8',
  Uncategorized: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z M12 8v4 M12 16h.01' // Circle with info/question
}

// ── All Categories ────────────────────────────────────────────
export const ALL_CATEGORIES = [
  'Code editors / IDEs',
  'Browsers',
  'AI / Chat tools',
  'OS / System utilities',
  'Terminals / Shells',
  'Design tools',
  'Productivity / Docs',
  'Uncategorized'
] as const

// ── Day Names ─────────────────────────────────────────────────
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
export const DAY_NAMES_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const
