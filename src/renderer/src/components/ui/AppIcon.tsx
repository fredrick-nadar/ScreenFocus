import { useState } from 'react'
import { useTrackingStore } from '../../stores/tracking-store'

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
  className?: string
  clickable?: boolean
}

export function AppIcon({ appName, className = 'w-8 h-8', clickable = true }: AppIconProps) {
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

  // 1. Render custom user icon if set
  if (customIcon) {
    return (
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={`${className} rounded-xl bg-white/[0.02] p-1 flex items-center justify-center border border-white/10 shrink-0 transition-all duration-300 relative group ${
          clickable ? 'hover:scale-105 hover:bg-white/[0.06] hover:border-white/20 cursor-pointer' : ''
        }`}
        title={clickable ? `${cleanName} (Click to change, Right-click to reset)` : cleanName}
      >
        <img
          src={customIcon}
          alt={cleanName}
          className="w-full h-full object-contain rounded-lg"
        />
        {clickable && (
          <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-[11px] text-white/80">✎</span>
          </div>
        )}
      </div>
    )
  }

  // 2. Render system idle icon
  if (key === 'system idle' || key === 'idle') {
    return (
      <div
        className={`${className} rounded-xl flex items-center justify-center bg-slate-500/10 text-white/50 border border-white/5 font-semibold text-xs`}
        title="System Idle"
      >
        💤
      </div>
    )
  }

  const slug = BRAND_MAPPING[key]

  const renderInteractiveOverlay = () => {
    if (!clickable) return null
    return (
      <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <span className="text-[11px] text-white/80">✎</span>
      </div>
    )
  }

  // 3. Render brand icon from CDN
  if (slug && !hasError) {
    return (
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={`${className} rounded-xl bg-white/[0.03] p-1.5 flex items-center justify-center border border-white/5 shrink-0 transition-all duration-300 relative group ${
          clickable ? 'hover:scale-105 hover:bg-white/[0.06] cursor-pointer' : ''
        }`}
        title={clickable ? `${cleanName} (Click to set custom icon)` : cleanName}
      >
        <img
          src={`https://cdn.simpleicons.org/${slug}`}
          alt={cleanName}
          className="w-full h-full object-contain"
          onError={() => setHasError(true)}
        />
        {renderInteractiveOverlay()}
      </div>
    )
  }

  // 4. Render gradient letter avatar fallback
  const char = cleanName.charAt(0).toUpperCase() || '?'
  let hash = 0
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash % 360)
  const bg = `linear-gradient(135deg, hsl(${h}, 65%, 60%), hsl(${(h + 40) % 360}, 75%, 40%))`

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`${className} rounded-xl flex items-center justify-center font-bold text-white shrink-0 border border-white/10 select-none shadow-md transition-all duration-300 relative group ${
        clickable ? 'hover:scale-105 cursor-pointer' : ''
      }`}
      style={{
        background: bg,
        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }}
      title={clickable ? `${cleanName} (Click to set custom icon)` : cleanName}
    >
      <span className="text-sm font-semibold tracking-wider">{char}</span>
      {renderInteractiveOverlay()}
    </div>
  )
}
