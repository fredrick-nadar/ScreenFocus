import React from 'react'
import { motion } from 'framer-motion'
import { ProductivityScore } from './dashboard/ProductivityScore'
import { DailyChart } from './dashboard/DailyChart'
import { InsightCards } from './dashboard/InsightCards'
import { StreakCards } from './dashboard/StreakCards'
import { AppUsageList } from './dashboard/AppUsageList'

export function DashboardView() {
  return (
    <div className="flex flex-col h-full text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ── HEADER ── */}
      <div className="px-4 py-4 shrink-0 flex flex-col items-center">
        <h2 className="text-xl font-light text-white/90 mb-1">Dashboard</h2>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 styled-scrollbar space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ProductivityScore />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <StreakCards />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <InsightCards />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <DailyChart />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <AppUsageList />
        </motion.div>
      </div>
    </div>
  )
}
