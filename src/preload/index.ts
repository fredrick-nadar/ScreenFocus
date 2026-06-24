import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  // Data queries
  getTodaySessions: () => Promise<any[]>
  getTodayStats: () => Promise<any>
  getTodayCategoryTotals: () => Promise<Record<string, number>>
  getTodayTotalActive: () => Promise<number>
  getHourlyBreakdown: (date?: string) => Promise<any[]>
  getWeeklyStats: () => Promise<any[]>
  getInsights: () => Promise<any[]>
  getStreaks: () => Promise<any[]>
  getGoals: () => Promise<any[]>
  getCategories: () => Promise<string[]>
  getCategoryOverrides: () => Promise<Record<string, string>>
  getSettings: () => Promise<Record<string, string>>
  getTrackingStatus: () => Promise<{ isPaused: boolean }>
  getSystemInfo: () => Promise<{ uptimeSeconds: number; idleSeconds: number; onTodaySeconds: number; bootTimestamp: number }>
  getWindowSize: () => Promise<[number, number]>
  getCustomIcons: () => Promise<Record<string, string>>
  selectAndSetAppIcon: (appName: string) => Promise<string | null>
  deleteCustomIcon: (appName: string) => Promise<boolean>
  getBackgroundImage: () => Promise<string | null>

  // Mutations
  upsertGoal: (goal: any) => Promise<number>
  deleteGoal: (id: number) => Promise<boolean>
  setCategoryOverride: (appName: string, category: string) => Promise<boolean>
  setSetting: (key: string, value: string) => Promise<boolean>
  toggleTracking: () => Promise<boolean>

  // Window control
  windowDrag: (delta: { deltaX: number; deltaY: number }) => void
  windowToggleExpand: (expanded: boolean) => void
  setAlwaysOnTop: (value: boolean) => void
  setOpacity: (value: number) => void
  bringToFront: () => void

  // Event listeners
  onTrackingUpdate: (callback: (data: any) => void) => () => void
  onTrackingStatusChanged: (callback: (data: { isPaused: boolean }) => void) => () => void
  onCustomIconsUpdated: (callback: (data: Record<string, string>) => void) => () => void
}

const api: ElectronAPI = {
  // Data queries
  getTodaySessions: () => ipcRenderer.invoke('get-today-sessions'),
  getTodayStats: () => ipcRenderer.invoke('get-today-stats'),
  getTodayCategoryTotals: () => ipcRenderer.invoke('get-today-category-totals'),
  getTodayTotalActive: () => ipcRenderer.invoke('get-today-total-active'),
  getHourlyBreakdown: (date?) => ipcRenderer.invoke('get-hourly-breakdown', date),
  getWeeklyStats: () => ipcRenderer.invoke('get-weekly-stats'),
  getInsights: () => ipcRenderer.invoke('get-insights'),
  getStreaks: () => ipcRenderer.invoke('get-streaks'),
  getGoals: () => ipcRenderer.invoke('get-goals'),
  getCategories: () => ipcRenderer.invoke('get-categories'),
  getCategoryOverrides: () => ipcRenderer.invoke('get-category-overrides'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  getTrackingStatus: () => ipcRenderer.invoke('get-tracking-status'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getWindowSize: () => ipcRenderer.invoke('get-window-size'),
  getCustomIcons: () => ipcRenderer.invoke('get-custom-icons'),
  selectAndSetAppIcon: (appName) => ipcRenderer.invoke('select-and-set-app-icon', appName),
  deleteCustomIcon: (appName) => ipcRenderer.invoke('delete-custom-icon', appName),
  getBackgroundImage: () => ipcRenderer.invoke('get-background-image'),

  // Mutations
  upsertGoal: (goal) => ipcRenderer.invoke('upsert-goal', goal),
  deleteGoal: (id) => ipcRenderer.invoke('delete-goal', id),
  setCategoryOverride: (appName, category) =>
    ipcRenderer.invoke('set-category-override', appName, category),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  toggleTracking: () => ipcRenderer.invoke('toggle-tracking'),

  // Window control
  windowDrag: (delta) => ipcRenderer.send('window-drag', delta),
  windowToggleExpand: (expanded) => ipcRenderer.send('window-toggle-expand', expanded),
  setAlwaysOnTop: (value) => ipcRenderer.send('set-always-on-top', value),
  setOpacity: (value) => ipcRenderer.send('set-opacity', value),
  bringToFront: () => ipcRenderer.send('bring-to-front'),

  // Event listeners with cleanup
  onTrackingUpdate: (callback) => {
    const handler = (_event: any, data: any): void => callback(data)
    ipcRenderer.on('tracking-update', handler)
    return () => ipcRenderer.removeListener('tracking-update', handler)
  },
  onTrackingStatusChanged: (callback) => {
    const handler = (_event: any, data: { isPaused: boolean }): void => callback(data)
    ipcRenderer.on('tracking-status-changed', handler)
    return () => ipcRenderer.removeListener('tracking-status-changed', handler)
  },
  onCustomIconsUpdated: (callback) => {
    const handler = (_event: any, data: Record<string, string>): void => callback(data)
    ipcRenderer.on('custom-icons-updated', handler)
    return () => ipcRenderer.removeListener('custom-icons-updated', handler)
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)
