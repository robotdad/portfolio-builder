'use client'

import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'

interface UserSessionPanelProps {
  variant?: 'sidebar' | 'drawer'
}

/**
 * UserSessionPanel - Displays user session info and sign-out button
 * 
 * Features:
 * - Shows authenticated user's email with truncation
 * - Ghost-style sign-out button
 * - Separator line above to delineate from navigation
 * - 44px minimum touch target for sign-out on mobile
 * - Supports sidebar and drawer variants
 */
export function UserSessionPanel({ variant = 'sidebar' }: UserSessionPanelProps) {
  const { data: session } = useSession()
  
  if (!session?.user) {
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const email = session.user.email || 'Unknown user'

  return (
    <div className={`user-session-panel user-session-panel--${variant}`}>
      <div className="user-session-panel__separator" />
      <div className="user-session-panel__content">
        <div className="user-session-panel__user" title={email}>
          <span className="user-session-panel__email">{email}</span>
        </div>
        <button 
          onClick={handleSignOut}
          className="user-session-panel__signout"
          type="button"
        >
          Sign out
        </button>
      </div>
      <style jsx>{`
        .user-session-panel {
          padding: 0 var(--admin-sidebar-padding, 16px);
          margin-top: auto;
        }
        
        .user-session-panel__separator {
          border-top: 1px solid var(--admin-border-color, #e5e7eb);
          margin-bottom: 12px;
        }
        
        .user-session-panel__content {
          padding-bottom: 16px;
        }
        
        .user-session-panel__user {
          margin-bottom: 8px;
        }
        
        .user-session-panel__email {
          font-size: 14px;
          color: var(--admin-text-muted, #6b7280);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
          max-width: 100%;
        }
        
        .user-session-panel__signout {
          background: none;
          border: none;
          padding: 8px 0;
          font-size: 14px;
          color: var(--admin-text-muted, #6b7280);
          cursor: pointer;
          min-height: 44px;
          display: flex;
          align-items: center;
        }
        
        .user-session-panel__signout:hover {
          color: var(--admin-text-primary, #111827);
        }
        
        .user-session-panel--drawer .user-session-panel__signout {
          width: 100%;
        }
      `}</style>
    </div>
  )
}

export default UserSessionPanel
