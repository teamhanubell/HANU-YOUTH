'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useChatConnections } from '@/components/Chat/ConnectionsProvider'
import type { Profile } from './ProfileCard'

export default function ProfileModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const router = useRouter()
  const { addConnection, isConnected } = useChatConnections()
  const [following, setFollowing] = useState(false)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    try {
      const key = `hanu_following_${profile.id}`
      setFollowing(Boolean(localStorage.getItem(key)))
    } catch {}
    setConnected(isConnected(profile.id))
  }, [profile, isConnected])

  function toggleFollow() {
    const key = `hanu_following_${profile.id}`
    const nf = !following
    setFollowing(nf)
    try {
      if (nf) localStorage.setItem(key, '1')
      else localStorage.removeItem(key)
    } catch {}
  }

  function handleConnect() {
    // add to connections and switch to "Chat" state
    addConnection(profile)
    setConnected(true)
  }

  function openChat() {
    // navigate to chat page with query param indicating the profile id
    // close modal after navigation
    router.push(`/chat?with=${encodeURIComponent(profile.id)}`)
    onClose()
  }

  const avatar =
    profile.profileUrl && profile.profileUrl.startsWith('http')
      ? profile.profileUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=111827&color=fff&size=128`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Profile details for ${profile.name}`}
        className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{profile.name}</div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close profile"
            title="Close profile"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="px-6 py-5 flex gap-4">
          <img
            src={avatar}
            alt={`${profile.name} avatar`}
            className="w-20 h-20 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-700 dark:text-gray-200">
              {profile.title}
              {profile.org ? ` • ${profile.org}` : ''}
            </div>
            {profile.bio && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{profile.bio}</p>}

            <div className="mt-4 flex gap-3">
              <button
                onClick={toggleFollow}
                className={`px-3 py-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  following ? 'bg-green-600 text-white border-transparent' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100'
                }`}
                aria-pressed={following}
                aria-label={following ? `Unfollow ${profile.name}` : `Follow ${profile.name}`}
                title={following ? `Unfollow ${profile.name}` : `Follow ${profile.name}`}
              >
                {following ? 'Following' : 'Follow'}
              </button>

              {connected ? (
                <button
                  onClick={openChat}
                  className="px-3 py-1 rounded-md bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-1"
                  aria-label={`Open chat with ${profile.name}`}
                  title={`Open chat with ${profile.name}`}
                >
                  Chat
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  className="px-3 py-1 rounded-md bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-1"
                  aria-label={`Connect with ${profile.name}`}
                  title={`Connect with ${profile.name}`}
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}