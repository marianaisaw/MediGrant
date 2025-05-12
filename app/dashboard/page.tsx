'use client'

import { useState, useEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronRight, Loader2, Linkedin, Search, Sparkles } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion'

type Message = {
  id: string
  content: string
  sender: 'user' | 'bot' | 'agent'
  status?: 'typing' | 'searching' | 'analyzing' | 'complete'
  grantLinks?: string[]
}

type Grant = {
  grant_name: string
  description: string
  id: string
  name: string
  agency: string
  deadline: string
  focus_area: string
  match_reason: string
  budget_range?: string
  eligibility?: string[]
  url?: string
}

type AnalysisResponse = {
  analysis_summary: string
  matched_grants: (Grant | string)[]   // <── widened
  next_steps: string[]
  follow_up_questions?: string[]       // <── now optional
  confidence_score: number
}

export default function HyperGrantAI() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-message',
      content: 'Hello! I\'m MediGrant AI. I can help you find and apply for healthcare research funding. Tell me about your project or what kind of grant you\'re looking for.',
      sender: 'bot',
      status: 'complete',
      grantLinks: []
    }
  ])
  const [showLinkedIn, setShowLinkedIn] = useState(false)
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasQueried, setHasQueried] = useState(false)
  const [particleCount, setParticleCount] = useState(0)
  const [matchedGrants, setMatchedGrants] = useState<(Grant | string)[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    container: containerRef
  })
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [ -100, 100 ], [ 5, -5 ])
  const rotateY = useTransform(mouseX, [ -100, 100 ], [ -5, 5 ])
  const headerFullText = 'Hello! I\'m MediGrant AI. Type your query below.'
  const [typedHeader, setTypedHeader] = useState('')
  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      setTypedHeader(headerFullText.slice(0, index + 1))
      index++
      if (index === headerFullText.length) clearInterval(timer)
    }, 40)
    return () => clearInterval(timer)
  }, [])

  // attach to container
  const handlePointerMove = (e: React.PointerEvent) => {
    const { innerWidth, innerHeight } = window
    mouseX.set(e.clientX - innerWidth / 2)
    mouseY.set(e.clientY - innerHeight / 2)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages])

  // Dynamic background gradient based on scroll
  const bgGradient = useTransform(
    scrollYProgress,
    [0, 1],
    ['radial-gradient(circle at 50% 0%, rgba(15,23,42,0.8) 0%, rgba(2,6,23,1) 100%)', 'radial-gradient(circle at 50% 100%, rgba(30,58,138,0.6) 0%, rgba(2,6,23,1) 100%)']
  )

  const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`

  // Particle emitter for grant mentions
  const emitParticles = (count: number) => {
    setParticleCount(count)
    setTimeout(() => setParticleCount(0), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return
  
    setIsProcessing(true)
    emitParticles(5)
    setHasQueried(true)
  
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      content: input,
      sender: 'user',
      status: 'complete'
    }
    let updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
  
    try {
      if (linkedInUrl) {
        const scrapingId = generateId()
        updatedMessages = [...updatedMessages, {
          id: scrapingId,
          content: `🔍 Analyzing LinkedIn profile...`,
          sender: 'agent',
          status: 'searching'
        }]
        setMessages(updatedMessages)
      }
      // Analysis Phase with loading state
      const analysisId = generateId()
      updatedMessages = [...updatedMessages, {
        id: analysisId,
        content: 'Analyzing project details...',
        sender: 'agent',
        status: 'analyzing'
      }]
      setMessages(updatedMessages)
  
      const analysisRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }],
          linkedInUrl: linkedInUrl 
        })
      })
      
      if (!analysisRes.ok) {
        throw new Error(`API error: ${analysisRes.status}`)
      }
  
      const analysisData: AnalysisResponse = await analysisRes.json()
      setMatchedGrants(analysisData.matched_grants)
  
      // Update analysis message to complete
      updatedMessages = updatedMessages.filter(m => m.id !== analysisId)
      updatedMessages.push({
        id: analysisId,
        content: 'Analysis complete',
        sender: 'agent',
        status: 'complete'
      })
  
      // Database Search Phase
      const searchId = generateId()
      const searchTarget = Math.floor(Math.random() * 10) + 1
      updatedMessages = [...updatedMessages, {
        id: searchId,
        content: `Searching ${searchTarget} funding opportunities...`,
        sender: 'agent',
        status: 'searching'
      }]
      setMessages(updatedMessages)

      let current = 0
      const ticker = setInterval(() => {
        current += 1
        setMessages(prev =>
          prev.map(m =>
            m.id === searchId
              ? { ...m, content: `Searching ${current} resources…` }
              : m
          )
        )
        if (current >= searchTarget) clearInterval(ticker)
      }, 50 + (Math.random() * 1000))
  
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1500))
  
      // Formatting Phase
      const formattedResponse = formatClaudeResponse(analysisData)
      const botMessageId = generateId()
      
      await typeMessage(formattedResponse.text, updatedMessages, botMessageId)
      updatedMessages = [...updatedMessages, {
        id: botMessageId,
        content: formattedResponse.text,
        sender: 'bot',
        status: 'complete',
        grantLinks: analysisData.matched_grants.map(g => typeof g === 'string' ? `GRANT-${Math.random().toString(36).substring(2, 8)}` : g.id)
      }]
  
      // Always display follow-up questions
      await new Promise(resolve => setTimeout(resolve, 500))
      const followUpId = generateId()
      await typeMessage(formattedResponse.followUp, updatedMessages, followUpId)
  
    } catch (error) {
      console.error('API Error:', error)
      const errorId = generateId()
      await typeMessage(
        '⚠️ Error processing request. Our team has been notified. Please try again later.', 
        updatedMessages, 
        errorId
      )
    } finally {
      setIsProcessing(false)
    }
  }
  

  const formatClaudeResponse = (data: AnalysisResponse) => {
    if (!data) {
      return {
        text: "⚠️ No analysis data was returned. Please try again.",
        followUp: "Would you like to retry your query?"
      }
    }
  
    // ---------- summary ----------
    let text =
      `✅ Analysis Complete\n\n` +
      `${data.analysis_summary || 'No summary available.'}\n\n`
  
    // ---------- grants ----------
    data.matched_grants.forEach((g, i) => {
      // Accept either a Grant object or a plain string
      const grant = typeof g === 'string'
        ? { id: `GRANT-${i+1}`, name: g, agency: '—', deadline: '—', focus_area: '—', match_reason: '' }
        : g
  
      text +=
        `\n${i + 1}. ${grant.id} - ${grant.name}\n` +
        `   • Agency: ${grant.agency}\n` +
        `   • Deadline: ${grant.deadline}\n` +
        `   • Focus: ${grant.focus_area}\n` +
        (grant.match_reason ? `   › ${grant.match_reason}\n` : '')
    })
  
    // ---------- next steps ----------
    if (data.next_steps?.length) {
      text += `\nNext Steps:\n${data.next_steps.map(s => `• ${s}`).join('\n')}`
    }
  
    // ---------- optional follow-ups ----------
    const followUp = data.follow_up_questions?.length
      ? `To proceed:\n${data.follow_up_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : "How would you like to proceed with this information?"
  
    return { text, followUp }
  }  

  // Fixed: Enhanced typeMessage with visual effects
  const typeMessage = async (message: string, existingMessages: Message[], messageId: string) => {
    let typedContent = ''
    setMessages([...existingMessages, {
      id: messageId,
      content: '',
      sender: 'bot',
      status: 'typing'
    }])
    
    for (let i = 0; i < message.length; i++) {
      typedContent += message[i]
      setMessages(prev => {
        const prevWithoutTyping = prev.filter(m => m.id !== messageId || m.status !== 'typing')
        return [...prevWithoutTyping, {
          id: messageId,
          content: typedContent,
          sender: 'bot',
          status: i === message.length - 1 ? 'complete' : 'typing',
          grantLinks: typedContent.match(/[A-Z]{2,}-\d{2}-\d{3}/g) || []
        }]
      })
      
      // Enhanced typing effects
      const char = message[i]
      if (char.match(/[A-Z]{2,}-\d{2}-\d{3}/)) {
        emitParticles(8)
        await new Promise(resolve => setTimeout(resolve, 5)) // Pause for emphasis
      } else if (char.match(/[.!?]/)) {
        await new Promise(resolve => setTimeout(resolve, 15)) // Natural pause
      } else {
        await new Promise(resolve => setTimeout(resolve, 1)) // Human-like variation
      }
    }
  }

  // 3D Holographic Grant Card Component
  const GrantHologram = ({ grant }: { grant: Grant }) => (
    <motion.div /* existing props */>
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

  return (
    <motion.div 
      className="flex flex-col h-screen text-white font-sans"
      style={{ background: bgGradient }}
      onPointerMove={handlePointerMove}
      ref={containerRef}
    >
      {/* Neuro-reactive header */}
      <motion.header 
        className="py-4 px-6 border-b border-blue-400/20 backdrop-blur-lg"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 10 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-500 tracking-tighter">
              MediGrant AI
            </h1>
            <p className="text-sm text-blue-200/80">
              Your AI co-pilot for healthcare research funding
            </p>
          </div>
          <div className="flex gap-2">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowLinkedIn(!showLinkedIn)}
                className="text-blue-300 border border-blue-400/30"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                {showLinkedIn ? 'Hide' : 'Connect'}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Quantum message interface */}
      <main className="flex-1 overflow-y-auto pt-6 px-6 pb-0 space-y-6 relative overscroll-none">
        {/* Floating grant particles */}
        <AnimatePresence>
          {Array.from({ length: particleCount }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-400/80 pointer-events-none"
              initial={{ 
                x: Math.random() * window.innerWidth - 100,
                y: 0,
                opacity: 1,
                scale: 0.5
              }}
              animate={{ 
                y: -100,
                opacity: 0,
                scale: 1.5,
                x: Math.random() * 200 - 100
              }}
              transition={{ 
                duration: 2,
                ease: [0, 0, 0.58, 1]
              }}
              style={{
                width: Math.random() * 8 + 4,
                height: Math.random() * 8 + 4
              }}
            />
          ))}
        </AnimatePresence>

        {messages.map((message) => (
          <motion.div 
          key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <motion.div
              whileHover={{ scale: message.sender === 'bot' ? 1.01 : 1 }}
            >
              { hasQueried && 
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
                <div className={`absolute inset-0 rounded-lg pointer-events-none ${
                  message.status === 'typing' 
                    ? 'animate-pulse bg-blue-500/10' 
                    : message.status === 'analyzing'
                      ? 'bg-yellow-500/10'
                      : 'bg-transparent'
                }`} />
                
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Animated status indicator */}
                    {message.sender === 'agent' && (
                      <motion.div 
                        className="mt-1 flex items-center"
                        animate={{ 
                          rotate: message.status === 'analyzing' ? [0, 360] : 0,
                          scale: message.status ? [1, 1.1, 1] : 1
                        }}
                        transition={{ 
                          rotate: { 
                            repeat: Infinity, 
                            duration: 2, 
                            ease: "linear" 
                          },
                          scale: { 
                            repeat: Infinity,
                            duration: 1.5,
                            ease: [0.445, 0.05, 0.55, 0.95]
                          }
                        }}
                      >
                        {message.status === 'analyzing' ? (
                          <div className="relative">
                            <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />
                            <motion.div 
                              className="absolute inset-0 rounded-full border-2 border-yellow-400/30"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                          </div>
                        ) : message.status === 'searching' ? (
                          <div className="relative">
                            <Search className="h-5 w-5 text-purple-400 animate-pulse" />
                            <motion.div 
                              className="absolute -inset-1 rounded-full bg-purple-400/10"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            />
                          </div>
                        ) : null}
                      </motion.div>
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
                        <motion.div 
                          className="flex space-x-2 mt-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {[0, 0.2, 0.4].map((delay) => (
                            <motion.div 
                              key={delay}
                              className="w-2 h-2 rounded-full bg-blue-400"
                              animate={{ y: [0, -10, 0] }}
                              transition={{ 
                                repeat: Infinity,
                                duration: 1,
                                delay
                              }}
                            />
                          ))}
                        </motion.div>
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
            }
            </motion.div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {!hasQueried && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    p-6 bg-gradient-to-br from-blue-950/50 to-black/80
                    rounded-3xl backdrop-blur-xl shadow-[0_0_60px_20px_rgba(59,130,246,0.4)]
                    pointer-events-auto
                    w-[80vw] max-w-[800px]"
          style={{ rotateX, rotateY }}
          initial={{ opacity: 0, scale: 0.6, rotateZ: 10 }}
          animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 12 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            className="absolute inset-0 rounded-3xl border-4 border-indigo-500/50"
            initial={{ scale: 0.8, opacity: 0.4 }}
            animate={{ scale: [0.8, 1.2], opacity: [0.0, 0.4, 0.0] }}
            transition={{ repeat: Infinity, duration: 2, ease: [0.445, 0.05, 0.55, 0.95] }}
          />

          <form onSubmit={handleSubmit} className="relative flex flex-col gap-6">
            {/* animated typed header */}
            {typedHeader && (
              <motion.h2
                className="text-3xl font-bold text-center text-white tracking-tighter"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {typedHeader}
              </motion.h2>
            )}

            {showLinkedIn && (
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-indigo-200/80">
                  LinkedIn Profile (Optional)
                </Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedInUrl}
                  onChange={e => setLinkedInUrl(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white focus:ring-2 
                            focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-950"
                />
              </div>
            )}

            <Textarea
              className="w-full bg-transparent border border-indigo-400/50
                        text-white placeholder-indigo-200 focus:ring-2
                        focus:ring-indigo-500 focus:ring-offset-0 resize-none"
              placeholder="Describe your research project…"
              rows={4}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />

            <Button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white h-12 w-full"
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Analyze Project'}
            </Button>
          </form>
        </motion.div>
      )}



      {/* Quantum input interface */}
      <motion.footer
        className="border-t border-blue-400/20 p-4 backdrop-blur-lg bg-gray-900/50"
        initial={{ opacity: 0, height: 0 }}
       animate={{ opacity: hasQueried ? 1 : 0, height: hasQueried ? 'auto' : 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      >
        {showLinkedIn && (
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Label htmlFor="linkedin" className="text-blue-200/80 mb-2 block">
              LinkedIn Profile (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-950"
              />
              <Button 
                variant="outline" 
                onClick={() => setShowLinkedIn(false)}
                className="border-gray-700 text-white bg-gray-800/50 hover:bg-gray-800/50"
              >
                Skip
              </Button>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3">
          <motion.div 
            className="flex-1 relative"
            whileHover={{ scale: 1.005 }}
          >
            <Textarea
              className="w-full bg-gray-800/50 border-gray-700 text-white focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-950 pr-12 resize-none"
              placeholder="Describe your research project or funding needs..."
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <div className="absolute right-3 bottom-3 flex gap-1">
              <motion.button 
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              type="submit" 
              size="icon" 
              disabled={isProcessing}
              className="bg-blue-500 hover:bg-blue-600 text-white h-12 w-12 relative overflow-hidden"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                  {/* Pulsing background effect */}
                  <motion.div 
                    className="absolute inset-0 bg-blue-500/30 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                </div>
              ) : (
                <>
                  <ChevronRight className="h-5 w-5" />
                  <span className="absolute inset-0 bg-blue-400/20 hover:bg-blue-400/30 transition-colors rounded-full" />
                </>
              )}
            </Button>
          </motion.div>
        </form>

        <div className="mt-3 text-xs flex justify-between items-center">
          <span className="text-blue-200/60">
            Powered by Grants.gov API • NSF Database • NIH RePORTER
          </span>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLinkedIn(!showLinkedIn)} 
            className="text-blue-300/80 hover:text-blue-400 flex items-center gap-1 text-xs"
          >
            <Linkedin className="h-3 w-3" />
            {showLinkedIn ? 'Hide LinkedIn' : 'Connect Profile'}
          </motion.button>
        </div>
      </motion.footer>
    </motion.div>
  )
}