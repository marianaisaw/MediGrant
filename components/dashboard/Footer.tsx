'use client'
import { ChevronRight, Linkedin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type FooterProps = {
  hasQueried: boolean
  showLinkedIn: boolean
  setShowLinkedIn: (show: boolean) => void
  linkedInUrl: string
  setLinkedInUrl: (url: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  input?: string
  setInput?: (input: string) => void
}

export function Footer({
  hasQueried,
  showLinkedIn,
  setShowLinkedIn,
  linkedInUrl,
  setLinkedInUrl,
  handleSubmit,
  input = '',
  setInput = () => {}
}: FooterProps) {
  if (!hasQueried) return null
  
  return (
    <footer
      className="border-t border-blue-400/20 p-4 backdrop-blur-lg bg-gray-900/50"
    >
      {showLinkedIn && (
        <div 
          className="mb-4"
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
              className="border-gray-700 text-white bg-gray-800/50 hover:bg-gray-800/50"
            >
              Skip
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="text"
          placeholder="Ask me about healthcare research grants..."
          className="flex-1 bg-gray-800/50 border-gray-700 text-white focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-950"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Send</span>
        </Button>
      </form>

      <div className="mt-3 text-xs flex justify-between items-center">
        <span className="text-blue-200/60">
        </span>
      </div>

      <div className="mt-3 text-xs flex justify-between items-center">
        <span className="text-blue-200/60">
          Powered by Grants.gov API • NSF Database • NIH RePORTER
        </span>
        <button 
          onClick={() => setShowLinkedIn(!showLinkedIn)} 
          className="text-blue-300/80 hover:text-blue-400 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 text-xs"
        >
          <Linkedin className="h-3 w-3" />
          {showLinkedIn ? 'Hide LinkedIn' : 'Connect Profile'}
        </button>
      </div>
    </footer>
  )
}
