'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  )
}

function Spinner() {
  return (
    <div className="spinner">
      <style jsx>{`
        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e5e5e5;
          border-top-color: #666;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function CLILoginContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callback')
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<'checking' | 'authenticating' | 'redirecting' | 'error'>('checking')
  const processedRef = useRef(false)

  useEffect(() => {
    // Prevent double-processing in strict mode
    if (processedRef.current) return
    processedRef.current = true

    async function handleAuth() {
      // Store callback URL in session storage (needed after OAuth redirect)
      if (callbackUrl) {
        sessionStorage.setItem('cli-callback', callbackUrl)
      }

      // Try to get the session token - this tells us if we're authenticated
      try {
        const res = await fetch('/api/auth/cli-token')
        
        if (res.ok) {
          // We're authenticated! Redirect to CLI callback
          setPhase('redirecting')
          
          const data = await res.json()
          const callback = callbackUrl || sessionStorage.getItem('cli-callback')
          
          if (!callback) {
            setPhase('error')
            setError('Missing callback URL. Please run the auth command again.')
            return
          }
          
          // Clean up session storage
          sessionStorage.removeItem('cli-callback')
          
          // Build callback URL with session info
          const url = new URL(callback)
          url.searchParams.set('session', data.cookie)
          url.searchParams.set('email', data.email || '')
          
          // Redirect to CLI callback server
          window.location.href = url.toString()
        } else {
          // Not authenticated - start OAuth flow
          setPhase('authenticating')
          signIn('google', { callbackUrl: '/auth/cli-login' })
        }
      } catch {
        // Network error or other issue - try OAuth anyway
        setPhase('authenticating')
        signIn('google', { callbackUrl: '/auth/cli-login' })
      }
    }

    handleAuth()
  }, [callbackUrl])

  return (
    <>
      {phase === 'error' ? (
        <>
          <p className="auth-error" style={{ color: '#dc2626', marginBottom: '1rem' }}>
            {error}
          </p>
          <p className="auth-subtitle">
            Return to your terminal and try again.
          </p>
        </>
      ) : phase === 'checking' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
            <Spinner />
          </div>
          <p className="auth-subtitle">
            Checking authentication...
          </p>
        </>
      ) : phase === 'authenticating' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
            <Spinner />
          </div>
          <p className="auth-subtitle">
            Redirecting to Google sign-in...
          </p>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
            <Spinner />
          </div>
          <p className="auth-subtitle">
            Authenticated! Returning to CLI...
          </p>
        </>
      )}
    </>
  )
}

export default function CLILoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <TerminalIcon />
        </div>
        
        <h1 className="auth-title">CLI Authentication</h1>
        
        <Suspense fallback={
          <>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
              <Spinner />
            </div>
            <p className="auth-subtitle">Loading...</p>
          </>
        }>
          <CLILoginContent />
        </Suspense>
        
        <p className="auth-disclaimer">
          This will authorize your terminal to access the Portfolio API
        </p>
      </div>
    </div>
  )
}
