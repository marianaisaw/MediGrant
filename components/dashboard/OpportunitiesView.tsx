'use client'

import { useState } from 'react'
import { Search, Calendar, DollarSign, ExternalLink, Download } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function OpportunitiesView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const isLoading = false
  // Sample grant opportunities data
  const opportunities = [
    {
      id: 'grant-1',
      title: 'Innovative Approaches to Cancer Treatment Research',
      funder: 'National Institutes of Health',
      amount: 500000,
      deadline: '2025-08-15',
      tags: ['Cancer', 'Treatment', 'Innovation'],
      description: 'Funding for novel therapeutic approaches that have the potential to significantly improve cancer treatment outcomes.'
    },
    {
      id: 'grant-2',
      title: 'Mental Health in Underserved Communities',
      funder: 'CDC Foundation',
      amount: 350000,
      deadline: '2025-07-30',
      tags: ['Mental Health', 'Community'],
      description: 'Support for research and intervention programs addressing mental health disparities in underserved populations.'
    },
    {
      id: 'grant-3',
      title: 'Emerging Infectious Disease Preparedness',
      funder: 'Gates Foundation',
      amount: 750000,
      deadline: '2025-09-10',
      tags: ['Infectious Disease', 'Preparedness'],
      description: 'Funding to enhance surveillance, diagnostic capabilities, and response strategies for emerging infectious diseases.'
    },
    {
      id: 'grant-4',
      title: 'Digital Health Solutions for Chronic Disease Management',
      funder: 'Robert Wood Johnson Foundation',
      amount: 425000,
      deadline: '2025-10-05',
      tags: ['Digital Health', 'Chronic Disease'],
      description: 'Support for innovative digital technologies that improve management and outcomes for patients with chronic diseases.'
    },
    {
      id: 'grant-5',
      title: 'Health Equity Research Initiative',
      funder: 'Commonwealth Fund',
      amount: 300000,
      deadline: '2025-09-22',
      tags: ['Health Equity', 'Research'],
      description: 'Funding for research that addresses systemic inequities in healthcare access, delivery, and outcomes.'
    },
    {
      id: 'grant-6',
      title: 'Pediatric Medical Device Innovation Consortium',
      funder: 'FDA',
      amount: 550000,
      deadline: '2025-11-15',
      tags: ['Pediatric', 'Medical Devices'],
      description: 'Support for the development and commercialization of medical devices designed specifically for the pediatric population.'
    }
  ]
  
  // Filter categories based on available tags
  const categories = Array.from(new Set(opportunities.flatMap(opp => opp.tags || [])));
  
  // Filter opportunities based on search query and category
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = searchQuery === '' || 
      opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.funder?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = !filterCategory || 
      opp.tags?.includes(filterCategory);
      
    return matchesSearch && matchesCategory;
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate days remaining until deadline
  const getDaysRemaining = (deadlineString: string) => {
    const today = new Date();
    const deadline = new Date(deadlineString);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 border-b border-blue-900/30">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Grant Opportunities</h1>
            <p className="text-gray-400 mt-1">Discover and apply for healthcare research funding</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white w-full"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={filterCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory(null)}
                className={filterCategory === null ? 'bg-blue-600' : 'border-gray-700 text-gray-300'}
              >
                All
              </Button>
              
              {categories.map(category => (
                <Button
                  key={category}
                  variant={filterCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory(category)}
                  className={filterCategory === category ? 'bg-blue-600' : 'border-gray-700 text-gray-300 bg-gray-800/50'}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mb-4 text-gray-400 text-sm">
            Found {filteredOpportunities.length} matching opportunities
          </div>
          
          {/* Opportunities List */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6 bg-gray-800/50 border-gray-700 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="flex gap-4 mb-4">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-700 rounded w-20"></div>
                    <div className="h-8 bg-gray-700 rounded w-20"></div>
                  </div>
                </Card>
              ))
            ) : (
              filteredOpportunities.map(opportunity => {
                const daysRemaining = getDaysRemaining(opportunity.deadline);
                const isUrgent = daysRemaining <= 14;
                
                return (
                  <Card key={opportunity.id} className="p-6 bg-gray-800/50 border-gray-700 hover:bg-gray-800/80 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1">{opportunity.title}</h3>
                        <p className="text-blue-300 text-sm mb-3">{opportunity.funder}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="flex items-center text-xs bg-blue-900/30 text-blue-300 rounded-full px-3 py-1">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${opportunity.amount?.toLocaleString()}
                          </div>
                          
                          <div className={`flex items-center text-xs rounded-full px-3 py-1 ${isUrgent 
                            ? 'bg-red-900/30 text-red-300' 
                            : 'bg-green-900/30 text-green-300'}`}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {isUrgent 
                              ? `${daysRemaining} days left` 
                              : formatDate(opportunity.deadline)}
                          </div>
                          
                          {opportunity.tags?.map(tag => (
                            <div key={tag} className="text-xs bg-gray-700/50 text-gray-300 rounded-full px-3 py-1">
                              {tag}
                            </div>
                          ))}
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-4">{opportunity.description}</p>
                      </div>
                      
                      <div className="flex flex-row md:flex-col gap-2 self-start">
                        <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        
                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-gray-800/50">
                          <Download className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
