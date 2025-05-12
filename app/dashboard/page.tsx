'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

import { Header } from '@/components/dashboard/Header'
import { Footer } from '@/components/dashboard/Footer'
import { MessageItem } from '@/components/dashboard/MessageItem'
import { ParticleEffects } from '@/components/dashboard/ParticleEffects'
import { WelcomeForm } from '@/components/dashboard/WelcomeForm'

import { Message, Grant, AnalysisResponse } from '@/components/dashboard/types'
import { generateId, typeMessage, formatClaudeResponse } from '@/components/dashboard/utils'

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
  const headerFullText = 'Hello! I\'m MediGrant AI. Type your query below.'
  const [typedHeader, setTypedHeader] = useState('')
  
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
    if (!input.trim() || isProcessing) return
  
    setIsProcessing(true)
    emitParticles(5)
    setHasQueried(true)
  
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
  
      updatedMessages = updatedMessages.filter(m => m.id !== analysisId)
      updatedMessages.push({
        id: analysisId,
        content: 'Analysis complete',
        sender: 'agent',
        status: 'complete'
      })
  
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
      console.error('API Error:', error)
      const errorId = generateId()
      await typeMessage(
        '⚠️ Error processing request. Our team has been notified. Please try again later.', 
        updatedMessages, 
        errorId,
        setMessages,
        emitParticles
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div 
      className="flex flex-col h-screen text-white font-sans"
      style={{ 
        background: 'radial-gradient(circle at 50% 0%, rgba(15,23,42,0.8) 0%, rgba(2,6,23,1) 100%)',
        willChange: 'transform' 
      }}
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Header 
        showLinkedIn={showLinkedIn}
        setShowLinkedIn={setShowLinkedIn}
      />

      <main className="flex-1 overflow-y-auto pt-6 px-6 pb-0 space-y-6 relative overscroll-none">
        <ParticleEffects particleCount={particleCount} />
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            matchedGrants={matchedGrants}
            emitParticles={emitParticles}
            hasQueried={hasQueried}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      {!hasQueried && (
        <WelcomeForm
          input={input}
          setInput={setInput}
          linkedInUrl={linkedInUrl}
          setLinkedInUrl={setLinkedInUrl}
          showLinkedIn={showLinkedIn}
          setShowLinkedIn={setShowLinkedIn}
          isProcessing={isProcessing}
          handleSubmit={handleSubmit}
          typedHeader={typedHeader}
        />
      )}

      {hasQueried && (
        <Footer
          hasQueried={hasQueried}
          showLinkedIn={showLinkedIn}
          setShowLinkedIn={setShowLinkedIn}
          linkedInUrl={linkedInUrl}
          setLinkedInUrl={setLinkedInUrl}
          handleSubmit={handleSubmit}
        />
      )}
    </motion.div>
  )
}
