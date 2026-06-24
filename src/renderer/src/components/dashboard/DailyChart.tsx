import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useTrackingStore } from '../../stores/tracking-store'
import { getDayLabel } from '../../lib/formatters'
import { DASHBOARD_COLORS } from '../../lib/constants'

export function DailyChart() {
  const { weeklyStats } = useTrackingStore()

  const chartData = useMemo(() => {
    return weeklyStats.map((day) => ({
      name: getDayLabel(day.date),
      Coding: Math.round(day.coding_time / 60),
      Learning: Math.round(day.learning_time / 60),
      Communication: Math.round(day.communication_time / 60),
      Entertainment: Math.round(day.entertainment_time / 60),
      Gaming: Math.round(day.gaming_time / 60)
    }))
  }, [weeklyStats])

  if (chartData.length === 0) return null

  return (
    <div>
      <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
        Weekly Activity
      </h3>
      <div className="glass-subtle rounded-xl p-3">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} barGap={1} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)' }}
              axisLine={false}
              tickLine={false}
              width={25}
              tickFormatter={(v) => `${v}m`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                fontSize: '10px',
                color: '#f1f5f9',
                backdropFilter: 'blur(10px)'
              }}
              formatter={(value: number) => [`${value}m`, undefined]}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="Coding" stackId="a" fill={DASHBOARD_COLORS.Coding} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Learning" stackId="a" fill={DASHBOARD_COLORS.Learning} />
            <Bar dataKey="Communication" stackId="a" fill={DASHBOARD_COLORS.Communication} />
            <Bar dataKey="Entertainment" stackId="a" fill={DASHBOARD_COLORS.Entertainment} />
            <Bar dataKey="Gaming" stackId="a" fill={DASHBOARD_COLORS.Gaming} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
