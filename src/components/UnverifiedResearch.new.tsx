'use client';

import React, { useState, useMemo } from 'react';
import { Clock, Award, CheckCircle, AlertTriangle, Search, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface ResearchMetrics {
  pages: number;
  dataPoints: string;
  references: number;
  charts: number;
}

type ResearchStatus = 'pending' | 'in_review' | 'published' | 'rejected';

interface Research {
  id: number;
  title: string;
  description: string;
  category: string;
  points: number;
  status: ResearchStatus;
  submittedBy: string;
  submittedDate: string;
  rewardTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  metrics: ResearchMetrics;
  tags: string[];
}

const MOCK_RESEARCH: Research[] = [
  {
    id: 0,
    title: 'Media and Information Literacy (MIL) Basics',
    description: 'An introductory course covering the fundamental concepts of media and information literacy. This unverified course aims to help learners critically analyze media content, understand digital citizenship, and develop skills to navigate the information landscape effectively.',
    category: 'Education',
    points: 200,
    status: 'pending',
    submittedBy: 'UNESCO Education Team',
    submittedDate: '2025-08-27',
    rewardTier: 'platinum',
    metrics: {
      pages: 35,
      dataPoints: '25K+',
      references: 64,
      charts: 18
    },
    tags: ['media literacy', 'digital citizenship', 'education']
  },
  // ... (other mock data items)
];

// Extend the Research interface to include the review state
interface ResearchWithReview extends Research {
  isReviewing?: boolean;
  reviewNotes?: string;
}

const getStatusBadge = (status: ResearchStatus) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </span>
      );
    case 'in_review':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          In Review
        </span>
      );
    case 'published':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Published
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <X className="w-3 h-3 mr-1" />
          Rejected
        </span>
      );
    default:
      return null;
  }
};

const getRewardBadge = (tier: string) => {
  const tierStyles = {
    bronze: 'bg-amber-100 text-amber-800',
    silver: 'bg-gray-100 text-gray-800',
    gold: 'bg-yellow-100 text-yellow-800',
    platinum: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tierStyles[tier as keyof typeof tierStyles]}`}>
      <Award className="w-3 h-3 mr-1" />
      {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
    </span>
  );
};

const MetricItem = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) => (
  <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
    <dt className="flex items-center text-xs font-medium text-gray-500">
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </dt>
    <dd className="mt-1 text-sm font-semibold text-gray-900">{value}</dd>
  </div>
);

export const UnverifiedResearch: React.FC = () => {
  // State for research data and UI
  const [researchList, setResearchList] = useState<ResearchWithReview[]>(MOCK_RESEARCH);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResearch, setSelectedResearch] = useState<ResearchWithReview | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set(['All Categories']);
    MOCK_RESEARCH.forEach(research => cats.add(research.category));
    return Array.from(cats);
  }, []);

  // Filter and search functionality
  const filteredResearch = useMemo(() => {
    return researchList.filter(research => {
      const matchesSearch = searchQuery === '' || 
        research.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        research.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        research.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All Categories' || research.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [researchList, searchQuery, selectedCategory]);

  // Handle review actions
  const handleReviewAction = async (action: 'approve' | 'reject' | 'request_revision') => {
    if (!selectedResearch) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the research status based on action
      const updatedList = researchList.map(research => {
        if (research.id === selectedResearch.id) {
          const newStatus: ResearchStatus = action === 'approve' ? 'published' : 
                                          action === 'reject' ? 'rejected' : 'in_review';
          return { ...research, status: newStatus };
        }
        return research;
      });
      
      setResearchList(updatedList);
      setIsReviewDialogOpen(false);
      
      // Show success message
      const actionMessage = {
        approve: 'approved',
        reject: 'rejected',
        request_revision: 'sent for revision'
      }[action];
      
      toast.success(`Research ${actionMessage} successfully!`);
      
    } catch (err) {
      setError('Failed to process review. Please try again.');
      console.error('Review error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening the review dialog
  const openReviewDialog = (research: ResearchWithReview) => {
    setSelectedResearch(research);
    setReviewNotes('');
    setIsReviewDialogOpen(true);
  };

  // Handle viewing research details
  const viewResearchDetails = (research: ResearchWithReview) => {
    setSelectedResearch(research);
    // In a real app, you might open a modal or navigate to a details page
    console.log('Viewing details for:', research.title);
  };

  if (isLoading && researchList.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <X className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">Unverified Research Submissions</h1>
              <p className="mt-1 text-sm text-gray-500">Review and validate research submissions from contributors</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search research..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                  </button>
                )}
              </div>
              
              {/* Category Filter */}
              <select 
                className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredResearch.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No research found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          ) : (
            filteredResearch.map((research) => (
              <div key={research.id} className="bg-white shadow overflow-hidden rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h2 className="text-xl font-semibold text-gray-900 leading-7">{research.title}</h2>
                        <div className="flex-shrink-0">
                          {getStatusBadge(research.status)}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {research.description}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {research.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {getRewardBadge(research.rewardTier)}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricItem label="Pages" value={research.metrics.pages} icon={Clock} />
                    <MetricItem label="Data Points" value={research.metrics.dataPoints} icon={CheckCircle} />
                    <MetricItem label="References" value={research.metrics.references} icon={Award} />
                    <MetricItem label="Charts" value={research.metrics.charts} icon={AlertTriangle} />
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Submitted by <span className="font-medium text-gray-900">{research.submittedBy}</span> on {new Date(research.submittedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="mx-2 hidden sm:inline">·</span>
                    <span className="inline-flex items-center mt-1 sm:mt-0">
                      <Award className="w-4 h-4 mr-1 text-yellow-500" />
                      {research.points} XP Reward
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => viewResearchDetails(research)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => openReviewDialog(research)}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading && research.id === selectedResearch?.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Review Submission'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Submission: {selectedResearch?.title}</DialogTitle>
            <DialogDescription>
              Add your review notes and take action on this submission
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Review Notes
              </label>
              <textarea
                id="reviewNotes"
                rows={4}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                placeholder="Add your review notes here..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>
            
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => handleReviewAction('request_revision')}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-yellow-300 shadow-sm text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                Request Revision
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction('reject')}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction('approve')}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                Approve & Publish
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnverifiedResearch;
