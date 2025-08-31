'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  className?: string
}

export default function BackButton({ className = '' }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    router.push('/')
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleBack}
      className={`mb-6 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 ${className}`}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Home
    </Button>
  )
}