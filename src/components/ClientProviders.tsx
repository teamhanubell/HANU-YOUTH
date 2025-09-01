'use client'

import { useEffect, useState } from 'react'
import { ThemeProvider } from '@/components/Theme/ThemeProvider'
import { ChatConnectionsProvider } from '@/components/Chat/ConnectionsProvider'

interface ClientProvidersProps {
  children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only render providers on the client side to avoid SSR issues
  if (!isClient) {
    return <>{children}</>
  }

  return (
    <ThemeProvider>
      <ChatConnectionsProvider>
        {children}
      </ChatConnectionsProvider>
    </ThemeProvider>
  )
}
