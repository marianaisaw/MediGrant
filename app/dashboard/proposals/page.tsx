'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle, Edit, Trash2, Plus, FileCheck } from 'lucide-react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProposalsPage() {
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
    <motion.div 
      className="flex h-screen text-white font-sans"
      style={{ 
        background: 'linear-gradient(to bottom, #0f172a, #020617)',
        backgroundAttachment: 'fixed'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Suspense fallback={<div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-blue-900/30"></div>}>
        <Sidebar />
      </Suspense>
      
      <div className="flex-1 flex flex-col overflow-hidden pl-64">
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
                      className="p-6 bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{proposal.title}</h3>
                            <span className={`flex items-center px-2 py-1 ${statusBadge.bg} ${statusBadge.text} text-xs rounded-full`}>
                              {statusBadge.icon}
                              {statusBadge.label}
                            </span>
                          </div>
                          
                          <p className="text-blue-300 mb-4">Target: {proposal.targetGrant}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center text-gray-400 text-sm">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span>Last edited: {formatDate(proposal.lastEdited)}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-400 text-sm">
                              <FileCheck className="h-4 w-4 mr-2 text-gray-500" />
                              <span>
                                Due: {formatDate(proposal.dueDate)}
                                {isUrgent && (
                                  <span className="ml-2 px-2 py-0.5 bg-red-900/60 text-red-300 text-xs rounded-full">
                                    {daysRemaining} days left
                                  </span>
                                )}
                              </span>
                            </div>
                            
                            <div className="text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-400">Completion</span>
                                <span className="text-blue-300">{proposal.completionPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${proposal.completionPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {proposal.keywords.map(keyword => (
                              <span 
                                key={keyword} 
                                className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="border-gray-700 text-gray-300 hover:bg-red-900/20 hover:text-red-300 hover:border-red-900/50"
                            onClick={() => handleDeleteProposal(proposal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
    </motion.div>
  )
}
