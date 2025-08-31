'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, FileText, Globe, Calendar, Star } from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  content: string
  url: string
  type: 'research' | 'un_report' | 'event' | 'innovation'
  source: string
  date: string
  relevanceScore: number
}

interface SearchResultsProps {
  results: SearchResult[]
  isLoading?: boolean
}

const typeConfig = {
  research: {
    color: 'border-purple-500/50 text-purple-400',
    icon: FileText,
    label: 'Research'
  },
  un_report: {
    color: 'border-cyan-500/50 text-cyan-400',
    icon: Globe,
    label: 'UN Report'
  },
  event: {
    color: 'border-green-500/50 text-green-400',
    icon: Calendar,
    label: 'Event'
  },
  innovation: {
    color: 'border-pink-500/50 text-pink-400',
    icon: Star,
    label: 'Innovation'
  }
}

export default function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-black/30 backdrop-blur-sm border-gray-700/50 animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <Card className="bg-black/30 backdrop-blur-sm border-gray-700/50">
        <CardContent className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No results found</h3>
          <p className="text-gray-500">Try adjusting your search query or browse different categories.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result) => {
        const config = typeConfig[result.type]
        const IconComponent = config.icon

        return (
          <Card 
            key={result.id} 
            className="bg-black/30 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/20"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg text-white mb-2 hover:text-cyan-400 transition-colors">
                    {result.title}
                  </CardTitle>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className={config.color}>
                      <IconComponent className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {result.source}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(result.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-400">
                    Score: {Math.round(result.relevanceScore * 100)}%
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                    onClick={() => window.open(result.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 leading-relaxed mb-4">
                {result.content}
              </CardDescription>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 truncate max-w-md">
                  {result.url}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                  onClick={() => window.open(result.url, '_blank')}
                >
                  View Source
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}