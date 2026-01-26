import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'

/**
 * CLI Token endpoint - returns the session cookie for CLI authentication
 * 
 * This endpoint is used by the CLI login flow to get the session cookie
 * that can be stored locally and used for API calls.
 * 
 * Security: Only returns cookie to authenticated users viewing their own session
 */
export async function GET(request: NextRequest) {
  // Get the current session
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }
  
  // Get the session cookie from the request
  // NextAuth v5 uses authjs.session-token (or __Secure- prefix in production)
  const cookieNames = [
    'authjs.session-token',
    '__Secure-authjs.session-token',
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
  ]
  
  let sessionCookie: string | null = null
  let cookieName: string | null = null
  
  for (const name of cookieNames) {
    const cookie = request.cookies.get(name)
    if (cookie) {
      sessionCookie = cookie.value
      cookieName = name
      break
    }
  }
  
  if (!sessionCookie || !cookieName) {
    return NextResponse.json(
      { error: 'Session cookie not found' },
      { status: 400 }
    )
  }
  
  // Return the cookie in a format the CLI can use
  return NextResponse.json({
    cookie: `${cookieName}=${sessionCookie}`,
    email: session.user.email,
    expires: session.expires,
  })
}
