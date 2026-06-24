import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '../../stores/settings-store'
import api from '../../lib/ipc'

export function GeneralSettings() {
  const { settings, setSetting } = useSettingsStore()
  const [opacity, setOpacity] = useState(parseFloat(settings.widget_opacity || '1.0'))

  useEffect(() => {
    setOpacity(parseFloat(settings.widget_opacity || '1.0'))
  }, [settings.widget_opacity])

  const toggleSetting = async (key: string) => {
    const current = settings[key] === 'true'
    await setSetting(key, String(!current))
  }

  const handleOpacityChange = (value: number) => {
    setOpacity(value)
    api().setOpacity(value)
    setSetting('widget_opacity', String(value))
  }

  const toggleItems = [
    {
      key: 'always_on_top',
      label: 'Always on Top',
      description: 'Keep widget above other windows',
      icon: '📌'
    },
    {
      key: 'start_with_windows',
      label: 'Start with Windows',
      description: 'Launch on system startup',
      icon: '🚀'
    },
    {
      key: 'auto_hide',
      label: 'Auto Hide',
      description: 'Hide widget when not hovered',
      icon: '👻'
    }
  ]

  return (
    <div className="space-y-2.5">
      <h3 className="text-[9px] font-semibold text-white/25 uppercase tracking-[0.12em] mb-1">
        Settings
      </h3>

      {/* Toggle settings */}
      {toggleItems.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="glass-subtle rounded-2xl px-3.5 py-2.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm opacity-70">{item.icon}</span>
            <div>
              <div className="text-[10px] font-medium text-white/60">{item.label}</div>
              <div className="text-[8px] text-white/25">{item.description}</div>
            </div>
          </div>
          <button
            onClick={() => {
              toggleSetting(item.key)
              if (item.key === 'always_on_top') {
                api().setAlwaysOnTop(settings[item.key] !== 'true')
              }
            }}
            className={`w-8 h-4.5 rounded-full transition-all duration-300 relative ${
              settings[item.key] === 'true'
                ? 'bg-gradient-to-r from-violet-500/50 to-purple-500/50'
                : 'bg-white/8'
            }`}
            style={{ height: 18 }}
          >
            <motion.div
              className="w-3 h-3 rounded-full bg-white/90 absolute top-[3px]"
              animate={{
                left: settings[item.key] === 'true' ? '16px' : '3px'
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </motion.div>
      ))}

      {/* Opacity slider */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="glass-subtle rounded-2xl px-3.5 py-2.5"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">🔆</span>
            <span className="text-[10px] font-medium text-white/60">Opacity</span>
          </div>
          <span className="text-[9px] text-white/30 tabular-nums">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.3"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #a78bfa 0%, #a78bfa ${(opacity - 0.3) / 0.7 * 100}%, rgba(255,255,255,0.06) ${(opacity - 0.3) / 0.7 * 100}%, rgba(255,255,255,0.06) 100%)`
          }}
        />
      </motion.div>

      {/* Idle threshold */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="glass-subtle rounded-2xl px-3.5 py-2.5"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">⏰</span>
            <span className="text-[10px] font-medium text-white/60">Idle Threshold</span>
          </div>
          <span className="text-[9px] text-white/30 tabular-nums">
            {settings.idle_threshold_minutes || '5'} min
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="15"
          step="1"
          value={parseInt(settings.idle_threshold_minutes || '5')}
          onChange={(e) => setSetting('idle_threshold_minutes', e.target.value)}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #6ee7b7 0%, #6ee7b7 ${((parseInt(settings.idle_threshold_minutes || '5') - 1) / 14) * 100}%, rgba(255,255,255,0.06) ${((parseInt(settings.idle_threshold_minutes || '5') - 1) / 14) * 100}%, rgba(255,255,255,0.06) 100%)`
          }}
        />
      </motion.div>
    </div>
  )
}
