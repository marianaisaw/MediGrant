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
}

export function Footer({
  hasQueried,
  showLinkedIn,
  setShowLinkedIn,
  linkedInUrl,
  setLinkedInUrl,
  handleSubmit
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
        <div 
          className="flex-1 relative hover:scale-[1.005] transition-transform"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="absolute inset-0 bg-blue-400/20 hover:bg-blue-400/30 transition-colors rounded-full" />
        </div>
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
