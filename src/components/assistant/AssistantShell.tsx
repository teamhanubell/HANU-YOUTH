"use client"

import { ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bot, LayoutGrid, Settings, BarChart3, ClipboardList, MessageSquare } from "lucide-react"

interface AssistantShellProps {
  tabs: { key: string; label: string; icon?: ReactNode }[]
  initialTab?: string
  rightPanel?: ReactNode
  children: (activeTab: string) => ReactNode
}

export default function AssistantShell({ tabs, initialTab, rightPanel, children }: AssistantShellProps) {
  const [active, setActive] = useState<string>(initialTab || (tabs[0]?.key ?? "chat"))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top header (AWS/Amazon Q style) */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white"><Bot className="w-4 h-4" /></div>
            <div className="font-semibold">HANU-AI Assistant</div>
            <div className="text-xs text-slate-500 border-l pl-3">Agentic • Research • Actions</div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => (window.location.href = "/")}>Home</Button>
            <Button size="sm" onClick={() => (window.location.href = "/signin")}>Sign in</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6 grid grid-cols-12 gap-6">
        {/* Left nav */}
        <nav className="col-span-12 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="p-2 space-y-1">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                    active === t.key ? "bg-blue-50 text-blue-700 border border-blue-200" : "hover:bg-slate-50"
                  )}
                  aria-pressed={active === t.key}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5">
                    {t.icon}
                  </span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="col-span-12 lg:col-span-7 xl:col-span-8">
          {/* Tab bar */}
          <div className="mb-4 flex items-center gap-2 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={cn(
                  "px-3 py-2 text-sm rounded-md border",
                  active === t.key ? "bg-white border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
                title={t.label}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            {children(active)}
          </div>
        </main>

        {/* Right panel */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2">
          {rightPanel && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              {rightPanel}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
