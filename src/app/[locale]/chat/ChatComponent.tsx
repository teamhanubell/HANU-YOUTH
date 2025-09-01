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
    name: 'Siddhant',
    avatar: 'S',
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
];

const ChatClient = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageStatus, setMessageStatus] = useState<'sending' | 'delivered' | 'read'>('sending');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Load messages for selected contact
    if (selectedContact) {
      // Reset unread count when selecting a contact
      setContacts(prev => 
        prev.map(c => 
          c.id === selectedContact.id 
            ? { ...c, unreadCount: 0 } 
            : c
        )
      );
      
      // Simulate loading messages
      const loadMessages = async () => {
        // In a real app, you would fetch messages from an API
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setMessageStatus('delivered');
      };
      
      loadMessages();
    }
  }, [selectedContact]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;
    
    const tempId = `temp-${Date.now()}`;
    const message: Message = {
      id: tempId,
      text: newMessage,
      ts: Date.now(),
      fromMe: true,
      status: messageStatus,
      type: 'text'
    };
    
    setNewMessage('');
    setIsSending(true);
    
    try {
      // In a real app, you would send the message to an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update message status to delivered
      setMessageStatus('delivered');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Update message status to show error
      // @ts-ignore
      setMessageStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, you would upload the file and get a URL
    const fileUrl = URL.createObjectURL(file);
    
    const tempId = `temp-img-${Date.now()}`;
    const message: Message = {
      id: tempId,
      text: '',
      imageUrl: fileUrl,
      ts: Date.now(),
      fromMe: true,
      status: messageStatus,
      type: 'image'
    };
    
    // Simulate upload
    setTimeout(() => {
      setMessageStatus('delivered');
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">{t('chat.title')}</h2>
        </div>
        
        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="divide-y">
            {contacts.map((contact) => (
              <div 
                key={contact.id}
                className={cn(
                  'p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between',
                  selectedContact?.id === contact.id && 'bg-blue-50'
                )}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {contact.avatar}
                    </div>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-500">
                      {contact.isTyping 
                        ? t('chat.typing')
                        : contact.lastSeen || ''
                      }
                    </p>
                  </div>
                </div>
                
                {contact.unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0">
                    {contact.unreadCount}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {selectedContact.avatar}
                  </div>
                  {selectedContact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedContact.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedContact.isTyping 
                      ? t('chat.typing')
                      : selectedContact.online 
                        ? t('chat.online')
                        : t('chat.lastSeen', { time: selectedContact.lastSeen })
                    }
                  </p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedContact(null)}
                className="md:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {/* messages */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t bg-white">
              <div className="flex items-end space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-5 w-5" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder={t('chat.typeMessage')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 rounded-full min-h-[40px]"
                  />
                </div>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="icon"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {t('chat.selectContact')}
            </h3>
            <p className="text-gray-500 max-w-md">
              {t('chat.selectContactDescription')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatClient;
