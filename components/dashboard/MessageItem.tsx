'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Search } from 'lucide-react'
import { Message, Grant } from '@/lib/dashboard/types'
import { GrantHologram } from './GrantHologram'

type MessageItemProps = {
  message: Message
  matchedGrants: (Grant | string)[]
  emitParticles: (count: number) => void
  hasQueried: boolean
}

export function MessageItem({ message, matchedGrants, emitParticles, hasQueried }: MessageItemProps) {
  if (!hasQueried) return null
  
  return (
    <motion.div
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'tween',
        duration: 0.2
      }}
      layout
    >
      <motion.div
        whileHover={{ scale: message.sender === 'bot' ? 1.01 : 1 }}
      >
        <Card
          className={`max-w-3xl backdrop-blur-lg relative overflow-hidden ${
            message.sender === 'user'
              ? 'bg-blue-500/10 border-blue-400/30 shadow-[0_0_30px_-10px_rgba(96,165,250,0.3)]'
              : message.sender === 'agent'
                ? 'bg-purple-500/10 border-purple-400/30 shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]'
                : 'bg-gray-900/60 border-blue-400/30 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]'
          }`}
        >
          {/* Animated border glow */}
          <div
            className={`absolute inset-0 rounded-lg pointer-events-none ${
              message.status === 'typing'
                ? 'animate-pulse bg-blue-500/10'
                : message.status === 'analyzing'
                  ? 'bg-yellow-500/10'
                  : 'bg-transparent'
            }`}
          />

          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Animated status indicator */}
              {message.sender === 'agent' && (
                <div className="mt-1 flex items-center">
                  {message.status === 'analyzing' ? (
                    <div className="relative">
                      <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />
                      <div
                        className="absolute inset-0 rounded-full border-2 border-yellow-400/30 animate-ping"
                        style={{ animationDuration: '1.5s' }}
                      />
                    </div>
                  ) : message.status === 'searching' ? (
                    <div className="relative">
                      <Search className="h-5 w-5 text-purple-400 animate-pulse" />
                      <div
                        className="absolute -inset-1 rounded-full bg-purple-400/10 animate-pulse"
                        style={{ animationDuration: '2s' }}
                      />
                    </div>
                  ) : null}
                </div>
              )}

              <div className="flex-1">
                {/* Message content with grant highlighting */}
                <div className="whitespace-pre-line text-gray-100">
                  {message.content.split(/([A-Z]{2,}-\d{2}-\d{3})/).map((part, i) =>
                    part.match(/[A-Z]{2,}-\d{2}-\d{3}/) ? (
                      <span
                        key={`highlight-${i}`}
                        className="font-mono text-blue-300 bg-blue-900/30 px-1 py-0.5 rounded hover:bg-blue-800/40 cursor-pointer transition-colors"
                        onClick={() => emitParticles(12)}
                      >
                        {part}
                      </span>
                    ) : (
                      <span key={`text-${i}`}>{part}</span>
                    )
                  )}
                </div>

                {/* Dynamic typing indicator */}
                {message.status === 'typing' && (
                  <div className="flex space-x-2 mt-4 opacity-80">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full bg-blue-400 animate-bounce`}
                        style={{
                          animationDuration: '0.8s',
                          animationDelay: `${i * 0.1}s`,
                          willChange: 'transform'
                        }}
                      />
                    ))}
                  </div>
                )}

                {message.grantLinks?.map(grantId => {
                  const fullGrant = matchedGrants.find(g =>
                    typeof g === 'string' ? false : g.id === grantId
                  )
                  return fullGrant && typeof fullGrant !== 'string' ? (
                    <GrantHologram key={grantId} grant={fullGrant} />
                  ) : (
                    <GrantHologram key={grantId} grant={{
                      id: grantId,
                      grant_name: 'Loading grant details...',
                      name: 'Loading grant details...',
                      agency: 'Unknown',
                      description: 'Grant details are being loaded...',
                      deadline: 'TBD',
                      focus_area: 'Pending',
                      match_reason: 'Matched by AI analysis'
                    }} />
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
