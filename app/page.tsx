'use client'

import { useState, useEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronRight, Loader2, Linkedin, Search, Sparkles } from 'lucide-react'

type Message = {
  id: string
  content: string
  sender: 'user' | 'bot' | 'agent'
  status?: 'typing' | 'searching' | 'analyzing' | 'complete'
}

export default function Component() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-message',
      content: 'Hello! I\'m MediGrant AI. I can help you find and apply for healthcare research funding. Tell me about your project or what kind of grant you\'re looking for.',
      sender: 'bot',
      status: 'complete'
    }
  ])
  const [showLinkedIn, setShowLinkedIn] = useState(false)
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`

  const addAgentMessage = async (content: string, status: Message['status'], existingMessages: Message[]) => {
    const agentMessageId = generateId()
    const agentMessage: Message = {
      id: agentMessageId,
      content,
      sender: 'agent',
      status
    }
    
    setMessages([...existingMessages, agentMessage])
    await new Promise(resolve => setTimeout(resolve, 5000)) // Minimum processing time
    return agentMessageId
  }

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
          status: i === message.length - 1 ? 'complete' : 'typing'
        }]
      })
      await new Promise(resolve => setTimeout(resolve, 5))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)

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

    // Add initial agent analysis message
    const analysisMessageId = await addAgentMessage(
      'Analyzing your project details...', 
      'analyzing',
      updatedMessages
    )
    updatedMessages = [...updatedMessages, {
      id: analysisMessageId,
      content: 'Analyzing your project details...',
      sender: 'agent',
      status: 'complete'
    }]

    // Add database search message
    const searchMessageId = await addAgentMessage(
      'Searching funding databases...', 
      'searching',
      updatedMessages
    )
    updatedMessages = [...updatedMessages, {
      id: searchMessageId,
      content: 'Searching funding databases...',
      sender: 'agent',
      status: 'complete'
    }]

    // Add initial bot response
    const response = generateResponse(input)
    const botMessageId = generateId()
    await typeMessage(response.text, updatedMessages, botMessageId)

    // Add follow-up after delay if exists
    if (response.followUp) {
      await new Promise(resolve => setTimeout(resolve, 5000))
      const followUpId = generateId()
      await typeMessage(response.followUp, [...updatedMessages, {
        id: botMessageId,
        content: response.text,
        sender: 'bot',
        status: 'complete'
      }], followUpId)
    }

    setIsProcessing(false)
  }

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
    <div className="flex flex-col h-screen bg-gray-950 text-white font-sans">
      <header className="py-4 px-6 border-b border-blue-400 border-opacity-20">
        <h1 className="text-4xl font-bold text-white tracking-tighter">MediGrant AI</h1>
        <p className="text-sm text-gray-400">
          Your AI co-pilot for healthcare research funding
        </p>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-950 to-gray-950/80">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Card 
              className={`max-w-3xl backdrop-blur-md ${
                message.sender === 'user' 
                  ? 'bg-blue-400/20 border-blue-400 shadow-blue-400/10' 
                  : message.sender === 'agent'
                    ? 'bg-purple-500/10 border-purple-400 shadow-purple-400/10'
                    : 'bg-gray-950/60 border-blue-400'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  {message.sender === 'agent' && message.status === 'analyzing' && (
                    <div className="pt-1">
                      <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  )}
                  {message.sender === 'agent' && message.status === 'searching' && (
                    <div className="pt-1">
                      <Search className="h-4 w-4 text-purple-400 animate-pulse" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="whitespace-pre-line text-white">
                      {message.content}
                    </div>
                    {message.status === 'typing' && (
                      <div className="flex space-x-2 mt-2">
                        {[0, 0.2, 0.4].map((delay) => (
                          <div 
                            key={delay}
                            className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                            style={{ animationDelay: `${delay}s` }}
                          />
                        ))}
                      </div>
                    )}
                    {message.sender === 'agent' && message.status === 'analyzing' && (
                      <div className="flex items-center gap-2 mt-2 text-yellow-300 text-sm">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Reviewing project details and research objectives...</span>
                      </div>
                    )}
                    {message.sender === 'agent' && message.status === 'searching' && (
                      <div className="flex items-center gap-2 mt-2 text-purple-300 text-sm">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Querying NIH RePORTER, Grants.gov, and Foundation Directory...</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="border-t border-blue-400/20 p-4 backdrop-blur-md bg-gray-950/70">
        {showLinkedIn && (
          <div className="mb-4">
            <Label htmlFor="linkedin" className="text-gray-400">
              LinkedIn Profile (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                className="focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent bg-gray-400/10 border-gray-400 text-white outline-none shadow-[0_0_0_1px] shadow-gray-400"
              />
              <Button 
                variant="outline" 
                onClick={() => setShowLinkedIn(false)}
                className="border-gray-400 text-white"
              >
                Skip
              </Button>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            className="flex-1 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent bg-gray-400/10 border-gray-400 text-white outline-none shadow-[0_0_0_1px] shadow-gray-400"
            placeholder="Tell me about your project or funding needs..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isProcessing}
            className="bg-blue-400 text-gray-950 hover:bg-blue-500"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ChevronRight />
            )}
          </Button>
        </form>
        <div className="mt-2 text-xs flex justify-between">
          <span className="text-gray-400">
            MediGrant AI uses the Grants.gov API and other funding databases
          </span>
          <button 
            onClick={() => setShowLinkedIn(!showLinkedIn)} 
            className="flex items-center gap-1 text-blue-400"
          >
            <Linkedin className="h-3 w-3" />
            {showLinkedIn ? 'Hide LinkedIn' : 'Connect LinkedIn'}
          </button>
        </div>
      </footer>
    </div>
  )
}