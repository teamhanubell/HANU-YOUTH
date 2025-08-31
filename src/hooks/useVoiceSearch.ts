'use client'

import { useState, useEffect, useRef } from 'react'

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface SpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: (event: any) => void
  onerror: (event: any) => void
  onend: () => void
}

interface UseVoiceSearchReturn {
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
  isSupported: boolean
  error: string | null
}

export function useVoiceSearch(onResult?: (transcript: string) => void): UseVoiceSearchReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()
        if (recognitionRef.current) {
          recognitionRef.current.continuous = false
          recognitionRef.current.interimResults = true
          recognitionRef.current.lang = 'en-US'

          recognitionRef.current.onresult = (event) => {
            const result = event as any
            const transcript = Array.from(result.results)
              .map((result: any) => result[0])
              .map((result: any) => result.transcript)
              .join('')

            setTranscript(transcript)

            // If we have a final result, call the callback
            if (result.results[result.results.length - 1].isFinal) {
              onResult?.(transcript)
              stopListening()
            }
          }

          recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event)
            setError(`Speech recognition error: ${event.error}`)
            setIsListening(false)
          }

          recognitionRef.current.onend = () => {
            setIsListening(false)
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
            }
          }
        }
      } else {
        setIsSupported(false)
        setError('Speech recognition is not supported in this browser')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [onResult])

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not available')
      return
    }

    try {
      setTranscript('')
      setError(null)
      setIsListening(true)
      recognitionRef.current.start()

      // Auto-stop after 10 seconds of silence
      timeoutRef.current = setTimeout(() => {
        if (isListening) {
          stopListening()
        }
      }, 10000)
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      setError('Failed to start speech recognition')
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    isSupported,
    error
  }
}