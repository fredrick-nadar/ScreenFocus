import { getTodayStats } from '../database/daily-stats'
import { getTodaySessions, getTodayCategoryTotals } from '../database/sessions'
import { getLongestFocusSession } from '../database/daily-stats'

export interface Insight {
  id: string
  text: string
  icon: string
  type: 'positive' | 'neutral' | 'negative'
}

export function generateDailyInsights(): Insight[] {
  const insights: Insight[] = []
  const todayStats = getTodayStats()
  const sessions = getTodaySessions()
  const categoryTotals = getTodayCategoryTotals()

  // 1. Productivity score insight
  if (todayStats.productivity_score >= 80) {
    insights.push({
      id: 'prod-high',
      text: `Incredible focus today! Your productivity is at ${todayStats.productivity_score}%.`,
      icon: '🚀',
      type: 'positive'
    })
  } else if (todayStats.productivity_score >= 50) {
    insights.push({
      id: 'prod-mid',
      text: `Solid day so far — ${todayStats.productivity_score}% productivity.`,
      icon: '💪',
      type: 'neutral'
    })
  } else if (todayStats.screen_time > 0) {
    insights.push({
      id: 'prod-low',
      text: `Productivity at ${todayStats.productivity_score}%. Try a focused work block!`,
      icon: '🎯',
      type: 'negative'
    })
  }

  // 2. Coding time insight
  if (todayStats.coding_time > 0) {
    const hours = Math.floor(todayStats.coding_time / 3600)
    const mins = Math.round((todayStats.coding_time % 3600) / 60)
    insights.push({
      id: 'coding',
      text: `You've coded for ${hours > 0 ? hours + 'h ' : ''}${mins}m today.`,
      icon: '💻',
      type: 'positive'
    })
  }

  // 3. Longest focus session
  const longestSession = getLongestFocusSession()
  if (longestSession && longestSession.duration_seconds > 600) {
    const mins = Math.round(longestSession.duration_seconds / 60)
    insights.push({
      id: 'focus',
      text: `Longest focus session: ${mins}m in ${longestSession.app_name}.`,
      icon: '🔥',
      type: 'positive'
    })
  }

  // 4. Most productive period
  if (sessions.length > 0) {
    const hourMap: Record<number, number> = {}
    for (const s of sessions) {
      // Estimate the hour from session start time proportion
      const sessionHour = new Date(Date.now() - (s.total_seconds || 0) * 1000).getHours()
      hourMap[sessionHour] = (hourMap[sessionHour] || 0) + (s.total_seconds || 0)
    }

    const peakHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0]
    if (peakHour) {
      const hour = parseInt(peakHour[0])
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      insights.push({
        id: 'peak',
        text: `Most productive around ${displayHour} ${ampm}.`,
        icon: '⏰',
        type: 'neutral'
      })
    }
  }

  // 5. App diversity
  if (sessions.length > 5) {
    insights.push({
      id: 'diversity',
      text: `You've used ${sessions.length} different apps today.`,
      icon: '📱',
      type: 'neutral'
    })
  }

  // 6. Entertainment warning
  const entertainmentTime = (categoryTotals['Entertainment'] || 0) + (categoryTotals['Gaming'] || 0)
  if (entertainmentTime > 3600) {
    const hours = Math.round(entertainmentTime / 3600 * 10) / 10
    insights.push({
      id: 'entertainment',
      text: `${hours}h spent on entertainment & gaming. Balance is key!`,
      icon: '⚖️',
      type: 'negative'
    })
  }

  return insights
}
