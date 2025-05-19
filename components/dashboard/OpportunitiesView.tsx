'use client'

import { useState, useCallback } from 'react'
import { Search, Calendar, DollarSign, ExternalLink } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Grant {
  id: string;
  title: string;
  funder: string;
  amount: number | string;
  deadline: string;
  tags: string[];
  description: string;
  url?: string;
  match_reason?: string;
  budget_range?: string;
  eligibility?: string[];
}

interface RawGrant {
  id: string;
  grant_name: string;
  agency: string;
  budget_range: string; 
  deadline: string;
  focus_area?: string; 
  description: string;
  url?: string;
  match_reason?: string;
  eligibility?: string[]; 
}

export function OpportunitiesView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [opportunities, setOpportunities] = useState<Grant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const fetchOpportunities = useCallback(async (query: string) => {
    if (!query.trim()) {
      setOpportunities([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search-grants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const mappedGrants: Grant[] = data.grants.map((grant: RawGrant) => ({
        id: grant.id,
        title: grant.grant_name,
        funder: grant.agency,
        amount: grant.budget_range,
        deadline: grant.deadline,
        tags: grant.focus_area ? grant.focus_area.split(',').map((tag: string) => tag.trim()) : [],
        description: grant.description,
        url: grant.url,
        match_reason: grant.match_reason,
        budget_range: grant.budget_range,
        eligibility: grant.eligibility,
      }));
      setOpportunities(mappedGrants);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setOpportunities([]);
    }
    setIsLoading(false);
  }, []);

  const categories = Array.from(new Set(opportunities.flatMap(opp => opp.tags || [])));

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesCategory = !filterCategory || (opp.tags && opp.tags.includes(filterCategory));
    return matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDaysRemaining = (deadlineString: string) => {
    const today = new Date();
    const deadline = new Date(deadlineString);
    if (isNaN(deadline.getTime())) {
      return Infinity;
    }
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick = () => {
    setHasSearched(true);
    fetchOpportunities(searchQuery);
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

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 mb-6">
            {/* Search Bar and new Button position */}
            <div className="flex items-center w-full md:w-2/3 border-1 border-gray-700 rounded-md bg-gray-800/60 focus-within:ring-2 focus-within:ring-blue-600 transition-all duration-150 ease-in-out shadow-sm">
              <Input
                type="text"
                placeholder="Search opportunities... (e.g., 'pediatric cancer research grant')"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchButtonClick();
                  }
                }}
                className="flex-grow bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 px-4 py-3 text-sm"
              />
              <Button
                variant="default"
                size="sm"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-l-none rounded-r-md px-4 py-2.5 transition-colors duration-150 ease-in-out flex items-center shadow-sm"
                onClick={handleSearchButtonClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap mt-4 md:mt-0">
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

          <div className="mb-4 text-gray-400 text-sm pt-4">
            {error && <p className="text-red-500">Error: {error}</p>}
            {isLoading && <p>Searching for opportunities...</p>}
            {!isLoading && !error && hasSearched && filteredOpportunities.length > 0 && (
              <p>Found {filteredOpportunities.length} matching opportunities for your criteria.</p>
            )}
          </div>

          <div className="space-y-4">
            {isLoading ? (
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
            ) : filteredOpportunities.length > 0 ? (
              filteredOpportunities.map(opportunity => {
                const daysRemaining = getDaysRemaining(opportunity.deadline);
                const isUrgent = daysRemaining <= 14 && daysRemaining >= 0;

                return (
                  <Card key={opportunity.id} className="p-6 bg-gray-800/50 border-gray-700 hover:bg-gray-800/80 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1">{opportunity.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">Funder: {opportunity.funder}</p>
                        {opportunity.budget_range && opportunity.budget_range !== 'Not specified' && (
                          <div className="flex items-center text-sm text-gray-400 mb-2">
                            <DollarSign size={14} className="mr-1 text-green-500" />
                            Budget: {opportunity.budget_range}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <Calendar size={14} className={`mr-1 ${isUrgent ? 'text-red-500' : 'text-blue-400'}`} />
                          Deadline: {formatDate(opportunity.deadline)}
                          {typeof daysRemaining === 'number' && daysRemaining !== Infinity && (
                            <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {daysRemaining >= 0 ? `${daysRemaining} days left` : 'Past Deadline'}
                            </span>
                          )}
                        </div>
                        {opportunity.match_reason && (
                          <p className="text-xs text-gray-500 mb-3">Match Reason: {opportunity.match_reason}</p>
                        )}
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed line-clamp-3">{opportunity.description}</p>
                        {opportunity.tags && opportunity.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {opportunity.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-md">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-start md:items-end gap-2">
                        {opportunity.url && (
                          <a href={opportunity.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="cursor-pointer border-blue-600 text-blue-400 bg-blue-900 hover:bg-blue-600 hover:text-white">
                              <ExternalLink size={14} className="mr-2" />
                              View Details
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              !isLoading && !error && hasSearched && (
                <p className="text-gray-400">No opportunities found matching your criteria. Try a different search or filter.</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
