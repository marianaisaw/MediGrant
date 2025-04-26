'use client'

import { useState, useEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronRight, Loader2, Linkedin, Search, Sparkles } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion'
import { useTheme } from 'next-themes'

type Message = {
  id: string
  content: string
  sender: 'user' | 'bot' | 'agent'
  status?: 'typing' | 'searching' | 'analyzing' | 'complete'
  grantLinks?: string[]
}

type Grant = {
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
  matched_grants: Grant[]
  next_steps: string[]
  follow_up_questions: string[]
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
  const [matchedGrants, setMatchedGrants] = useState<Grant[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    container: containerRef
  })
  const { theme } = useTheme()
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
          messages: [
            { role: 'user', content: input }
          ]
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
      const searchTarget = Math.floor(Math.random() * 16) + 5
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
      }, 50 + (Math.random() * 100))
  
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
        grantLinks: analysisData.matched_grants.map(g => g.id)
      }]
  
      if (formattedResponse.followUp) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const followUpId = generateId()
        await typeMessage(formattedResponse.followUp, updatedMessages, followUpId)
      }
  
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
    let text = `✅ Analysis Complete (${data.confidence_score}/100 confidence)\n\n`
    text += `${data.analysis_summary}\n\n🏆 Top Matches:\n`
    
    data.matched_grants.forEach((grant, index) => {
      text += `\n${index + 1}. ${grant.id} - ${grant.name}\n`
      text += `   • Agency: ${grant.agency}\n`
      text += `   • Deadline: ${grant.deadline}\n`
      text += `   • Focus: ${grant.focus_area}\n`
      text += `   › ${grant.match_reason}\n`
    })
  
    text += `\nNext Steps:\n${data.next_steps.map(s => `• ${s}`).join('\n')}`
    
    const followUp = `To proceed, please:\n${data.follow_up_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
  
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

  // Fixed: Implement addAgentMessage
  const addAgentMessage = async (content: string, status: Message['status'], existingMessages: Message[]) => {
    const agentMessageId = generateId()
    const agentMessage: Message = {
      id: agentMessageId,
      content,
      sender: 'agent',
      status
    }
    
    setMessages([...existingMessages, agentMessage])
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 2000)) // Variable processing time
    return agentMessageId
  }

  // 3D Holographic Grant Card Component
  const GrantHologram = ({ grant }: { grant: Grant }) => (
    <motion.div /* existing props */>
      <Card className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/20 border border-blue-400/30 backdrop-blur-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-mono text-lg font-bold text-blue-300">
              {grant.id}
            </h3>
            <p className="text-sm text-blue-100">
              {grant.name.includes('Loading') ? (
                <span className="animate-pulse">Loading grant details...</span>
              ) : (
                grant.name
              )}
            </p>
            <div className="mt-2 text-xs space-y-1">
              <p>🏛️ {grant.agency}</p>
              <p>📅 {grant.deadline}</p>
              <p>🎯 {grant.focus_area}</p>
            </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const generateResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase()
    let text = ''
    let followUp = ''

    if (lowerInput.includes('nih') || lowerInput.includes('stem cell')) {
      text = `✅ Analysis complete. Here are tailored NIH opportunities for stem cell research:\n\n` +
        `🔬 **RFA-HL-25-001**: Stem Cell Therapies for Heart Disease\n` +
        `   • Deadline: November 15, 2024\n` +
        `   • Focus: Translational research\n` +
        `   • Budget: Up to $500k/year\n\n` +
        `🧫 **PAR-23-123**: Basic Stem Cell Differentiation\n` +
        `   • Rolling submissions\n` +
        `   • Ideal for early-stage projects\n\n` +
        `I've prepared a draft Specific Aims page for your review.`
      followUp = `Would you like me to:\n` +
        `1. Show the draft Specific Aims page\n` +
        `2. Help with budget justification\n` +
        `3. Find collaborators in this field\n` +
        `4. Set up deadline reminders?`
    } else if (lowerInput.includes('sbir') || lowerInput.includes('sttr')) {
      text = `✅ Analysis complete. Relevant SBIR/STTR opportunities:\n\n` +
        `💡 **NIH SBIR R43/R44**: Phase I/II grants\n` +
        `   • Next deadline: June 5, 2024\n` +
        `   • Commercial focus required\n\n` +
        `⚙️ **NSF SBIR**: Technology development\n` +
        `   • Quarterly deadlines\n` +
        `   • Strong IP position preferred\n\n` +
        `I can help structure your: \n` +
        `• Commercialization plan\n` +
        `• Technical approach\n` +
        `• Budget justification`
      followUp = `Which aspect would you like to focus on first?`
    } else {
      text = `✅ Analysis complete. Recommended search strategy:\n\n` +
        `1. Grants.gov database (all federal opportunities)\n` +
        `2. Foundation Directory Online (private funders)\n` +
        `3. Institutional research development offices\n\n` +
        `To refine my search, could you share:\n` +
        `• Project phase (basic/translational/clinical)\n` +
        `• Required budget range\n` +
        `• Any preliminary data?`
      followUp = `Should I start with federal grants or private foundations?`
    }

    return { text, followUp }
  }

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
                ease: "easeOut"
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
                            ease: "easeInOut"
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
                              key={i} 
                              className="font-mono text-blue-300 bg-blue-900/30 px-1 py-0.5 rounded hover:bg-blue-800/40 cursor-pointer transition-colors"
                              onClick={() => emitParticles(12)}
                            >
                              {part}
                            </span>
                          ) : (
                            part
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
                            const fullGrant = matchedGrants.find(g => g.id === grantId)
                            return fullGrant ? (
                              <GrantHologram key={grantId} grant={fullGrant} />
                            ) : (
                              <GrantHologram key={grantId} grant={{
                                id: grantId,
                                name: 'Loading grant details...',
                                agency: 'Unknown',
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
        <>
        <h2 className="text-center text-4xl font-semibold text-white mb-[12em] tracking-tight">
            {typedHeader}
            {/* 2. Blinking cursor */}
            {typedHeader.length < headerFullText.length && (
              <span className="inline-block w-[1ch] h-8 bg-white ml-1 animate-pulse" />
            )}
          </h2>
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
          {/* pulsing neon ring behind */}
          <motion.div
            className="absolute inset-0 rounded-3xl border-4 border-indigo-500/50"
            initial={{ scale: 0.8, opacity: 0.4 }}
            animate={{ scale: [0.8, 1.2], opacity: [0.0, 0.4, 0.0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />

          <form onSubmit={handleSubmit} className="relative flex gap-3">
            <Textarea
              className="w-full bg-transparent border border-indigo-400/50
                         text-white placeholder-indigo-200 focus:ring-2
                         focus:ring-indigo-500 focus:ring-offset-0 resize-none"
              placeholder="Describe your research project…"
              rows={2}
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
              size="icon"
              className="bg-indigo-500 hover:bg-indigo-600 text-white h-12 w-12"
              disabled={isProcessing}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </form>
        </motion.div>
        </>
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
                className="border-gray-700 text-white hover:bg-gray-800/50"
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