import { useState } from 'react'
import { useTrackingStore } from '../../stores/tracking-store'
import { CATEGORY_COLORS, CATEGORY_SVG_PATHS } from '../../lib/constants'

const BRAND_MAPPING: Record<string, string> = {
  // Browsers
  chrome: 'googlechrome',
  'google chrome': 'googlechrome',
  firefox: 'firefox',
  firefoxbrowser: 'firefox',
  msedge: 'microsoftedge',
  edge: 'microsoftedge',
  brave: 'brave',
  opera: 'opera',
  safari: 'safari',
  arc: 'arc',

  // Development
  code: 'visualstudiocode',
  vscode: 'visualstudiocode',
  'visual studio code': 'visualstudiocode',
  cursor: 'cursor',
  intellij: 'intellijidea',
  idea64: 'intellijidea',
  webstorm: 'webstorm',
  pycharm: 'pycharm',
  sublime: 'sublimetext',
  atom: 'atom',
  'notepad++': 'notepadplusplus',
  notepad: 'notepadplusplus',
  vim: 'vim',
  nvim: 'neovim',
  neovim: 'neovim',
  git: 'git',
  github: 'github',
  'github desktop': 'github',
  gitkraken: 'gitkraken',
  sourcetree: 'sourcetree',
  postman: 'postman',
  docker: 'docker',
  figma: 'figma',
  unity: 'unity',
  antigravity: 'google',

  // Communication / Social
  discord: 'discord',
  slack: 'slack',
  teams: 'microsoftteams',
  microsoftteams: 'microsoftteams',
  zoom: 'zoom',
  telegram: 'telegram',
  whatsapp: 'whatsapp',
  signal: 'signal',
  skype: 'skype',
  outlook: 'microsoftoutlook',
  thunderbird: 'mozillathunderbird',
  gmail: 'gmail',
  twitter: 'twitter',
  x: 'twitter',
  instagram: 'instagram',
  facebook: 'facebook',
  linkedin: 'linkedin',

  // Productivity / Learning
  notion: 'notion',
  obsidian: 'obsidian',
  evernote: 'evernote',
  trello: 'trello',
  todoist: 'todoist',
  leetcode: 'leetcode',
  coursera: 'coursera',
  udemy: 'udemy',
  chatgpt: 'openai',
  copilot: 'githubcopilot',

  // Entertainment / Gaming
  spotify: 'spotify',
  youtube: 'youtube',
  netflix: 'netflix',
  twitch: 'twitch',
  vlc: 'videolan',
  steam: 'steam',
  steamwebhelper: 'steam',
  epicgames: 'epicgames',
  riotclient: 'riotgames',
  leagueclient: 'leagueoflegends',
  minecraft: 'minecraft',
  roblox: 'roblox',
  'battle.net': 'battlenet',
  xbox: 'xbox'
}

interface AppIconProps {
  appName: string
  category?: string
  className?: string
  clickable?: boolean
}

export function AppIcon({ appName, category = 'Uncategorized', className = '', clickable = true }: AppIconProps) {
  const { customIcons, selectAndSetIcon, deleteCustomIcon } = useTrackingStore()
  const [hasError, setHasError] = useState(false)
  const cleanName = appName.replace('.exe', '').trim()
  const key = cleanName.toLowerCase()

  const customIcon = customIcons[appName]

  const handleClick = (e: React.MouseEvent) => {
    if (!clickable) return
    e.stopPropagation()
    selectAndSetIcon(appName)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!clickable) return
    e.preventDefault()
    e.stopPropagation()
    if (customIcon) {
      if (confirm(`Do you want to reset the icon for ${cleanName} to default?`)) {
        deleteCustomIcon(appName)
      }
    }
  }

  const { fill, stroke } = CATEGORY_COLORS[category] || CATEGORY_COLORS['Uncategorized']
  const baseClasses = `sf-icon shrink-0 relative group flex items-center justify-center transition-transform duration-200 ${className} ${clickable ? 'cursor-pointer hover:scale-[1.03]' : ''}`

  const renderInteractiveOverlay = () => {
    if (!clickable) return null
    return (
      <div className="absolute inset-0 bg-black/40 rounded-[7px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <span className="text-[10px] text-white/80">✎</span>
      </div>
    )
  }

  // 1. Render custom user icon if set
  if (customIcon) {
    return (
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={baseClasses}
        style={{ backgroundColor: fill, border: `0.5px solid ${stroke}40` }}
        title={clickable ? `${cleanName} (Click to change)` : cleanName}
      >
        <img src={customIcon} alt={cleanName} className="w-[18px] h-[18px] object-contain rounded-[4px]" />
        {renderInteractiveOverlay()}
      </div>
    )
  }

  // 2. Render system idle icon
  if (key === 'system idle' || key === 'idle') {
    const idleStyle = CATEGORY_COLORS['Idle']
    return (
      <div
        className={baseClasses}
        style={{ backgroundColor: idleStyle.fill, border: `0.5px solid ${idleStyle.stroke}40` }}
        title="System Idle"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={idleStyle.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4v16h20V4H2zm2 2h16v12H4V6zm2 2v2h4V8H6zm6 0v2h4V8h-4zm-6 4v2h10v-2H6z"/>
        </svg>
      </div>
    )
  }

  const slug = BRAND_MAPPING[key]

  // 3. Render brand icon from CDN
  if (slug && !hasError) {
    return (
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={baseClasses}
        style={{ backgroundColor: fill, border: `0.5px solid ${stroke}40` }}
        title={clickable ? `${cleanName} (Click to change)` : cleanName}
      >
        <img
          src={`https://cdn.simpleicons.org/${slug}/${stroke.replace('#', '')}`}
          alt={cleanName}
          className="w-[16px] h-[16px] object-contain"
          onError={() => setHasError(true)}
        />
        {renderInteractiveOverlay()}
      </div>
    )
  }

  // 4. Render SVG fallback based on category
  const svgPath = CATEGORY_SVG_PATHS[category] || CATEGORY_SVG_PATHS['Uncategorized']
  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={baseClasses}
      style={{ backgroundColor: fill, border: `0.5px solid ${stroke}40` }}
      title={clickable ? `${cleanName} (Click to change)` : cleanName}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={svgPath} />
      </svg>
      {renderInteractiveOverlay()}
    </div>
  )
}
