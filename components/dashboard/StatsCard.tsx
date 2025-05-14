'use client'

import { Card } from '@/components/ui/card'

type StatsCardProps = {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          {trend && (
            <p className={`text-xs flex items-center mt-2 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
              <span className="text-gray-400 ml-1">
                from last month
              </span>
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
          {icon}
        </div>
      </div>
    </Card>
  )
}
