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
  const [matchedGrants, setMatchedGrants] = useState<Grant[]>([])
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
      status: 'complete',
      timestamp: new Date()
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
          status: 'searching',
          timestamp: new Date()
        }]
        setMessages(updatedMessages)
      }
      
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
  
      // Call API service to analyze the query with optional PDF
      const analysisData = await analyzeQuery(input, {
        linkedInUrl: linkedInUrl || undefined,
        pdfFile: userProfilePdf || undefined
      })
      analysisState.setData(analysisData)
      setMatchedGrants([])

      if (analysisData.matched_grants?.length) {
        // update state
        setMatchedGrants(analysisData.matched_grants as Grant[])

        // send a dedicated message so DashboardContent can render cards immediately
        const listId = generateId()
        const grantsForMessage = (analysisData.matched_grants as Grant[]) || [];
        setMessages(prev => [
          ...prev,
          {
            id: listId,
            sender: 'agent',
            status: 'complete',
            content: 'I found these funding opportunities for you:',
            linkedGrantData: grantsForMessage.map(g => ({
              id: g.id,
              name: g.name || g.grant_name,
              grant_name: g.grant_name,
              agency: g.agency,
              deadline: g.deadline,
              focus_area: g.focus_area
            })),
            timestamp: new Date()
          }
        ])
      } else {
        // no grants found
        const noneId = generateId()
        setMessages(prev => [
          ...prev,
          { 
            id: noneId, 
            sender: 'agent', 
            status: 'complete',
            content: '⚠️ Sorry, I couldn’t find any grants matching your query.',
            timestamp: new Date()
          }
        ])
      }

  
      // Update analysis message to complete
      updatedMessages = updatedMessages.filter(m => m.id !== analysisId)
      const originalAnalysisMessage = messages.find(m => m.id === analysisId);
      updatedMessages.push({
        id: analysisId,
        content: 'Analysis complete',
        sender: 'agent',
        status: 'complete',
        timestamp: originalAnalysisMessage?.timestamp || new Date()
      })
  
      // Show searching animation
      if (analysisData.matched_grants?.length) {
        const searchId = generateId()
        const searchTarget = 5
        updatedMessages = [...updatedMessages, {
          id: searchId,
          content: `Searching ${searchTarget} funding opportunities...`,
          sender: 'agent',
          status: 'searching',
          timestamp: new Date()
        }]
        setMessages(updatedMessages)

        let current = 0
        const ticker = setInterval(() => {
          current += 1
          setMessages(prev =>
            prev.map(m =>
              m.id === searchId
                ? { ...m, content: `Searching ${current} resources…`, timestamp: m.timestamp || new Date() }
                : m
            )
          )
          if (current >= searchTarget) clearInterval(ticker)
        }, 50 + (Math.random() * 1000))
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
  
      // Format and display the response
      const formattedResponse = formatClaudeResponse(analysisData)
      const botMessageId = generateId()
      
      await typeMessage(formattedResponse.text, updatedMessages, botMessageId, setMessages, emitParticles)
      
      // Update the message to include grantLinks and followUpQuestions
      updatedMessages = updatedMessages.map(msg => 
        msg.id === botMessageId 
          ? { 
              ...msg, 
              content: formattedResponse.text, // Ensure content is set after typing
              status: 'complete', 
              linkedGrantData: (analysisData.matched_grants as Grant[])?.map(g => ({
                id: g.id,
                name: g.name || g.grant_name,
                grant_name: g.grant_name,
                agency: g.agency,
                deadline: g.deadline,
                focus_area: g.focus_area
              })),
              followUpQuestions: formattedResponse.followUpQuestions, // Add follow-up questions here
              timestamp: msg.timestamp || new Date()
            } 
          : msg
      );

      // If the typing message wasn't already replaced by typeMessage's completion,
      // ensure we add the complete message if it wasn't found and updated above.
      if (!updatedMessages.find(msg => msg.id === botMessageId && msg.status === 'complete')) {
        updatedMessages = [...updatedMessages.filter(m => m.id !== botMessageId), { // Remove any lingering typing message
          id: botMessageId,
          content: formattedResponse.text,
          sender: 'bot',
          status: 'complete',
          linkedGrantData: (analysisData.matched_grants as Grant[])?.map(g => ({
            id: g.id,
            name: g.name || g.grant_name,
            grant_name: g.grant_name,
            agency: g.agency,
            deadline: g.deadline,
            focus_area: g.focus_area
          })),
          followUpQuestions: formattedResponse.followUpQuestions,
          timestamp: new Date()
        }];
      }
      
      setMessages(updatedMessages)
  
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

  const handleFollowUpSubmit = async (question: string) => {
    if (!question.trim() || analysisState.isLoading) return
  
    analysisState.startLoading()
    emitParticles(3) // Slightly fewer particles for follow-ups
    setHasQueried(true) // Ensure this is true for subsequent displays
  
    // Add user message (the follow-up question) to chat
    const userMessage: Message = {
      id: generateId(),
      content: question,
      sender: 'user',
      status: 'complete',
      timestamp: new Date()
    }
    let updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    // Do NOT clear the main input (setInput('')) here, as it's a follow-up
  
    try {
      // LinkedIn analysis might not be relevant for follow-ups unless explicitly designed
      // if (linkedInUrl) { ... }
      
      // Show analysis in progress message
      const analysisId = generateId()
      updatedMessages = [...updatedMessages, {
        id: analysisId,
        content: 'Analyzing follow-up question...',
        sender: 'agent',
        status: 'analyzing',
        timestamp: new Date()
      }]
      setMessages(updatedMessages)
  
      // Call API service to analyze the query with optional PDF
      // For follow-ups, we might pass existing context or just the new question.
      // Assuming analyzeQuery can handle follow-up context or is general enough.
      const analysisData = await analyzeQuery(question, {
        // linkedInUrl: linkedInUrl || undefined, // Decide if these are needed for follow-ups
        // pdfFile: userProfilePdf || undefined
      })
      // analysisState.setData(analysisData) // This is handled below after formatting
      setMatchedGrants([]) // Reset or append based on follow-up logic

      if (analysisData.matched_grants?.length) {
        setMatchedGrants(prevGrants => [...prevGrants, ...(analysisData.matched_grants as Grant[])]); // Append or replace as needed

        const listId = generateId()
        setMessages(prev => [
          ...prev,
          {
            id: listId,
            sender: 'agent',
            status: 'complete',
            content: 'Based on your follow-up, here are some more funding opportunities:',
            linkedGrantData: (analysisData.matched_grants as Grant[])?.map(g => ({
              id: g.id,
              name: g.name || g.grant_name,
              grant_name: g.grant_name,
              agency: g.agency,
              deadline: g.deadline,
              focus_area: g.focus_area
            })),
            timestamp: new Date()
          }
        ])
      } else {
        const noneId = generateId()
        setMessages(prev => [
          ...prev,
          { 
            id: noneId, 
            sender: 'agent', 
            status: 'complete',
            content: '⚠️ Sorry, I couldn’t find further grants based on your follow-up.',
            timestamp: new Date()
          }
        ])
      }
  
      updatedMessages = updatedMessages.filter(m => m.id !== analysisId)
      updatedMessages.push({
        id: analysisId, // Reuse or new id for clarity
        content: 'Follow-up analysis complete',
        sender: 'agent',
        status: 'complete',
        timestamp: new Date()
      })
      
      // Optional: Searching animation for follow-ups if new grants are expected
      // if (analysisData.matched_grants?.length) { ... }
  
      const formattedResponse = formatClaudeResponse(analysisData)
      const botMessageId = generateId()
      
      // Use a temporary array for typeMessage to build upon
      const tempMessagesForTyping = [...updatedMessages]; // This is not strictly needed if typeMessage handles it internally
      await typeMessage(formattedResponse.text, tempMessagesForTyping, botMessageId, setMessages, emitParticles)
      
      // Ensure the final message from typing is correctly updated with followUpQuestions
      // The 'updatedMessages' variable might be stale here if 'typeMessage' directly called 'setMessages'.
      // It's safer to update based on the current 'messages' state or ensure typeMessage returns the final array.
      // For now, assuming typeMessage's final call to setMessages has updated the 'messages' state.
      setMessages(prevMessages => prevMessages.map(msg => 
        msg.id === botMessageId 
          ? { 
              ...msg, 
              content: formattedResponse.text, 
              status: 'complete', 
              linkedGrantData: (analysisData.matched_grants as Grant[])?.map(g => ({
                id: g.id,
                name: g.name || g.grant_name,
                grant_name: g.grant_name,
                agency: g.agency,
                deadline: g.deadline,
                focus_area: g.focus_area
              })),
              followUpQuestions: formattedResponse.followUpQuestions,
              timestamp: msg.timestamp || new Date()
            } 
          : msg
      ));
      analysisState.setData(analysisData); // Signal loading complete & provide data

    } catch (error) {
      console.error('Follow-up API Error:', error)
      const errorId = generateId()
      // Similarly, ensure errorMessages reflects the state before typing the error message.
      // Direct pass of setMessages to typeMessage is preferred.
      await typeMessage(
        `⚠️ Error processing follow-up: ${error instanceof Error ? error.message : 'Please try again.'}`,
        messages, // Pass current messages state for typeMessage to build upon
        errorId,
        setMessages, // Pass setMessages directly
        emitParticles
      )
      analysisState.setError(error instanceof Error ? error : new Error(String(error)));
    } 
    // No finally block for analysisState.isLoading = false, as setData/setError in useApiState should handle it.
  }

  const handlePdfSelect = (file: File) => {
    setUserProfilePdf(file)
    const pdfMessage: Message = {
      id: generateId(),
      content: `📄 PDF "${file.name}" selected. I'll use this in the next analysis.`,
      sender: 'agent',
      status: 'complete',
      timestamp: new Date()
    }
    setMessages(prevMessages => [...prevMessages, pdfMessage])
  };

  const handleAnalyze = async (text: string) => {
    if (!text.trim() || analysisState.isLoading) return;
    
    analysisState.startLoading();
    emitParticles(5);
    setHasQueried(true); // Assuming any analysis counts as a query

    const userQueryMessage: Message = {
      id: generateId(),
      content: text,
      sender: 'user',
      status: 'complete',
      timestamp: new Date()
    };
    let updatedMessages = [...messages, userQueryMessage];
    setMessages(updatedMessages);

    const analysisAgentMessageId = generateId();
    updatedMessages = [...updatedMessages, {
      id: analysisAgentMessageId,
      content: 'Analyzing your document for insights...', 
      sender: 'agent', 
      status: 'analyzing',
      timestamp: new Date()
    }];
    setMessages(updatedMessages);

    try {
      const analysisData = await analyzeQuery(text, { pdfText: text }); // Assuming analyzeQuery can handle text directly
      analysisState.setData(analysisData);
      setMatchedGrants([]); // Clear previous matches if any

      if (analysisData.matched_grants?.length) {
        setMatchedGrants(analysisData.matched_grants as Grant[]);
        const listId = generateId();
        const grantsForMessage = (analysisData.matched_grants as Grant[]) || [];
        setMessages(prev => [
          ...prev,
          {
            id: listId,
            sender: 'agent',
            status: 'complete',
            content: 'Based on the document, I found these funding opportunities:',
            linkedGrantData: grantsForMessage.map(g => ({
              id: g.id,
              name: g.name || g.grant_name,
              grant_name: g.grant_name,
              agency: g.agency,
              deadline: g.deadline,
              focus_area: g.focus_area
            })),
            timestamp: new Date()
          }
        ]);
      } else {
        const noneId = generateId();
        setMessages(prev => [
          ...prev,
          {
            id: noneId,
            sender: 'agent',
            status: 'complete',
            content: '⚠️ Sorry, I couldn’t find any grants based on the document analysis.',
            timestamp: new Date()
          }
        ]);
      }

      // Update analysis agent message to complete
      updatedMessages = updatedMessages.filter(m => m.id !== analysisAgentMessageId);
      const originalDocAnalysisMessage = messages.find(m => m.id === analysisAgentMessageId);
      updatedMessages.push({
        id: analysisAgentMessageId,
        content: 'Document analysis complete.',
        sender: 'agent',
        status: 'complete',
        timestamp: originalDocAnalysisMessage?.timestamp || new Date()
      });

      const formattedResponse = formatClaudeResponse(analysisData); // Assuming this can also handle document analysis response
      const botMessageId = generateId();
      await typeMessage(formattedResponse.text, updatedMessages, botMessageId, setMessages, emitParticles);
      
      // Update the bot message to include linkedGrantData and followUpQuestions from document analysis
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { 
              ...msg, 
              content: formattedResponse.text, 
              status: 'complete', 
              linkedGrantData: (analysisData.matched_grants as Grant[])?.map(g => ({
                id: g.id,
                name: g.name || g.grant_name,
                grant_name: g.grant_name,
                agency: g.agency,
                deadline: g.deadline,
                focus_area: g.focus_area
              })),
              followUpQuestions: formattedResponse.followUpQuestions,
              timestamp: msg.timestamp || new Date()
            } 
          : msg
      ));

    } catch (error) {
      console.error('Error during document analysis:', error);
      analysisState.setError(error as Error);
      const errorId = generateId();
      setMessages(prev => [
        ...prev,
        { 
          id: errorId, 
          sender: 'agent', 
          status: 'complete', 
          content: '❌ Error analyzing document. Please try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      // analysisState.setLoading(false); // Removed: useApiState handles this via setData/setError
    }
  };

  // Initial welcome message from bot
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: generateId(),
          sender: 'bot',
          content: headerFullText, // Use the fully typed header for initial message
          status: 'complete',
          timestamp: new Date()
        }
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerFullText]); // Only re-run if headerFullText changes (which it doesn't after init)

  // Centralized state for DashboardContent
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
            analysisIsLoading={analysisState.isLoading} // Pass this for button states
            handleSubmit={handleSubmit} // Main form submission
            handleFollowUpClick={handleFollowUpSubmit} // Corrected prop name
            typedHeader={typedHeader}
            onPdfSelect={handlePdfSelect}
            handleAnalyze={handleAnalyze} // for CoPilotSection
            keywordSuggestions={keywordSuggestions}
          />
        </Suspense>
      </div>
    </motion.div>
  )
}
