'use client'

import AssistantShell from '@/components/assistant/AssistantShell'
import AIResearchAssistant from '@/components/AIResearchAssistant'
import { Bot, ClipboardList, BarChart3, Settings, LayoutGrid, MessageSquare } from 'lucide-react'

export default function AIAssistantPage() {
  const tabs = [
    { key: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'research', label: 'Research', icon: <LayoutGrid className="w-4 h-4" /> },
    { key: 'tasks', label: 'Tasks', icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'tools', label: 'Tools', icon: <Settings className="w-4 h-4" /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ]

  return (
    <AssistantShell
      tabs={tabs}
      initialTab="chat"
      rightPanel={
        <div className="text-sm space-y-3">
          <div className="font-semibold">Shortcuts</div>
          <ul className="list-disc list-inside text-slate-600 space-y-1">
            <li>New chat: type and press Enter</li>
            <li>Shift+Enter for newline</li>
            <li>Use @tools soon for actions</li>
          </ul>
        </div>
      }
    >
      {(active) => {
        if (active === 'chat') {
          return <AIResearchAssistant />
        }
        if (active === 'research') {
          return (
            <div className="text-sm text-slate-700">
              <div className="font-semibold mb-2">Research Workspace</div>
              <p>Coming next: saved searches, citations, and sources inspector.</p>
            </div>
          )
        }
        if (active === 'tasks') {
          return (
            <div className="text-sm text-slate-700">
              <div className="font-semibold mb-2">Tasks</div>
              <p>Plan, assign, and track agent tasks. Integrations coming soon.</p>
            </div>
          )
        }
        if (active === 'tools') {
          return (
            <div className="text-sm text-slate-700">
              <div className="font-semibold mb-2">Tools</div>
              <p>Connect browsing, code-run, summarizer, and planner modules.</p>
            </div>
          )
        }
        if (active === 'analytics') {
          return (
            <div className="text-sm text-slate-700">
              <div className="font-semibold mb-2">Analytics</div>
              <p>Usage, quality, and outcomes dashboard will appear here.</p>
            </div>
          )
        }
        return null
      }}
    </AssistantShell>
  )
}