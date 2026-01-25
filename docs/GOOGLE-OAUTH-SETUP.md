# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth authentication for your portfolio deployment.

---

## Overview

The portfolio uses Google OAuth 2.0 for admin authentication. This provides:

- Secure sign-in without managing passwords
- Email-based allowlisting for access control
- Session management via Auth.js (NextAuth)

---

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Your deployment URL (for production setup)

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Click the project dropdown at the top of the page

3. Click **New Project**

4. Enter a project name (e.g., "Portfolio Auth")

5. Click **Create**

6. Wait for the project to be created, then select it from the project dropdown

---

## Step 2: Configure OAuth Consent Screen

Before creating credentials, you must configure the OAuth consent screen:

1. Go to [Google Auth Platform](https://console.cloud.google.com/auth/overview) in Google Cloud Console

2. If you see "Google Auth Platform not configured yet", click **Get started**

3. **Step 1 - App Information**:
   | Field | Value |
   |-------|-------|
   | App name | Your portfolio name (e.g., "PortfolioBuilder") |
   | User support email | Your email (select from dropdown) |
   
   Click **Next**

4. **Step 2 - Audience**:
   - Select **External** (allows any Google account to sign in)
   - Note: "Internal" is only available for Google Workspace organizations
   
   Click **Next**

5. **Step 3 - Contact Information**:
   - Enter your email address for developer contact
   
   Click **Next**

6. **Step 4 - Finish**:
   - Review your settings
   - Check the agreement checkbox
   - Click **Create**

7. After creation, go to **Audience** in the left sidebar to configure test users (see below)

### Publishing Status

- **Testing**: Only test users can sign in (up to 100 users)
- **Production**: Anyone with a Google account can attempt to sign in

For a personal portfolio, you can leave it in "Testing" and add yourself as a test user. The app's allowlist (AllowedEmail table) provides the actual access control.

---

## Step 3: Create OAuth 2.0 Credentials

1. In the left sidebar, go to **APIs & Services** > **Credentials**

2. Click **Create Credentials** > **OAuth client ID**

3. Select **Web application** as the application type

4. Enter a name (e.g., "Portfolio Web Client")

5. Configure **Authorized JavaScript origins**:

   | Environment | Origin |
   |-------------|--------|
   | Local development | `http://localhost:3000` |
   | Production | `https://yourdomain.com` |

6. Configure **Authorized redirect URIs**:

   | Environment | Redirect URI |
   |-------------|--------------|
   | Local development | `http://localhost:3000/api/auth/callback/google` |
   | Production | `https://yourdomain.com/api/auth/callback/google` |

7. Click **Create**

8. **Important**: Copy and save both values:
   - **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-AbCdEf123456`)

---

## Step 4: Configure Environment Variables

Add the following to your `.env` file:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"

# Auth.js Secret (generate a random string)
AUTH_SECRET="your-random-secret-here"

# Optional: Explicit callback URL (usually auto-detected)
# NEXTAUTH_URL="http://localhost:3000"
```

### Generating AUTH_SECRET

Generate a secure random string for `AUTH_SECRET`:

```bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | OAuth 2.0 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth 2.0 Client Secret from Google Cloud Console |
| `AUTH_SECRET` | Yes | Random string for encrypting session tokens |
| `NEXTAUTH_URL` | No | Base URL of your app (auto-detected in most cases) |

---

## Step 5: Configure Allowed Emails

The portfolio uses an allowlist to control who can access the admin area. Add authorized emails to the `AllowedEmail` table:

```bash
# Using Prisma Studio
npx prisma studio
# Navigate to AllowedEmail table and add entries

# Or via Prisma CLI
npx prisma db seed
# (if you have a seed script configured)
```

### AllowedEmail Schema

```prisma
model AllowedEmail {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
}
```

Only emails in this table will be granted admin access after OAuth authentication.

---

## Step 6: Test the OAuth Flow

### Local Development

1. Ensure your `.env` file has all required variables

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to your sign-in page (e.g., `http://localhost:3000/admin`)

4. Click "Sign in with Google"

5. Select your Google account

6. Verify you're redirected back and authenticated

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Error 400: redirect_uri_mismatch" | Check that your redirect URI in Google Console exactly matches your app URL |
| "Access blocked: App not verified" | Add yourself as a test user in OAuth consent screen |
| "Invalid client" | Verify GOOGLE_CLIENT_ID is correct |
| Session not persisting | Check AUTH_SECRET is set and consistent across restarts |

---

## Production Deployment

### Checklist

- [ ] Create separate OAuth credentials for production (recommended)
- [ ] Add production URLs to authorized origins and redirect URIs
- [ ] Set environment variables in your hosting platform
- [ ] Add authorized emails to the AllowedEmail table
- [ ] Test the complete sign-in flow

### Platform-Specific Notes

#### Vercel

Set environment variables in Project Settings > Environment Variables:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AUTH_SECRET`

Vercel automatically sets `NEXTAUTH_URL` based on your deployment URL.

#### Docker

Pass environment variables via docker-compose or `-e` flags:
```yaml
environment:
  - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
  - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
  - AUTH_SECRET=${AUTH_SECRET}
```

#### VPS/Bare Metal

Use a `.env` file or system environment variables. Ensure the file is not committed to version control.

---

## Security Best Practices

1. **Never commit secrets**: Add `.env` to `.gitignore`

2. **Use separate credentials per environment**: Create different OAuth clients for development, staging, and production

3. **Rotate secrets periodically**: Generate new `AUTH_SECRET` values periodically

4. **Limit OAuth scopes**: Only request the scopes you need (email, profile, openid)

5. **Monitor access**: Review the AllowedEmail table periodically

6. **Use HTTPS in production**: OAuth requires HTTPS for redirect URIs in production

---

## Reference

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Auth.js (NextAuth) Google Provider](https://authjs.dev/reference/core/providers/google)
- [Google Cloud Console](https://console.cloud.google.com/)
