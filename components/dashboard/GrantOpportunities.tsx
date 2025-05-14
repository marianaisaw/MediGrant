'use client'

import { Card } from '@/components/ui/card'
import { Calendar, DollarSign, Clock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Grant } from '@/lib/dashboard/types'

type GrantOpportunitiesProps = {
  grants: Grant[]
  isLoading?: boolean
}

export function GrantOpportunities({ grants = [], isLoading = false }: GrantOpportunitiesProps) {
  if (isLoading) {
    return (
      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Matched Grant Opportunities</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Matched Grant Opportunities</h2>
      
      {grants.length === 0 ? (
        <p className="text-gray-400 text-center py-6">No matching grants found. Try refining your search criteria.</p>
      ) : (
        <div className="space-y-4">
          {grants.map((grant) => (
            <div key={grant.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all">
              <h3 className="font-medium text-white">{grant.title}</h3>
              
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center text-gray-400">
                  <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                  {grant.amount ? `$${grant.amount.toLocaleString()}` : 'Funding varies'}
                </div>
                
                <div className="flex items-center text-gray-400">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  {new Date(grant.deadline).toLocaleDateString()}
                </div>
              </div>
              
              <div className="mt-2 flex items-center text-gray-400 text-sm">
                <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                {grant.funder}
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <div className="flex gap-1">
                  {grant.tags?.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Button size="sm" variant="outline" className="text-blue-400 border-blue-500/30 hover:bg-blue-900/30">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
