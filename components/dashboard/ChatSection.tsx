'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageItem } from '@/components/dashboard/MessageItem'
import { Message, Grant } from '@/lib/dashboard/types'
import { generateId, typeMessage } from '@/lib/dashboard/utils'
import { Paperclip, Send, Loader2, Linkedin } from 'lucide-react'

type ChatSectionProps = {
  isLoading?: boolean
  onEmitParticles?: (count: number) => void
}

export function ChatSection({ isLoading = false, onEmitParticles }: ChatSectionProps) {
  const [input, setInput] = useState('')
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [showLinkedIn, setShowLinkedIn] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-message',
      content: 'Hello! I\'m MediGrant AI. I can help you find and apply for healthcare research funding. Tell me about your project or what kind of grant you\'re looking for.',
      sender: 'bot',
      status: 'complete',
      linkedGrantData: [],
      followUpQuestions: [
        "What kind of research are you working on?",
        "Are you looking for a specific type of grant?",
        "Tell me about your project's goals."
      ],
      timestamp: new Date()
    }
  ])
  const [matchedGrants, setMatchedGrants] = useState<Grant[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'auto',
      block: 'end',
    })
  }, [messages])

  const emitParticles = (count: number) => {
    if (onEmitParticles) {
      onEmitParticles(count)
    }
  }

  const handleSubmit = async (e: React.FormEvent, followUpQuery?: string) => {
    e.preventDefault()
    const currentQuery = followUpQuery || input
    if (!currentQuery.trim() || isLoading) return
  
    // Add user message to chat
    const userMessage: Message = {
      id: generateId(),
      content: currentQuery,
      sender: 'user',
      status: 'complete',
      timestamp: new Date()
    }
    let updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    if (!followUpQuery) setInput('') // Clear input only if it's not a follow-up click
  
    try {
      // Show analysis in progress message
      const analysisId = generateId()
      updatedMessages = [...updatedMessages, {
        id: analysisId,
        content: 'Analyzing project details...',
        sender: 'agent',
        status: 'analyzing',
        timestamp: new Date()
      }]
      setMessages(updatedMessages)
  
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real implementation, you would call your API here
      // const analysisData = await analyzeQuery(input, {
      //   linkedInUrl: linkedInUrl || undefined,
      //   pdfFile: userProfilePdf || undefined
      // })
      
      // For demo, create a mock response
      const mockResponse = {
        analysis_summary: "Based on your project description, I've found several relevant grants.",
        matched_grants: [
          {
            id: 'grant-demo-1',
            name: 'Healthcare Innovation Research Grant',
            agency: 'National Institutes of Health',
            deadline: '2025-09-15',
            focus_area: 'Innovation',
            description: 'A grant for innovative healthcare research projects.',
          },
          {
            id: 'grant-demo-2',
            name: 'Community Health Improvement Program',
            agency: 'CDC Foundation',
            deadline: '2025-08-30',
            focus_area: 'Community Health',
            description: 'A program to improve community health outcomes.',
          }
        ] as Grant[],
        next_steps: ["Review the grant details", "Prepare your proposal"],
        follow_up_questions: [
          "Would you like more information about any specific grant?",
          "Can you tell me more about your research methodology?",
          "What is your project timeline?"
        ],
        confidence_score: 0.85
      }
      
      // Update analysis message to complete
      updatedMessages = updatedMessages.filter(m => m.id !== analysisId)
      updatedMessages.push({
        id: analysisId,
        content: 'Analysis complete',
        sender: 'agent',
        status: 'complete',
        timestamp: new Date()
      })
      
      // Show searching animation
      const searchId = generateId()
      updatedMessages = [...updatedMessages, {
        id: searchId,
        content: `Searching for funding opportunities...`,
        sender: 'agent',
        status: 'searching',
        timestamp: new Date()
      }]
      setMessages(updatedMessages)

      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Format and display the response
      const formattedResponse = {
        text: `I've analyzed your project and found ${mockResponse.matched_grants.length} relevant grants that match your criteria. The most promising is the ${mockResponse.matched_grants[0].name} from ${mockResponse.matched_grants[0].agency}.`,
      }
      
      const botMessageId = generateId()
      
      // Simulate typing effect
      await typeMessage(formattedResponse.text, updatedMessages, botMessageId, setMessages, emitParticles)
      
      // Add the complete message
      // Find the message added by typeMessage to update it, preserving its timestamp
      const finalBotMessageIndex = updatedMessages.findIndex(m => m.id === botMessageId);
      if (finalBotMessageIndex !== -1) {
        const originalBotMessage = updatedMessages[finalBotMessageIndex];
        updatedMessages[finalBotMessageIndex] = {
          ...originalBotMessage, // Spread original message to keep its timestamp and other props
          id: botMessageId, // Ensure id is correct
          content: formattedResponse.text, // Ensure content is final
          sender: 'bot', // Ensure sender is correct
          status: 'complete', // Ensure status is correct
          linkedGrantData: mockResponse.matched_grants.map(g => ({
            id: g.id,
            name: g.name,
            grant_name: g.grant_name, // grant_name might be undefined if not in mock, that's ok
            agency: g.agency,
            deadline: g.deadline,
            focus_area: g.focus_area
          })),
          followUpQuestions: mockResponse.follow_up_questions
          // timestamp is preserved from originalBotMessage
        };
      } else {
        // Fallback: if message not found (should not happen), create a new one
        updatedMessages = [...updatedMessages.filter(m => m.id !== searchId), {
          id: botMessageId,
          content: formattedResponse.text,
          sender: 'bot',
          status: 'complete',
          linkedGrantData: mockResponse.matched_grants.map(g => ({ 
            id: g.id, 
            name: g.name, 
            grant_name: g.grant_name, 
            agency: g.agency, 
            deadline: g.deadline, 
            focus_area: g.focus_area 
          })),
          followUpQuestions: mockResponse.follow_up_questions,
          timestamp: new Date() // New timestamp as a fallback
        }];
      }
      
      setMessages(updatedMessages)
      setMatchedGrants(mockResponse.matched_grants)
      
    } catch (error) {
      console.error('API Error:', error)
      
      const errorId = generateId()
      await typeMessage(
        `⚠️ ${error instanceof Error ? error.message : 'Error processing request. Please try again later.'}`, 
        updatedMessages, 
        errorId,
        setMessages,
        emitParticles
      )
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file?.type === 'application/pdf') {
      const uploadingId = generateId()
      setMessages(prev => ([
        ...prev,
        { id: uploadingId, content: `PDF uploaded: ${file.name}. It will be analyzed along with your next query.`, sender: 'agent', status: 'complete', timestamp: new Date() }
      ]))
    }
  }

  const handleFollowUpClick = (question: string) => {
    console.log('Follow-up question:', question)
    // setInput(question) // Optional: set input field with the question
    handleSubmit(new Event('submit') as unknown as React.FormEvent, question)
  }

  return (
    <Card className="flex flex-col h-full bg-gray-800/50 border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">MediGrant AI Assistant</h2>
        <p className="text-sm text-gray-400">Ask questions about grants or get help with your proposals</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <MessageItem 
            key={message.id} 
            message={message} 
            matchedGrants={matchedGrants}
            emitParticles={emitParticles}
            hasQueried={true}
            onFollowUpClick={handleFollowUpClick}
            isLoading={isLoading}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {showLinkedIn && (
          <div className="mb-4">
            <Input
              type="url"
              placeholder="LinkedIn Profile URL (Optional)"
              className="w-full bg-gray-900/70 border-gray-700 text-white focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-950 mb-2"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            type="text"
            placeholder="Ask about healthcare research grants..."
            className="flex-1 bg-gray-900/70 border-gray-700 text-white focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-950"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          
          <Button 
            type="button" 
            variant="outline"
            className="border-gray-700 text-gray-300 bg-gray-900/70 hover:bg-gray-800"
            onClick={handleFileSelect}
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Button 
            type="button" 
            variant="outline"
            className="border-gray-700 text-gray-300 bg-gray-900/70 hover:bg-gray-800"
            onClick={() => setShowLinkedIn(!showLinkedIn)}
            disabled={isLoading}
            title="Add LinkedIn Profile"
          >
            <Linkedin className="h-4 w-4" />
          </Button>
          
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  )
}
