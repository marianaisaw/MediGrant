'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Search } from 'lucide-react'
import { Message, Grant } from '@/lib/dashboard/types'
import { GrantHologram } from './GrantHologram'
import { Button } from '@/components/ui/button'

type MessageItemProps = {
  message: Message
  matchedGrants: (Grant | string)[]
  emitParticles: (count: number) => void
  hasQueried: boolean
  onFollowUpClick?: (question: string) => void
  isLoading?: boolean
}

export function MessageItem({ message, emitParticles, hasQueried, onFollowUpClick, isLoading }: MessageItemProps) {
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

                {/* Render Grant Holograms if linkedGrantData exists */}
                {message.linkedGrantData?.map(grantInfo => {
                  // Now we directly use the grantInfo from the message
                  return (
                    <GrantHologram key={grantInfo.id} grant={grantInfo} />
                  );
                })}
              </div>
            </div>
            {/* Render Follow-up Questions as Buttons */}
            {message.sender === 'bot' && message.followUpQuestions && message.followUpQuestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-wrap gap-2">
              {message.followUpQuestions.map((question, index) => (
                <Button
                  key={`followup-${message.id}-${index}`}
                  variant="outline"
                  size="sm"
                  className="
                    px-3 py-2
                    max-w-[200px]
                    h-auto
                    whitespace-normal
                    break-words
                    text-center           /* center text inside */
                    bg-sky-500/10 hover:bg-sky-500/20
                    border-sky-400/30
                    text-sky-300 hover:text-sky-200
                    transition-all duration-150 ease-in-out
                    shadow-md hover:shadow-sky-500/30
                    focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-gray-800
                    disabled:bg-sky-500/5 disabled:text-sky-300/40 disabled:border-sky-400/15 disabled:shadow-none disabled:cursor-not-allowed
                    line-clamp-3          /* Truncate text to 3 lines with ellipsis */
                    cursor-pointer
                    "
                  onClick={() => onFollowUpClick?.(question)}
                  disabled={isLoading}
                >
                  <span className="flex flex-col justify-center items-center text-xs">{question}</span>
                </Button>
              ))}
            </div>
          )}

          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
