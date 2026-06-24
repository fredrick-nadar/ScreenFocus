export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'

export function getTimeOfDay(hour: number = new Date().getHours()): TimeOfDay {
  if (hour >= 5 && hour < 9) return 'dawn'
  if (hour >= 9 && hour < 17) return 'day'
  if (hour >= 17 && hour < 21) return 'dusk'
  return 'night'
}
