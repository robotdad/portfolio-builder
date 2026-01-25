/**
 * AllowedEmail Database Operations
 *
 * Helper functions for managing the email allowlist.
 * Used by the authentication system to verify authorized users.
 */

import { prisma } from '@/lib/prisma'

/**
 * Add an email to the allowlist.
 *
 * @param email - Email address to add (will be normalized to lowercase)
 * @returns The created AllowedEmail record
 */
export async function addAllowedEmail(email: string) {
  return prisma.allowedEmail.create({
    data: { email: email.toLowerCase() },
  })
}

/**
 * Check if an email is in the allowlist.
 *
 * @param email - Email address to check (case-insensitive)
 * @returns true if the email is allowed, false otherwise
 */
export async function isEmailAllowed(email: string): Promise<boolean> {
  const record = await prisma.allowedEmail.findUnique({
    where: { email: email.toLowerCase() },
  })
  return !!record
}

/**
 * Get all allowed emails.
 *
 * @returns Array of AllowedEmail records, ordered by creation date
 */
export async function getAllAllowedEmails() {
  return prisma.allowedEmail.findMany({
    orderBy: { createdAt: 'asc' },
  })
}

/**
 * Remove an email from the allowlist.
 *
 * @param email - Email address to remove (case-insensitive)
 * @returns The deleted AllowedEmail record
 * @throws Error if the email is not found
 */
export async function removeAllowedEmail(email: string) {
  return prisma.allowedEmail.delete({
    where: { email: email.toLowerCase() },
  })
}
