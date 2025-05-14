'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { motion } from 'framer-motion'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

import { Message, Grant, AnalysisResponse } from '@/lib/dashboard/types'
import { generateId, typeMessage, formatClaudeResponse } from '@/lib/dashboard/utils'
import { analyzeQuery } from '@/lib/dashboard/apiService'
import { useApiState } from '@/hooks/useApiState'

export default function Dashboard() {
  
  // Chat state
  const [input, setInput] = useState('')
  const [userProfilePdf, setUserProfilePdf] = useState<File | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showLinkedIn, setShowLinkedIn] = useState(false)
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const analysisState = useApiState<AnalysisResponse>(null)
  const [hasQueried, setHasQueried] = useState(false)
  const [particleCount, setParticleCount] = useState(0)
  const [matchedGrants, setMatchedGrants] = useState<Grant[]>([
    {
      id: 'grant-1',
      title: 'Innovative Approaches to Cancer Treatment Research',
      funder: 'National Institutes of Health',
      amount: 500000,
      deadline: '2025-08-15',
      tags: ['Cancer', 'Treatment', 'Innovation']
    },
    {
      id: 'grant-2',
      title: 'Mental Health in Underserved Communities',
      funder: 'CDC Foundation',
      amount: 350000,
      deadline: '2025-07-30',
      tags: ['Mental Health', 'Community']
    },
    {
      id: 'grant-3',
      title: 'Emerging Infectious Disease Preparedness',
      funder: 'Gates Foundation',
      amount: 750000,
      deadline: '2025-09-10',
      tags: ['Infectious Disease', 'Preparedness']
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const headerFullText = 'Hello! I\'m MediGrant AI. Type your query below.'
  const [typedHeader, setTypedHeader] = useState('')
  
  // Sample keyword suggestions for proposal editor
  const keywordSuggestions = [
    { keyword: 'Evidence-based', relevance: 95, used: true },
    { keyword: 'Patient-centered', relevance: 85, used: false },
    { keyword: 'Interdisciplinary', relevance: 80, used: true },
    { keyword: 'Innovative methodology', relevance: 75, used: false },
    { keyword: 'Health disparities', relevance: 70, used: true },
    { keyword: 'Translational research', relevance: 65, used: false },
    { keyword: 'Community engagement', relevance: 60, used: false },
    { keyword: 'Cost-effective', relevance: 55, used: true }
  ]
  
  // Typing effect for header
  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex <= headerFullText.length) {
        setTypedHeader(headerFullText.slice(0, currentIndex))
        currentIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, 15);
    
    return () => clearInterval(intervalId);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages])

  const emitParticles = (count: number) => {
    const safeCount = Math.min(count, 5);
    setParticleCount(safeCount);
    setTimeout(() => setParticleCount(0), 1000);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || analysisState.isLoading) return
  
    analysisState.startLoading()
    emitParticles(5)
    setHasQueried(true)
  
    // Add user message to chat
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
      // Show LinkedIn analysis message if URL is provided
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
      
      // Show analysis in progress message
      const analysisId = generateId()
      updatedMessages = [...updatedMessages, {
        id: analysisId,
        content: 'Analyzing project details...',
        sender: 'agent',
        status: 'analyzing'
      }]
      setMessages(updatedMessages)
  
      // Call API service to analyze the query with optional PDF
      const analysisData = await analyzeQuery(input, {
        linkedInUrl: linkedInUrl || undefined,
        pdfFile: userProfilePdf || undefined
      })
      analysisState.setData(analysisData)
      setMatchedGrants(analysisData.matched_grants as Grant[])
  
      // Update analysis message to complete
      updatedMessages = updatedMessages.filter(m => m.id !== analysisId)
      updatedMessages.push({
        id: analysisId,
        content: 'Analysis complete',
        sender: 'agent',
        status: 'complete'
      })
  
      // Show searching animation
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
  
      await new Promise(resolve => setTimeout(resolve, 1500))
  
      // Format and display the response
      const formattedResponse = formatClaudeResponse(analysisData)
      const botMessageId = generateId()
      
      await typeMessage(formattedResponse.text, updatedMessages, botMessageId, setMessages, emitParticles)
      updatedMessages = [...updatedMessages, {
        id: botMessageId,
        content: formattedResponse.text,
        sender: 'bot',
        status: 'complete',
        grantLinks: analysisData.matched_grants.map(g => typeof g === 'string' ? `GRANT-${Math.random().toString(36).substring(2, 8)}` : g.id)
      }]
  
      await new Promise(resolve => setTimeout(resolve, 500))
      const followUpId = generateId()
      await typeMessage(formattedResponse.followUp, updatedMessages, followUpId, setMessages, emitParticles)
  
    } catch (error) {
      // Handle errors
      console.error('API Error:', error)
      analysisState.setError(error instanceof Error ? error : new Error('Unknown error'))
      
      const errorId = generateId()
      await typeMessage(
        `⚠️ ${error instanceof Error ? error.message : 'Error processing request. Our team has been notified. Please try again later.'}`, 
        updatedMessages, 
        errorId,
        setMessages,
        emitParticles
      )
    }
  }

  // PDF upload handler
  const handlePdfSelect = async (file: File) => {
    // Store the PDF file for later use with the query
    setUserProfilePdf(file);
    
    // Post system message
    const uploadingId = generateId();
    setMessages(prev => ([
      ...prev,
      { id: uploadingId, content: 'PDF uploaded successfully. It will be analyzed along with your next query.', sender: 'agent', status: 'complete' }
    ]));
  };
  
  // For the dashboard co-pilot section
  const handleAnalyze = async (text: string) => {
    if (!text.trim() || analysisState.isLoading) return
    
    // Set input and trigger the chat submission
    setInput(text)
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <motion.div 
      className="flex h-screen text-white font-sans"
      style={{ 
        background: 'linear-gradient(to bottom, #0f172a, #020617)',
        backgroundAttachment: 'fixed'
      }}
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Suspense fallback={<div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-blue-900/30"></div>}>
        <Sidebar />
      </Suspense>
      
      <div className="flex-1 flex flex-col overflow-hidden pl-64">
        {/* Header */}
        <div className="p-6 border-b border-blue-900/30">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">MediGrant AI Assistant</h1>
              <p className="text-gray-400 mt-1">Ask questions about grants or get help with your proposals</p>
            </div>
          </div>
        </div>
        
        {/* Main Content Area wrapped in Suspense */}
        <Suspense fallback={<div className="flex-1 overflow-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-800/50 rounded"></div>
            <div className="h-24 bg-gray-800/50 rounded"></div>
            <div className="h-24 bg-gray-800/50 rounded"></div>
          </div>
        </div>}>
          <DashboardContent
            messages={messages}
            matchedGrants={matchedGrants}
            particleCount={particleCount}
            hasQueried={hasQueried}
            emitParticles={emitParticles}
            input={input}
            setInput={setInput}
            linkedInUrl={linkedInUrl}
            setLinkedInUrl={setLinkedInUrl}
            showLinkedIn={showLinkedIn}
            setShowLinkedIn={setShowLinkedIn}
            analysisIsLoading={analysisState.isLoading}
            handleSubmit={handleSubmit}
            typedHeader={typedHeader}
            onPdfSelect={handlePdfSelect}
            handleAnalyze={handleAnalyze}
            keywordSuggestions={keywordSuggestions}
          />
        </Suspense>
      </div>
    </motion.div>
  )
}
