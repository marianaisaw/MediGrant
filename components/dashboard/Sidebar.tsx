'use client'

import { useState, useEffect } from 'react'
import { Search, MessageCircle  } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type NavItem = {
  name: string
  icon: React.ReactNode
  href: string
  active?: boolean
  disabled?: boolean
}

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('Chat')
  const disabledFeatures = false
  const searchParams = useSearchParams()
  const currentView = searchParams?.get('view') || 'chat'
  
  // Set active item based on URL on initial load
  useEffect(() => {
    if (currentView === 'home') {
      setActiveItem('Home')
    } else if (currentView === 'opportunities') {
      setActiveItem('Opportunities')
    } else if (currentView === 'proposals') {
      setActiveItem('Proposals')
    } else if (currentView === 'chat' || !currentView) {
      setActiveItem('Chat')
    } else if (currentView === 'deep-research') {
      setActiveItem('Deep Research')
    }
  }, [currentView])
  
  const navItems: NavItem[] = [
    { name: 'Chat', icon: <MessageCircle className="h-5 w-5" />, href: '/dashboard', active: activeItem === 'Chat' },
    { name: 'Opportunities', icon: <Search className="h-5 w-5" />, href: '/dashboard?view=opportunities', active: activeItem === 'Opportunities', disabled: disabledFeatures },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-blue-900/30 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-500 tracking-tighter">
          MediGrant
        </h1>
        <p className="text-xs text-blue-200/80 mt-1">
          Grant Matching Platform Demo
        </p>
      </div>
      
      <nav className="flex-1 px-4 mt-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              {item.disabled ? (
                <div 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-600 cursor-not-allowed opacity-50"
                  title="This feature is currently disabled"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              ) : (
                <Link 
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${item.active 
                    ? 'bg-blue-800/30 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                  onClick={() => setActiveItem(item.name)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
