'use client'

import React, { KeyboardEvent, useState } from 'react'
import { Card, CardHeader, CardDescription } from '@/components/ui/card'
import ProfileModal from './ProfileModal'

export type Profile = {
  id: string
  name: string
  title: string
  org?: string
  bio?: string
  profileUrl?: string
}

export default function ProfileCard({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)

  function openProfile() {
    setOpen(true)
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openProfile()
    }
  }

  const avatar =
    profile.profileUrl && profile.profileUrl.startsWith('http')
      ? profile.profileUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=111827&color=fff&size=64`

  return (
    <>
      <Card
        className="bg-gray-900/40 border-gray-700 cursor-pointer"
        onClick={openProfile}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`Open profile for ${profile.name}`}
        title={`Open profile for ${profile.name}`}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <img src={avatar} alt={`${profile.name} avatar`} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{profile.name}</div>
              <CardDescription className="text-xs text-gray-400 truncate">
                {profile.title}
                {profile.org ? ` • ${profile.org}` : ''}
              </CardDescription>
              {profile.bio && <div className="text-xs text-gray-300 mt-2 line-clamp-2">{profile.bio}</div>}
            </div>
          </div>
        </CardHeader>
      </Card>

      {open && <ProfileModal profile={profile} onClose={() => setOpen(false)} />}
    </>
  )
}