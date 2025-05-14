'use client'

import { useSearchParams } from 'next/navigation'
import { OpportunitiesView } from './OpportunitiesView'
import { ProposalsView } from './ProposalsView'
import { StatsCard } from './StatsCard'
import { CoPilotSection } from './CoPilotSection'
import { GrantOpportunities } from './GrantOpportunities'
import { ProposalEditor } from './ProposalEditor'
import { ParticleEffects } from './ParticleEffects'
import { MessageItem } from './MessageItem'
import { Footer } from './Footer'
import { WelcomeForm } from './WelcomeForm'
import { Search, FileText, Calendar, DollarSign } from 'lucide-react'
import { Message, Grant } from '@/lib/dashboard/types'
import { useRef } from 'react'

type DashboardContentProps = {
  messages: Message[]
  matchedGrants: Grant[]
  particleCount: number
  hasQueried: boolean
  emitParticles: (count: number) => void
  input: string
  setInput: (value: string) => void
  linkedInUrl: string
  setLinkedInUrl: (value: string) => void
  showLinkedIn: boolean
  setShowLinkedIn: (value: boolean) => void
  analysisIsLoading: boolean
  handleSubmit: (e: React.FormEvent) => Promise<void>
  typedHeader: string
  onPdfSelect: (file: File) => void
  handleAnalyze: (text: string) => Promise<void>
  keywordSuggestions: Array<{keyword: string, relevance: number, used: boolean}>
}

export function DashboardContent({
  messages,
  matchedGrants,
  particleCount,
  hasQueried,
  emitParticles,
  input,
  setInput,
  linkedInUrl,
  setLinkedInUrl,
  showLinkedIn,
  setShowLinkedIn,
  analysisIsLoading,
  handleSubmit,
  typedHeader,
  onPdfSelect,
  handleAnalyze,
  keywordSuggestions
}: DashboardContentProps) {
  // Get the current view from URL query parameters
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') || 'chat'
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  return (
    <div className="flex-1 overflow-auto">
      {currentView === 'chat' || !currentView ? (
        /* Chat Interface */
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
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
          </div>
          
          {!hasQueried ? (
            <div className="p-6">
              <WelcomeForm
                input={input}
                setInput={setInput}
                linkedInUrl={linkedInUrl}
                setLinkedInUrl={setLinkedInUrl}
                showLinkedIn={showLinkedIn}
                setShowLinkedIn={setShowLinkedIn}
                isProcessing={analysisIsLoading}
                handleSubmit={handleSubmit}
                typedHeader={typedHeader}
                onPdfSelect={onPdfSelect}
              />
            </div>
          ) : (
            <div className="p-4 border-t border-blue-900/30">
              <Footer
                hasQueried={hasQueried}
                showLinkedIn={showLinkedIn}
                setShowLinkedIn={setShowLinkedIn}
                linkedInUrl={linkedInUrl}
                setLinkedInUrl={setLinkedInUrl}
                handleSubmit={handleSubmit}
                input={input}
                setInput={setInput}
              />
            </div>
          )}
        </div>
      ) : currentView === 'opportunities' ? (
        /* Opportunities Interface */
        <OpportunitiesView />
      ) : currentView === 'proposals' ? (
        /* Proposals Interface */
        <ProposalsView />
      ) : currentView === 'home' ? (
        /* Home Interface (formerly Dashboard) */
        <div className="max-w-7xl mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard 
              title="Tailored Opportunities" 
              value="24" 
              icon={<Search className="h-5 w-5" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard 
              title="Proposals in Progress" 
              value="3" 
              icon={<FileText className="h-5 w-5" />}
              trend={{ value: 1, isPositive: true }}
            />
            <StatsCard 
              title="Upcoming Deadlines" 
              value="7" 
              icon={<Calendar className="h-5 w-5" />}
              trend={{ value: 2, isPositive: false }}
            />
            <StatsCard 
              title="Total Funding Available" 
              value="$4.2M" 
              icon={<DollarSign className="h-5 w-5" />}
              trend={{ value: 8, isPositive: true }}
            />
          </div>
          
          {/* Language Model Co-Pilot */}
          <div className="mb-8">
            <CoPilotSection 
              onAnalyze={handleAnalyze}
              isProcessing={analysisIsLoading}
            />
          </div>
          
          {/* Two-column layout for opportunities and proposal editor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GrantOpportunities 
              grants={matchedGrants}
              isLoading={analysisIsLoading}
            />
            
            <ProposalEditor 
              initialContent={input}
              keywordSuggestions={keywordSuggestions}
              onSave={(content) => console.log('Saving proposal:', content)}
            />
          </div>
        </div>
      ) : (
        /* Fallback to Chat Interface if view is unknown */
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
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
          </div>
          
          <div className="p-4 border-t border-blue-900/30">
            <Footer
              hasQueried={hasQueried}
              showLinkedIn={showLinkedIn}
              setShowLinkedIn={setShowLinkedIn}
              linkedInUrl={linkedInUrl}
              setLinkedInUrl={setLinkedInUrl}
              handleSubmit={handleSubmit}
              input={input}
              setInput={setInput}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function DashboardHeader({ currentView }: { currentView: string }) {
  return (
    <div className="p-6 border-b border-blue-900/30">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {currentView === 'chat' ? 'MediGrant AI Assistant' : 
             currentView === 'opportunities' ? 'Grant Opportunities' :
             currentView === 'proposals' ? 'My Proposals' :
             currentView === 'home' ? 'MediGrant Home' :
             'MediGrant AI Assistant'}
          </h1>
          <p className="text-gray-400 mt-1">
            {currentView === 'chat' 
              ? 'Ask questions about grants or get help with your proposals' 
              : currentView === 'opportunities'
              ? 'Discover and apply for healthcare research funding'
              : currentView === 'proposals'
              ? 'Manage and track your grant proposals'
              : currentView === 'home'
              ? 'AI-powered grant matching and proposal writing'
              : 'Ask questions about grants or get help with your proposals'}
          </p>
        </div>
      </div>
    </div>
  )
}
