import { create } from 'zustand'
import api from '../lib/ipc'

interface SettingsState {
  settings: Record<string, string>
  widgetMode: 'compact' | 'expanded'
  isLoading: boolean

  fetchSettings: () => Promise<void>
  setSetting: (key: string, value: string) => Promise<void>
  toggleWidgetMode: () => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  widgetMode: 'compact',
  isLoading: true,

  fetchSettings: async () => {
    try {
      const settings = await api().getSettings()
      set({
        settings,
        widgetMode: (settings.widget_mode as 'compact' | 'expanded') || 'compact',
        isLoading: false
      })
    } catch (err) {
      console.error('Failed to fetch settings:', err)
      set({ isLoading: false })
    }
  },

  setSetting: async (key: string, value: string) => {
    try {
      await api().setSetting(key, value)
      set((state) => ({
        settings: { ...state.settings, [key]: value }
      }))
    } catch (err) {
      console.error('Failed to save setting:', err)
    }
  },

  toggleWidgetMode: () => {
    const current = get().widgetMode
    const next = current === 'compact' ? 'expanded' : 'compact'
    set({ widgetMode: next })
    api().setSetting('widget_mode', next)
    api().windowToggleExpand(next === 'expanded')
  }
}))
