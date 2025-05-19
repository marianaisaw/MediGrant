'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { LinkedGrantInfo } from '@/lib/dashboard/types'

type GrantHologramProps = {
  grant: LinkedGrantInfo
}

export function GrantHologram({ grant }: GrantHologramProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="my-3"
    >
      <Card className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/20 border border-blue-400/30 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1 text-white">
              <h3 className="font-mono text-lg font-bold text-blue-300">
                {grant.id || 'ID-TBD'}
              </h3>
              <p className="text-sm text-blue-100">
                {grant.name && grant.name.includes('Loading') ? (
                  <span className="animate-pulse">Loading grant details...</span>
                ) : (
                  grant.name || 'Unnamed Grant'
                )}
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 bg-blue-900/30 p-2 rounded-md border-l-4 border-blue-400">
                  <div className="text-blue-300 font-bold">🏛️ Agency:</div>
                  <div className="text-white font-medium">{grant.agency || 'Agency TBD'}</div>
                </div>
                <div className="flex items-center gap-2 bg-purple-900/30 p-2 rounded-md border-l-4 border-purple-400">
                  <div className="text-purple-300 font-bold">📅 Deadline:</div>
                  <div className="text-white font-medium">{grant.deadline || 'Deadline TBD'}</div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-900/30 p-2 rounded-md border-l-4 border-emerald-400">
                  <div className="text-emerald-300 font-bold">🎯 Focus:</div>
                  <div className="text-white font-medium">{grant.focus_area || 'Focus area TBD'}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
