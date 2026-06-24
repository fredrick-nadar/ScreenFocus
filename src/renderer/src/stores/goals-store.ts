import { create } from 'zustand'
import api from '../lib/ipc'

interface Goal {
  id?: number
  goal_name: string
  category: string | null
  target_minutes: number
  is_active: number
  current_minutes?: number
  percentage?: number
}

interface GoalsState {
  goals: Goal[]
  fetchGoals: () => Promise<void>
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>
  updateGoal: (goal: Goal) => Promise<void>
  removeGoal: (id: number) => Promise<void>
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],

  fetchGoals: async () => {
    try {
      const goals = await api().getGoals()
      set({ goals })
    } catch (err) {
      console.error('Failed to fetch goals:', err)
    }
  },

  addGoal: async (goal) => {
    try {
      await api().upsertGoal({ ...goal, is_active: 1 })
      await get().fetchGoals()
    } catch (err) {
      console.error('Failed to add goal:', err)
    }
  },

  updateGoal: async (goal) => {
    try {
      await api().upsertGoal(goal)
      await get().fetchGoals()
    } catch (err) {
      console.error('Failed to update goal:', err)
    }
  },

  removeGoal: async (id) => {
    try {
      await api().deleteGoal(id)
      await get().fetchGoals()
    } catch (err) {
      console.error('Failed to delete goal:', err)
    }
  }
}))
