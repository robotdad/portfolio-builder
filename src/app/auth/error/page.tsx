'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const errorMessages = [
  {
    headline: "The velvet rope is up",
    subtext: "This backstage area is reserved for authorized visitors"
  },
  {
    headline: "Not on the call sheet", 
    subtext: "Only listed cast and crew may enter the production office"
  },
  {
    headline: "The costume closet is locked",
    subtext: "You'll need the right key to access the wardrobe department"
  },
  {
    headline: "Intermission only",
    subtext: "The stage door is currently closed to visitors"
  },
  {
    headline: "Wrong dressing room",
    subtext: "This entrance is reserved for the principal cast"
  }
]

function TheaterMaskIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  )
}

function ErrorContent() {
  // Available for future use (e.g., error type from query params)
  const _searchParams = useSearchParams()
  
  // Random message selected on client-side render (Suspense ensures client-only)
  const [message] = useState(() => {
    const randomIndex = Math.floor(Math.random() * errorMessages.length)
    return errorMessages[randomIndex]
  })

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <TheaterMaskIcon />
        </div>
        
        <h1 className="auth-title">{message.headline}</h1>
        <p className="auth-subtitle">{message.subtext}</p>
        
        <div className="auth-actions">
          <Link href="/" className="btn btn--primary">
            Return Home
          </Link>
          <Link href="/auth/signin" className="btn btn--ghost">
            Try Again
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-icon">
            <TheaterMaskIcon />
          </div>
          <h1 className="auth-title">Loading...</h1>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
