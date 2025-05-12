'use client'

import { Button } from '@/components/ui/button'
import { Linkedin } from 'lucide-react'

type HeaderProps = {
  showLinkedIn: boolean
  setShowLinkedIn: (show: boolean) => void
}

export function Header({ showLinkedIn, setShowLinkedIn }: HeaderProps) {
  return (
    <header className="py-4 px-6 border-b border-blue-400/20 backdrop-blur-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-500 tracking-tighter">
            MediGrant AI
          </h1>
          <p className="text-sm text-blue-200/80">
            Your AI co-pilot for healthcare research funding
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowLinkedIn(!showLinkedIn)}
            className="text-blue-300 border border-blue-400/30 
                      hover:scale-105 active:scale-95 transition-transform"
          >
            <Linkedin className="h-4 w-4 mr-2" />
            {showLinkedIn ? 'Hide' : 'Connect'}
          </Button>
        </div>
      </div>
    </header>
  )
}
