'use client'

import { useState } from 'react'
import { FileText, Clock, CheckCircle, Edit, Trash2, Plus, FileCheck } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ProposalsView() {
  // Sample proposals data
  const [proposals, setProposals] = useState([
    {
      id: 'prop-1',
      title: 'Novel Immunotherapy Approaches for Metastatic Melanoma',
      targetGrant: 'NIH R01 Research Project',
      status: 'draft',
      lastEdited: '2025-05-10T14:30:00',
      dueDate: '2025-07-15',
      completionPercentage: 65,
      keywords: ['Immunotherapy', 'Melanoma', 'T-cell', 'Cancer']
    },
    {
      id: 'prop-2',
      title: 'Community-Based Mental Health Intervention for Underserved Populations',
      targetGrant: 'CDC Foundation Community Grant',
      status: 'review',
      lastEdited: '2025-05-12T09:15:00',
      dueDate: '2025-06-30',
      completionPercentage: 90,
      keywords: ['Mental Health', 'Community', 'Intervention', 'Underserved']
    },
    {
      id: 'prop-3',
      title: 'Digital Health Platform for Chronic Disease Management',
      targetGrant: 'RWJF Innovation Challenge',
      status: 'submitted',
      lastEdited: '2025-04-28T16:45:00',
      dueDate: '2025-05-01',
      completionPercentage: 100,
      keywords: ['Digital Health', 'Chronic Disease', 'Patient Monitoring']
    }
  ])
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate days remaining until due date
  const getDaysRemaining = (dueDateString: string) => {
    const today = new Date();
    const dueDate = new Date(dueDateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          bg: 'bg-yellow-900/30',
          text: 'text-yellow-300',
          icon: <Edit className="h-3 w-3 mr-1" />,
          label: 'Draft'
        };
      case 'review':
        return {
          bg: 'bg-blue-900/30',
          text: 'text-blue-300',
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: 'In Review'
        };
      case 'submitted':
        return {
          bg: 'bg-green-900/30',
          text: 'text-green-300',
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          label: 'Submitted'
        };
      default:
        return {
          bg: 'bg-gray-900/30',
          text: 'text-gray-300',
          icon: <FileText className="h-3 w-3 mr-1" />,
          label: status
        };
    }
  };
  
  // Handle delete proposal
  const handleDeleteProposal = (id: string) => {
    if (confirm('Are you sure you want to delete this proposal?')) {
      setProposals(proposals.filter(p => p.id !== id));
    }
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-blue-900/30">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">My Proposals</h1>
            <p className="text-gray-400 mt-1">Manage and track your grant proposals</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Draft Proposals</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {proposals.filter(p => p.status === 'draft').length}
                  </h3>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400">
                  <Edit className="h-5 w-5" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">In Review</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {proposals.filter(p => p.status === 'review').length}
                  </h3>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Submitted</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {proposals.filter(p => p.status === 'submitted').length}
                  </h3>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </div>
          
          {/* Proposals List */}
          <div className="space-y-4">
            {proposals.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700">
                <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No proposals yet</h3>
                <p className="text-gray-400 mb-6">Create your first proposal to get started</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Proposal
                </Button>
              </div>
            ) : (
              proposals.map(proposal => {
                const statusBadge = getStatusBadge(proposal.status);
                const daysRemaining = getDaysRemaining(proposal.dueDate);
                const isUrgent = daysRemaining <= 14 && proposal.status !== 'submitted';
                
                return (
                  <Card 
                    key={proposal.id} 
                    className="p-6 bg-gray-800/50 border-gray-700 hover:bg-gray-800/80 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold text-white">{proposal.title}</h3>
                          <div className={`flex items-center text-xs ${statusBadge.bg} ${statusBadge.text} rounded-full px-2 py-0.5`}>
                            {statusBadge.icon}
                            {statusBadge.label}
                          </div>
                        </div>
                        
                        <p className="text-blue-300 text-sm mb-3">Target: {proposal.targetGrant}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {proposal.keywords?.map(keyword => (
                            <div key={keyword} className="text-xs bg-gray-700/50 text-gray-300 rounded-full px-3 py-1">
                              {keyword}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div>
                            Last edited: {formatDate(proposal.lastEdited)}
                          </div>
                          
                          {proposal.status !== 'submitted' && (
                            <div className={isUrgent ? 'text-red-400' : 'text-green-400'}>
                              Due: {formatDate(proposal.dueDate)} ({daysRemaining} days)
                            </div>
                          )}
                        </div>
                        
                        {/* Progress bar */}
                        {proposal.status !== 'submitted' && (
                          <div className="mt-4">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Completion</span>
                              <span className="text-white">{proposal.completionPercentage}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${proposal.completionPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-row md:flex-col gap-2 self-start">
                        <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        
                        {proposal.status === 'draft' && (
                          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                            <FileCheck className="h-4 w-4 mr-2" />
                            Submit
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-gray-700 text-red-300 hover:bg-red-900/20 hover:border-red-700"
                          onClick={() => handleDeleteProposal(proposal.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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
