export function calculateProductivityScore(
  codingSeconds: number,
  learningSeconds: number,
  totalActiveSeconds: number
): number {
  if (totalActiveSeconds === 0) return 0
  const productive = codingSeconds + learningSeconds
  return Math.min(100, Math.round((productive / totalActiveSeconds) * 100))
}

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.round((totalSeconds % 3600) / 60)

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function getProductivityColor(score: number): string {
  if (score >= 80) return '#C8F7DC' // Mint — excellent
  if (score >= 60) return '#BFD7FF' // Blue — good
  if (score >= 40) return '#FFD8BE' // Peach — moderate
  return '#FFC8DD' // Rose — low
}
