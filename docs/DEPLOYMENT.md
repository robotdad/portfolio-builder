# Deployment Guide

This guide covers deploying the portfolio application to Azure App Service with custom domain support.

## Overview

This application is designed for single-user deployment. It uses:
- **SQLite** for local development
- **Azure SQL Database (Serverless)** for production
- **Azure Blob Storage** for image hosting in production
- **Google OAuth** for admin authentication

## Prerequisites

Before deploying, ensure you have:

- [ ] Azure account with active subscription ([Create free account](https://azure.microsoft.com/free/))
- [ ] Google OAuth credentials configured ([Setup Guide](./GOOGLE-OAUTH-SETUP.md))
- [ ] Azure Blob Storage configured ([Azure Setup Guide](./AZURE_SETUP.md))
- [ ] Azure SQL Database configured ([Database Setup](#azure-sql-database-setup))

## Azure SQL Database Setup

### Why Azure SQL Instead of SQLite?

Azure App Service uses an SMB-mounted network share for its file system. SQLite requires exclusive file locks that network file systems cannot reliably provide, leading to data corruption. Azure SQL Database provides proper concurrency handling.

### Create Azure SQL Database (Serverless)

#### Azure Portal Method

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** → **SQL Database**
3. Configure the basics:

   | Setting | Value |
   |---------|-------|
   | **Subscription** | Your subscription |
   | **Resource Group** | Use same as storage account (e.g., `portfolio-rg`) |
   | **Database name** | `portfolio` |
   | **Server** | Create new (see below) |

4. **Create new server**:
   | Setting | Value |
   |---------|-------|
   | **Server name** | Globally unique (e.g., `portfolio-sql-server`) |
   | **Location** | Same as App Service |
   | **Authentication** | SQL authentication |
   | **Admin login** | Choose a username |
   | **Password** | Strong password |

5. **Compute + storage**: Click **Configure database**
   - Select **Serverless** compute tier
   - Set min vCores: 0.5
   - Set max vCores: 1
   - Enable **Auto-pause** (saves money when idle)
   - Storage: 5 GB (minimum)

6. Click **Review + create** → **Create**

#### Azure CLI Method

```bash
# Create SQL Server
az sql server create \
  --name portfolio-sql-server \
  --resource-group portfolio-rg \
  --location eastus \
  --admin-user sqladmin \
  --admin-password 'YourStrongPassword!'

# Create serverless database
az sql db create \
  --name portfolio \
  --resource-group portfolio-rg \
  --server portfolio-sql-server \
  --compute-model Serverless \
  --edition GeneralPurpose \
  --family Gen5 \
  --min-capacity 0.5 \
  --max-capacity 1 \
  --auto-pause-delay 60

# Allow Azure services to access
az sql server firewall-rule create \
  --name AllowAzureServices \
  --resource-group portfolio-rg \
  --server portfolio-sql-server \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Get Connection String

1. Open your SQL Database in Azure Portal
2. Go to **Settings** → **Connection strings**
3. Copy the **ADO.NET** connection string
4. Replace `{your_password}` with your actual password

**Format for Prisma:**
```
sqlserver://portfolio-sql-server.database.windows.net:1433;database=portfolio;user=sqladmin;password=YourPassword;encrypt=true;trustServerCertificate=false
```

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
   | **Name** | Globally unique (e.g., `sasha-portfolio`) - becomes `sasha-portfolio.azurewebsites.net` |
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
  --name sasha-portfolio \
  --resource-group portfolio-rg \
  --plan portfolio-plan \
  --runtime "NODE:20-lts"
```

### Step 2: Build and Deploy Manually

This application uses manual deployment (no CI/CD).

#### Build Locally

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

#### Deploy via ZIP

1. Create a deployment package:
   ```bash
   # Create zip of necessary files
   zip -r deploy.zip .next package.json package-lock.json public prisma node_modules
   ```

2. Deploy via Azure CLI:
   ```bash
   az webapp deployment source config-zip \
     --name sasha-portfolio \
     --resource-group portfolio-rg \
     --src deploy.zip
   ```

#### Alternative: Deploy via FTP/FTPS

1. In Azure Portal, go to your App Service
2. Go to **Deployment** → **Deployment Center**
3. Select **FTPS credentials** tab
4. Use an FTP client to upload:
   - `.next/` folder
   - `package.json` and `package-lock.json`
   - `public/` folder
   - `prisma/` folder
   - `node_modules/` folder

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

### Step 5: Run Database Migrations

After first deployment, initialize the database:

```bash
# SSH into App Service (Azure Portal → Development Tools → SSH)
cd /home/site/wwwroot
npx prisma migrate deploy
```

Or run from local machine with production DATABASE_URL:
```bash
DATABASE_URL="your-azure-sql-connection-string" npx prisma migrate deploy
```

### Step 6: Verify Deployment

1. Go to **Overview** and click the **URL** (e.g., `https://sasha-portfolio.azurewebsites.net`)
2. Verify the site loads correctly
3. Test admin login at `/admin`
4. Test image upload functionality

### Step 7: Add Custom Domain

For custom domain setup with Namecheap or other DNS providers, see the [Domain Setup Guide](./DOMAIN_SETUP.md).

## Environment Variables Checklist

All environment variables needed for production deployment:

### Database

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Azure SQL connection string (see format above) |

### Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes | Random 32-byte string for session encryption |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `NEXTAUTH_URL` | Yes | Full URL of your site (e.g., `https://sasha-portfolio.azurewebsites.net`) |

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
# Database (Azure SQL)
DATABASE_URL=sqlserver://portfolio-sql-server.database.windows.net:1433;database=portfolio;user=sqladmin;password=xxx;encrypt=true

# Authentication
AUTH_SECRET=your-32-byte-random-string-here
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
NEXTAUTH_URL=https://sasha-portfolio.azurewebsites.net

# Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=portfoliostorage;AccountKey=xxx;EndpointSuffix=core.windows.net
```

## Post-Deployment Steps

### 1. Update Google OAuth Redirect URIs

Add your production URL to Google Cloud Console:

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://sasha-portfolio.azurewebsites.net/api/auth/callback/google
   ```
4. If using custom domain, also add:
   ```
   https://portfolio.sashagoodner.com/api/auth/callback/google
   ```

### 2. Test Full Workflow

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
| Database connection fails | Firewall rules | Add App Service IP to SQL firewall |
| Database timeout | Serverless cold start | First request takes ~10s to wake database |

### View Logs

```bash
# Stream live logs
az webapp log tail --name sasha-portfolio --resource-group portfolio-rg

# Or in Portal: Monitoring → Log stream
```

### Database Cold Start

Azure SQL Serverless auto-pauses after 1 hour of inactivity. The first request after pause takes ~10 seconds while the database wakes up. This is normal and expected for cost savings.

## Local Development

Local development continues to use SQLite - no Azure SQL needed:

```bash
# Uses SQLite automatically
npm run dev
```

The application detects the environment and uses the appropriate database:
- `DATABASE_URL` starts with `file:` → SQLite
- `DATABASE_URL` starts with `sqlserver:` → Azure SQL

## Related Documentation

- [Azure Blob Storage Setup](./AZURE_SETUP.md) - Configure image storage
- [Domain Configuration](./DOMAIN_SETUP.md) - Set up custom domain with Namecheap
- [Google OAuth Setup](./GOOGLE-OAUTH-SETUP.md) - Configure authentication
