'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Send, X, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Contact {
  id: string
  name: string
  avatar: string
  online: boolean
  lastSeen?: string
  unreadCount: number
  isTyping: boolean
}

interface Message {
  id: string
  text: string
  imageUrl?: string
  ts: number
  fromMe: boolean
  status: 'sending' | 'delivered' | 'read'
  type: 'text' | 'image'
}

const MOCK_CONTACTS: Contact[] = [
  { 
    id: 'u1', 
    name: 'Vaishnavi', 
    avatar: 'V',
    online: true, 
    unreadCount: 2,
    isTyping: false
  },
  { 
    id: 'u2', 
    name: 'Dev', 
    avatar: 'D',
    online: true, 
    unreadCount: 0,
    isTyping: true
  },
  { 
    id: 'u3', 
    name: 'Vishal', 
    avatar: 'V',
    online: false, 
    lastSeen: '2h ago',
    unreadCount: 5,
    isTyping: false
  },
  { 
    id: 'u4', 
    name: 'Yashashvi', 
    avatar: 'Y',
    online: true, 
    unreadCount: 0,
    isTyping: false
  },
  { 
    id: 'u5', 
    name: 'Shubhang', 
    avatar: 'S',
    online: false, 
    lastSeen: '5m ago',
    unreadCount: 0,
    isTyping: false
  },
]

const MOCK_MESSAGES: Record<string, Message[]> = {
  u1: [
    { id: 'm1', text: 'Hi there! How can I help you today?', ts: Date.now() - 3600000 * 2, fromMe: false, status: 'read', type: 'text' },
    { id: 'm2', text: 'I was wondering about the project timeline', ts: Date.now() - 3600000, fromMe: true, status: 'read', type: 'text' },
    { id: 'm3', text: 'We\'re on track to finish by Friday', ts: Date.now() - 1800000, fromMe: false, status: 'read', type: 'text' },
  ],
  u2: [
    { id: 'm4', text: 'Did you review the documents?', ts: Date.now() - 7200000, fromMe: true, status: 'read', type: 'text' },
    { id: 'm5', text: 'Yes, I\'m looking at them now', ts: Date.now() - 7100000, fromMe: false, status: 'read', type: 'text' },
  ],
  u3: [
    { id: 'm6', text: 'Meeting at 3pm tomorrow', ts: Date.now() - 86400000, fromMe: false, status: 'read', type: 'text' },
  ],
  u4: [
    { id: 'm7', text: 'Thanks for your help!', ts: Date.now() - 172800000, fromMe: true, status: 'read', type: 'text' },
  ],
  u5: [
    { id: 'm8', text: 'Please send me the report', ts: Date.now() - 259200000, fromMe: false, status: 'read', type: 'text' },
  ],
}

export default function ChatPage() {
  const [activeContact, setActiveContact] = useState<Contact | null>(null)
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS)
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>(MOCK_MESSAGES)
  const [newMessage, setNewMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set first contact as active by default
  useEffect(() => {
    if (contacts.length > 0 && !activeContact) {
      setActiveContact(contacts[0])
    }
  }, [contacts, activeContact])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeContact])

  // Simulate typing indicators
  useEffect(() => {
    const typingInterval = setInterval(() => {
      setContacts(prevContacts => {
        const randomContact = Math.floor(Math.random() * prevContacts.length)
        return prevContacts.map((contact, idx) => ({
          ...contact,
          isTyping: idx === randomContact && Math.random() > 0.7 && contact.online
        }))
      })
    }, 10000) // Change typing status every 10 seconds

    return () => clearInterval(typingInterval)
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || !activeContact) return

    let imageUrl = ''
    if (selectedImage) {
      // In a real app, you would upload the image to a server here
      // For demo, we'll use a placeholder
      imageUrl = URL.createObjectURL(selectedImage)
    }

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      ...(imageUrl && { imageUrl }),
      ts: Date.now(),
      fromMe: true,
      status: 'sending',
      type: selectedImage ? 'image' : 'text'
    }

    setMessages(prev => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), message]
    }))

    // Simulate reply after 1-3 seconds
    if (Math.random() > 0.3) {
      const replyDelay = 1000 + Math.random() * 2000
      const replies = [
        'Thanks for your message!',
        'I\'ll get back to you soon.',
        'Interesting point!',
        'Can we discuss this tomorrow?',
        'I agree with you.'
      ]
      
      setTimeout(() => {
        const reply: Message = {
          id: `msg-${Date.now()}`,
          fromMe: false,
          text: replies[Math.floor(Math.random() * replies.length)],
          ts: Date.now() + replyDelay,
          status: 'delivered'
        }

        setMessages(prev => ({
          ...prev,
          [activeContact.id]: [...(prev[activeContact.id] || []), reply]
        }))
      }, replyDelay)
    }

    setNewMessage('')
  }

  if (!activeContact) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter',_sans-serif]">
      <div className="max-w-6xl mx-auto p-4 h-screen flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 flex-1 overflow-hidden rounded-lg shadow-sm">
          {/* Contacts List */}
          <Card className="md:col-span-1 overflow-hidden flex flex-col border-r border-gray-100 rounded-r-none">
            <CardHeader className="border-b p-4">
              <CardTitle className="text-lg font-semibold">Chats</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="space-y-1 p-1.5">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={cn(
                      'flex items-center p-2 rounded-lg cursor-pointer transition-all',
                      'hover:bg-slate-50 active:bg-slate-100',
                      activeContact?.id === contact.id ? 'bg-slate-50' : ''
                    )}
                    onClick={() => {
                      setActiveContact(contact)
                      // Mark messages as read
                      setContacts(prev => 
                        prev.map(c => 
                          c.id === contact.id 
                            ? { ...c, unreadCount: 0 } 
                            : c
                        )
                      )
                    }}
                  >
                    <div className="relative mr-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary font-medium text-sm">
                        {contact.avatar}
                      </div>
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-sm text-gray-900 truncate">{contact.name}</h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500 truncate max-w-[140px]">
                          {contact.isTyping 
                            ? <span className="text-primary font-medium">typing...</span> 
                            : messages[contact.id]?.[messages[contact.id]?.length - 1]?.text || 'No messages yet'}
                        </p>
                        {contact.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs ml-2">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-3 flex flex-col border-l-0 rounded-l-none">
            <CardHeader className="border-b p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-primary/10 text-primary font-medium text-sm">
                    {activeContact.avatar}
                  </div>
                  {activeContact.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-900 truncate">{activeContact.name}</h2>
                    {activeContact.isTyping && (
                      <span className="text-xs text-primary font-medium">typing...</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeContact.online 
                      ? 'Online' 
                      : `Last seen ${activeContact.lastSeen || 'recently'}`}
                  </p>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                  {messages[activeContact.id]?.map((m) => (
                    <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div className={cn(
                        'max-w-[85%] rounded-2xl p-3',
                        m.fromMe 
                          ? 'bg-primary text-white rounded-br-sm' 
                          : 'bg-white text-gray-900 rounded-bl-sm shadow-xs'
                      )}>
                        {m.type === 'image' && m.imageUrl && (
                          <div className="mb-2 rounded-lg overflow-hidden max-w-[300px]">
                            <img 
                              src={m.imageUrl} 
                              alt="Sent" 
                              className="max-h-[300px] w-auto object-cover rounded-lg"
                            />
                          </div>
                        )}
                        {m.text && <div className="text-sm leading-relaxed">{m.text}</div>}
                        <div className={cn(
                          'text-[11px] mt-1.5 flex items-center justify-end gap-1',
                          m.fromMe ? 'text-white/70' : 'text-gray-400'
                        )}>
                          {new Date(m.ts).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })}
                          {m.fromMe && m.status === 'read' && (
                            <span className="text-blue-200 ml-0.5">✓✓</span>
                          )}
                          {m.fromMe && m.status === 'delivered' && (
                            <span className="ml-0.5">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeContact.isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 text-slate-900 rounded-2xl rounded-bl-none p-3 max-w-[80%]">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-24 w-auto rounded-lg border border-gray-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null)
                      setImagePreview(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }} 
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="h-11 rounded-lg border-gray-200 focus-visible:ring-1 focus-visible:ring-primary/50 pr-12"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:bg-gray-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() && !selectedImage}
                  size="icon"
                  className="h-11 w-11 rounded-lg bg-primary hover:bg-primary/90 text-white flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}