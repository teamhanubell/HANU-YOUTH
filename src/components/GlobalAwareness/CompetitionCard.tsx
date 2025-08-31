'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Clock } from 'lucide-react'

export type Competition = {
  id: string
  title: string
  org: string
  date: string
  deadline: string
  summary: string
  url: string // mock url
  tags?: string[]
}

export default function CompetitionCard({ comp }: { comp: Competition }) {
  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <div className="flex items-start justify-between w-full">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              {comp.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-400">{comp.org} • {comp.date}</CardDescription>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-400">Deadline</div>
            <div className="font-medium text-gray-200">{comp.deadline}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-300 mb-3">{comp.summary}</p>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(comp.tags || []).map((t) => (
              <span key={t} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">{t}</span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a href={comp.url} target="_blank" rel="noopener noreferrer" className="inline-block">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-600 cursor-pointer">Participate</Button>
            </a>
            <Button size="sm" variant="ghost" onClick={() => alert('Mock: view details')}>
              <Clock className="w-4 h-4 mr-2" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}