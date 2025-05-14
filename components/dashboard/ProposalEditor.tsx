'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Save } from 'lucide-react'

type KeywordSuggestion = {
  keyword: string
  relevance: number
  used: boolean
}

type ProposalEditorProps = {
  initialContent?: string
  keywordSuggestions?: KeywordSuggestion[]
  onSave?: (content: string) => void
}

export function ProposalEditor({ 
  initialContent = '', 
  keywordSuggestions = [],
  onSave
}: ProposalEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  
  const handleSave = () => {
    if (!content.trim()) return
    
    setIsSaving(true)
    setTimeout(() => {
      if (onSave) onSave(content)
      setIsSaving(false)
    }, 1000)
  }
  
  // Calculate keyword usage
  const updatedSuggestions = keywordSuggestions.map(suggestion => ({
    ...suggestion,
    used: content.toLowerCase().includes(suggestion.keyword.toLowerCase())
  }))
  
  // Calculate overall score based on keyword usage
  const usedKeywords = updatedSuggestions.filter(k => k.used).length
  const totalKeywords = updatedSuggestions.length
  const score = totalKeywords > 0 ? Math.round((usedKeywords / totalKeywords) * 100) : 0
  
  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" />
          Proposal Editor
        </h2>
        
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-400">
            Keyword Score: 
            <span className={`ml-1 font-medium ${score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {score}%
            </span>
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-1 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Draft
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write or paste your proposal text here..."
            className="w-full bg-gray-900/70 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[300px]"
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-300">Keyword Suggestions</h3>
          <p className="text-xs text-gray-400">Including these keywords may increase your proposal&apos;s relevance score.</p>
        </div>
      </div>
    </Card>
  )
}
