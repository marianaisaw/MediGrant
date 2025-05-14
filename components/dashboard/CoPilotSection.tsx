'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Zap, Sparkles, RefreshCw } from 'lucide-react'

type CoPilotSectionProps = {
  onAnalyze: (text: string) => Promise<void>
  isProcessing?: boolean
}

export function CoPilotSection({ onAnalyze, isProcessing = false }: CoPilotSectionProps) {
  const [proposalText, setProposalText] = useState('')
  const [mode, setMode] = useState<'match' | 'rewrite'>('match')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (proposalText.trim()) {
      onAnalyze(proposalText)
    }
  }

  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-400" />
          Language Model Co-Pilot
        </h2>
        <div className="flex bg-gray-900 rounded-lg p-1">
          <Button 
            variant={mode === 'match' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('match')}
            className={mode === 'match' ? 'bg-blue-600' : 'text-gray-400'}
          >
            Grant Matching
          </Button>
          <Button 
            variant={mode === 'rewrite' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('rewrite')}
            className={mode === 'rewrite' ? 'bg-blue-600' : 'text-gray-400'}
          >
            Proposal Rewriting
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Textarea
          value={proposalText}
          onChange={(e) => setProposalText(e.target.value)}
          placeholder={mode === 'match' 
            ? "Describe your research project to find matching grants..." 
            : "Paste your proposal text for AI-powered rewriting and suggestions..."}
          className="w-full bg-gray-900/70 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] mb-4"
        />
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-400">
            {mode === 'match' 
              ? 'AI will analyze your project and find relevant funding opportunities' 
              : 'AI will suggest improvements to increase your proposal\'s effectiveness'}
          </p>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            disabled={isProcessing || !proposalText.trim()}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {mode === 'match' ? 'Find Grants' : 'Enhance Proposal'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
