'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

import { languages } from '../../i18n/settings';

export async function generateStaticParams() {
  return languages.map((lng) => ({
    locale: lng
  }));
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
  unreadCount: number;
  isTyping: boolean;
}

interface Message {
  id: string;
  text: string;
  imageUrl?: string;
  ts: number;
  fromMe: boolean;
  status: 'sending' | 'delivered' | 'read';
  type: 'text' | 'image';
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
    name: 'Vishal',
    avatar: 'V',
    online: true, 
    unreadCount: 0,
    isTyping: true
  },
  { 
    id: 'u3', 
    name: 'Shubhang',
    avatar: 'S',
    online: false, 
    lastSeen: '2h ago',
    unreadCount: 0,
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
    name: 'Dev',
    avatar: 'D',
    online: false, 
    lastSeen: '5m ago',
    unreadCount: 0,
    isTyping: false
  },
];

export default function ChatPage() {
  const { t } = useTranslation('common');
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set first contact as active by default
  useEffect(() => {
    if (contacts.length > 0 && !activeContact) {
      setActiveContact(contacts[0]);
    }
  }, [contacts, activeContact]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContact]);

  // Simulate typing indicators
  useEffect(() => {
    const typingInterval = setInterval(() => {
      setContacts(prevContacts => {
        const randomContact = Math.floor(Math.random() * prevContacts.length);
        return prevContacts.map((contact, idx) => ({
          ...contact,
          isTyping: idx === randomContact && Math.random() > 0.7 && contact.online
        }));
      });
    }, 10000);

    return () => clearInterval(typingInterval);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !selectedImage) || !activeContact) return;

    let imageUrl = '';
    if (selectedImage) {
      // In a real app, you would upload the image to a server here
      imageUrl = URL.createObjectURL(selectedImage);
    }

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      ...(imageUrl && { imageUrl }),
      ts: Date.now(),
      fromMe: true,
      status: 'sending',
      type: selectedImage ? 'image' : 'text'
    };

    setMessages(prev => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), message]
    }));

    // Reset form
    setNewMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Simulate reply after 1-3 seconds
    if (Math.random() > 0.3) {
      const replyDelay = 1000 + Math.random() * 2000;
      const replies = [
        t('chat.replies.thanks'),
        t('chat.replies.getBack'),
        t('chat.replies.interesting'),
        t('chat.replies.tomorrow')
      ];
      
      setTimeout(() => {
        const reply: Message = {
          id: Date.now().toString(),
          text: replies[Math.floor(Math.random() * replies.length)],
          ts: Date.now(),
          fromMe: false,
          status: 'delivered',
          type: 'text'
        };

        setMessages(prev => ({
          ...prev,
          [activeContact.id]: [...(prev[activeContact.id] || []), reply]
        }));
      }, replyDelay);
    }
  };

  const updateMessageStatus = (contactId: string, messageId: string, status: 'delivered' | 'read') => {
    setMessages(prev => ({
      ...prev,
      [contactId]: (prev[contactId] || []).map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      )
    }));
  };

  if (!activeContact) return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-4 h-screen flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 flex-1 overflow-hidden rounded-lg shadow-sm">
          {/* Contacts List */}
          <Card className="md:col-span-1 overflow-hidden flex flex-col border-r border-gray-100 rounded-r-none">
            <CardHeader className="border-b p-4">
              <CardTitle className="text-lg font-semibold">{t('chat.title')}</CardTitle>
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
                      setActiveContact(contact);
                      // Mark messages as read
                      setContacts(prev => 
                        prev.map(c => 
                          c.id === contact.id 
                            ? { ...c, unreadCount: 0 } 
                            : c
                        )
                      );
                    }}
                  >
                    <div className="relative mr-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary font-medium text-sm">
                        {contact.avatar}
                      </div>
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full border-2 border-white"></span>
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
                            ? <span className="text-primary font-medium">{t('chat.typing')}</span> 
                            : messages[contact.id]?.[messages[contact.id]?.length - 1]?.text || t('chat.noMessages')}
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
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary font-medium text-sm">
                    {activeContact.avatar}
                  </div>
                  {activeContact.online && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-900 truncate">{activeContact.name}</h2>
                    {activeContact.isTyping && (
                      <span className="text-xs text-primary font-medium">{t('chat.typing')}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeContact.online 
                      ? t('chat.online')
                      : `${t('chat.lastSeen', { time: activeContact.lastSeen || t('chat.recently') })}`}
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
                        'max-w-[80%] md:max-w-[60%] rounded-lg p-3',
                        m.fromMe 
                          ? 'bg-primary text-primary-foreground rounded-br-none' 
                          : 'bg-white border border-gray-200 rounded-bl-none'
                      )}>
                        {m.type === 'image' && m.imageUrl && (
                          <div className="mb-2 rounded-md overflow-hidden">
                            <img 
                              src={m.imageUrl} 
                              alt="Sent content" 
                              className="max-w-full h-auto max-h-64 object-cover"
                            />
                          </div>
                        )}
                        <p className="break-words">{m.text}</p>
                        <div className={`flex items-center mt-1 text-xs ${m.fromMe ? 'text-primary-foreground/80' : 'text-gray-500'}`}>
                          <span className="mr-1">
                            {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {m.fromMe && (
                            <span className="ml-1">
                              {m.status === 'sending' && '🕒'}
                              {m.status === 'delivered' && '✓✓'}
                              {m.status === 'read' && '✓✓✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4 bg-white">
                {imagePreview && (
                  <div className="relative mb-3 rounded-md overflow-hidden w-32 h-32">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="p-2 rounded-full hover:bg-gray-100 cursor-pointer text-gray-500 hover:text-gray-700"
                    title={t('chat.uploadImage')}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </label>
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder={t('chat.typeMessage')}
                      className="w-full pr-12 py-5 rounded-full border-gray-300 focus-visible:ring-2 focus-visible:ring-primary/50"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <Button 
                    size="icon" 
                    className="rounded-full w-11 h-11"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !selectedImage}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
