# Deployment Guide

This guide covers deploying the portfolio application to Azure App Service with custom domain support.

## Overview

This application is designed for single-user deployment. It uses:
- **SQLite** for the database (simple, no external service needed)
- **Azure Blob Storage** for image hosting in production
- **Google OAuth** for admin authentication

## Prerequisites

Before deploying, ensure you have:

- [ ] Azure account with active subscription ([Create free account](https://azure.microsoft.com/free/))
- [ ] GitHub repository with your portfolio code
- [ ] Google OAuth credentials configured ([Setup Guide](./GOOGLE-OAUTH-SETUP.md))
- [ ] Azure Blob Storage configured ([Azure Setup Guide](./AZURE_SETUP.md))

## Azure App Service Deployment

### Step 1: Create App Service

#### Azure Portal Method

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** → **Web App**
3. Configure the basics:

   | Setting | Value |
   |---------|-------|
   | **Subscription** | Your subscription |
   | **Resource Group** | Use same as storage account (e.g., `portfolio-rg`) |
   | **Name** | Globally unique (e.g., `myportfolio`) - becomes `myportfolio.azurewebsites.net` |
   | **Publish** | Code |
   | **Runtime stack** | Node 20 LTS |
   | **Operating System** | Linux |
   | **Region** | Same as storage account |

4. **App Service Plan**: Create new or use existing
   - For testing: Free F1 tier
   - For production: Basic B1 or higher (needed for custom domains)

5. Click **Review + create** → **Create**

#### Azure CLI Method

```bash
# Create App Service plan
az appservice plan create \
  --name portfolio-plan \
  --resource-group portfolio-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name myportfolio \
  --resource-group portfolio-rg \
  --plan portfolio-plan \
  --runtime "NODE:20-lts"
```

### Step 2: Configure GitHub Deployment

1. In Azure Portal, open your App Service
2. Go to **Deployment** → **Deployment Center**
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Source** | GitHub |
   | **Organization** | Your GitHub username |
   | **Repository** | Your portfolio repo |
   | **Branch** | `main` |

4. Click **Save**

Azure will automatically:
- Create a GitHub Actions workflow in your repository
- Deploy on every push to `main`
- Run `npm install` and `npm run build`

### Step 3: Configure Environment Variables

1. Go to **Settings** → **Configuration** → **Application settings**
2. Click **+ New application setting** for each variable
3. Add all required variables (see [Environment Variables Checklist](#environment-variables-checklist))
4. Click **Save** and confirm restart

> **Important**: Don't forget to set `NEXTAUTH_URL` to your Azure URL initially, then update after adding custom domain.

### Step 4: Configure Startup Command

1. Go to **Settings** → **Configuration** → **General settings**
2. Set **Startup Command**:
   ```
   npm run start
   ```
3. Click **Save**

### Step 5: Verify Deployment

1. Go to **Overview** and click the **URL** (e.g., `https://myportfolio.azurewebsites.net`)
2. Verify the site loads correctly
3. Test admin login at `/admin`
4. Test image upload functionality

### Step 6: Add Custom Domain (Optional)

For custom domain setup with Namecheap or other DNS providers, see the [Domain Setup Guide](./DOMAIN_SETUP.md).

## Environment Variables Checklist

All environment variables needed for production deployment:

### Database

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite path: `file:./prisma/prod.db` |

### Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | Random 32-byte string for session encryption |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `NEXTAUTH_URL` | Yes | Full URL of your site (e.g., `https://myportfolio.azurewebsites.net`) |

### Storage

| Variable | Required | Description |
|----------|----------|-------------|
| `AZURE_STORAGE_CONNECTION_STRING` | Yes* | Azure storage connection string |
| `AZURE_STORAGE_ACCOUNT_NAME` | Alt* | Storage account name (if not using connection string) |
| `AZURE_STORAGE_ACCOUNT_KEY` | Alt* | Storage account key (if not using connection string) |
| `AZURE_STORAGE_CONTAINER_NAME` | No | Container name (default: `portfolio-images`) |

*Use either connection string OR account name + key

### Example Configuration

```bash
# Database
DATABASE_URL=file:./prisma/prod.db

# Authentication
AUTH_SECRET=your-32-byte-random-string-here
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
NEXTAUTH_URL=https://myportfolio.azurewebsites.net

# Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=portfoliostorage;AccountKey=xxx;EndpointSuffix=core.windows.net
```

## Post-Deployment Steps

### 1. Initialize Database

The first deployment should automatically run Prisma migrations. If not:

```bash
# SSH into App Service (Azure Portal → Development Tools → SSH)
cd /home/site/wwwroot
npx prisma migrate deploy
```

### 2. Update Google OAuth Redirect URIs

Add your production URL to Google Cloud Console:

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://myportfolio.azurewebsites.net/api/auth/callback/google
   ```
4. If using custom domain, also add:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

### 3. Test Full Workflow

- [ ] Site loads at production URL
- [ ] Can log in as admin
- [ ] Can upload images (stored in Azure Blob Storage)
- [ ] Can delete images
- [ ] Images display correctly with public URLs

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| 500 error on startup | Missing environment variables | Check all required vars are set |
| OAuth redirect error | NEXTAUTH_URL mismatch | Ensure NEXTAUTH_URL matches actual URL |
| Images not uploading | Storage not configured | Check Azure storage variables |
| Images not displaying | Container not public | Set container access to "Blob" |
| Build fails | Node version mismatch | Ensure Node 20 LTS is selected |
| Database errors | Migrations not run | Run `npx prisma migrate deploy` |

### View Logs

```bash
# Stream live logs
az webapp log tail --name myportfolio --resource-group portfolio-rg

# Or in Portal: Monitoring → Log stream
```

## Alternative Deployment Options

### Vercel

Vercel works well for the frontend but requires modifications for:
- SQLite (use Turso or PostgreSQL instead)
- File uploads (use Azure Blob Storage as configured)

### Docker

A Dockerfile can be created for containerized deployment. Key considerations:
- Mount volume for SQLite database persistence
- Set environment variables via container runtime

### VPS / Bare Metal

For self-hosted deployment:
1. Install Node.js 20 LTS
2. Clone repository
3. Run `npm install && npm run build`
4. Use PM2 or systemd to run `npm start`
5. Configure reverse proxy (nginx/Caddy) for HTTPS

## Related Documentation

- [Azure Blob Storage Setup](./AZURE_SETUP.md) - Configure image storage
- [Domain Configuration](./DOMAIN_SETUP.md) - Set up custom domain with Namecheap
- [Google OAuth Setup](./GOOGLE-OAUTH-SETUP.md) - Configure authentication
