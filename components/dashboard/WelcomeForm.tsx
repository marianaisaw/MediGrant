'use client'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

type WelcomeFormProps = {
  input: string
  setInput: (input: string) => void
  linkedInUrl: string
  setLinkedInUrl: (url: string) => void
  showLinkedIn: boolean
  setShowLinkedIn: (show: boolean) => void
  isProcessing: boolean
  handleSubmit: (e: React.FormEvent) => Promise<void>
  typedHeader: string
}

export function WelcomeForm({
  input,
  setInput,
  linkedInUrl,
  setLinkedInUrl,
  showLinkedIn,
  isProcessing,
  handleSubmit,
  typedHeader
}: WelcomeFormProps) {
  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                p-6 bg-gradient-to-br from-blue-950/50 to-black/80
                rounded-3xl backdrop-blur-xl shadow-[0_0_60px_20px_rgba(59,130,246,0.4)]
                pointer-events-auto
                w-[80vw] max-w-[800px]
                transition-opacity duration-300 ease-in-out"
    >
      <div
        className="absolute inset-0 rounded-3xl border-4 border-indigo-500/50 animate-pulse"
        style={{ animationDuration: '2s' }}
      />

      <form onSubmit={handleSubmit} className="relative flex flex-col gap-6">
        {/* animated typed header */}
        {typedHeader && (
          <h2
            className="text-3xl font-bold text-center text-white tracking-tighter"
          >
            {typedHeader}
          </h2>
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
    </div>
  )
}
