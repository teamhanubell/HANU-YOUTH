'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { Profile } from '@/components/GlobalAwareness/ProfileCard'

type ConnCtx = {
  connections: Profile[]
  addConnection: (p: Profile) => void
  removeConnection: (id: string) => void
  isConnected: (id: string) => boolean
}

const STORAGE_KEY = 'hanu_chat_connections'
const ChatConnContext = createContext<ConnCtx | null>(null)

export function ChatConnectionsProvider({ children }: { children: React.ReactNode }) {
  const [connections, setConnections] = useState<Profile[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) setConnections(parsed)
    } catch {
      // ignore malformed data
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(connections))
    } catch {}
  }, [connections])

  const addConnection = useCallback((p: Profile) => {
    setConnections((prev) => {
      if (prev.some((x) => x.id === p.id)) return prev
      return [...prev, p]
    })
  }, [])

  const removeConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const isConnected = useCallback(
    (id: string) => connections.some((p) => p.id === id),
    [connections]
  )

  const value = useMemo(
    () => ({ connections, addConnection, removeConnection, isConnected }),
    [connections, addConnection, removeConnection, isConnected]
  )

  return <ChatConnContext.Provider value={value}>{children}</ChatConnContext.Provider>
}

export function useChatConnections() {
  const ctx = useContext(ChatConnContext)
  if (!ctx) throw new Error('useChatConnections must be used inside ChatConnectionsProvider')
  return ctx
}
