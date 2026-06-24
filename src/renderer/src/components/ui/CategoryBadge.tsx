import { DASHBOARD_COLORS, CATEGORY_ICONS } from '../../lib/constants'

interface CategoryBadgeProps {
  category: string
  size?: 'sm' | 'md'
  showIcon?: boolean
}

export function CategoryBadge({ category, size = 'sm', showIcon = true }: CategoryBadgeProps) {
  const color = DASHBOARD_COLORS[category] || '#94a3b8'
  const icon = CATEGORY_ICONS[category] || '📁'

  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses}`}
      style={{
        color,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}20`
      }}
    >
      {showIcon && <span>{icon}</span>}
      {category}
    </span>
  )
}
