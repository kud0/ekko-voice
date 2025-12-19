'use client'

import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    positive: boolean
  }
  color: 'cyan' | 'purple' | 'orange' | 'green' | 'red' | 'blue'
}

const colorClasses = {
  cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
  green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
  red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, color }: StatsCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} border p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trend.positive ? '+' : ''}{trend.value}%</span>
              <span className="text-gray-500">vs last week</span>
            </div>
          )}
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
