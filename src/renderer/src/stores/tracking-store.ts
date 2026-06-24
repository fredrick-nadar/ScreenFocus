import { create } from 'zustand'
import api from '../lib/ipc'

interface AppUsage {
  app_name: string
  category: string
  total_seconds: number
  session_count: number
}

interface DailyStats {
  date: string
  coding_time: number
  learning_time: number
  communication_time: number
  entertainment_time: number
  gaming_time: number
  productive_time: number
  screen_time: number
  idle_time: number
  productivity_score: number
}

interface GoalProgress {
  id: number
  goal_name: string
  category: string | null
  target_minutes: number
  current_minutes: number
  percentage: number
  is_active: number
}

interface StreakInfo {
  category: string
  streak_days: number
  last_active_date: string
}

interface Insight {
  id: string
  text: string
  icon: string
  type: 'positive' | 'neutral' | 'negative'
}

interface TrackingUpdate {
  currentApp: string | null
  currentCategory: string | null
  isIdle: boolean
  isPaused: boolean
  sessionStart: number | null
}

interface SystemInfo {
  uptimeSeconds: number
  idleSeconds: number
  onTodaySeconds: number
  bootTimestamp: number
}

interface TrackingState {
  // Live data
  currentApp: string | null
  currentCategory: string | null
  isIdle: boolean
  isPaused: boolean

  // Today's data
  todaySessions: AppUsage[]
  todayStats: DailyStats | null
  categoryTotals: Record<string, number>
  totalActiveSeconds: number

  // Weekly
  weeklyStats: DailyStats[]

  // Goals, Streaks, Insights
  goals: GoalProgress[]
  streaks: StreakInfo[]
  insights: Insight[]

  // System info
  systemInfo: SystemInfo | null

  // Loading
  isLoading: boolean

  // Actions
  fetchAll: () => Promise<void>
  fetchTodayData: () => Promise<void>
  fetchWeeklyData: () => Promise<void>
  fetchGoals: () => Promise<void>
  fetchStreaks: () => Promise<void>
  fetchInsights: () => Promise<void>
  fetchSystemInfo: () => Promise<void>
  handleTrackingUpdate: (data: TrackingUpdate) => void
  toggleTracking: () => Promise<void>
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  currentApp: null,
  currentCategory: null,
  isIdle: false,
  isPaused: false,

  todaySessions: [],
  todayStats: null,
  categoryTotals: {},
  totalActiveSeconds: 0,

  weeklyStats: [],
  goals: [],
  streaks: [],
  insights: [],

  systemInfo: null,

  isLoading: true,

  fetchAll: async () => {
    set({ isLoading: true })
    await Promise.all([
      get().fetchTodayData(),
      get().fetchWeeklyData(),
      get().fetchGoals(),
      get().fetchStreaks(),
      get().fetchInsights(),
      get().fetchSystemInfo()
    ])
    set({ isLoading: false })
  },

  fetchTodayData: async () => {
    try {
      const [sessions, stats, totals, active] = await Promise.all([
        api().getTodaySessions(),
        api().getTodayStats(),
        api().getTodayCategoryTotals(),
        api().getTodayTotalActive()
      ])
      set({
        todaySessions: sessions,
        todayStats: stats,
        categoryTotals: totals,
        totalActiveSeconds: active
      })
    } catch (err) {
      console.error('Failed to fetch today data:', err)
    }
  },

  fetchWeeklyData: async () => {
    try {
      const stats = await api().getWeeklyStats()
      set({ weeklyStats: stats })
    } catch (err) {
      console.error('Failed to fetch weekly data:', err)
    }
  },

  fetchGoals: async () => {
    try {
      const goals = await api().getGoals()
      set({ goals })
    } catch (err) {
      console.error('Failed to fetch goals:', err)
    }
  },

  fetchStreaks: async () => {
    try {
      const streaks = await api().getStreaks()
      set({ streaks })
    } catch (err) {
      console.error('Failed to fetch streaks:', err)
    }
  },

  fetchInsights: async () => {
    try {
      const insights = await api().getInsights()
      set({ insights })
    } catch (err) {
      console.error('Failed to fetch insights:', err)
    }
  },

  fetchSystemInfo: async () => {
    try {
      const systemInfo = await api().getSystemInfo()
      set({ systemInfo })
    } catch (err) {
      console.error('Failed to fetch system info:', err)
    }
  },

  handleTrackingUpdate: (data: TrackingUpdate) => {
    set({
      currentApp: data.currentApp,
      currentCategory: data.currentCategory,
      isIdle: data.isIdle,
      isPaused: data.isPaused
    })
  },

  toggleTracking: async () => {
    try {
      const isPaused = await api().toggleTracking()
      set({ isPaused })
    } catch (err) {
      console.error('Failed to toggle tracking:', err)
    }
  }
}))
