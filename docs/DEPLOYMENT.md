# Deployment Guide

This guide covers deploying the portfolio application to Azure App Service.

## Overview

The application uses:
- **PostgreSQL** for both local development and production
- **Azure App Service** with git-based deployment
- **Azure PostgreSQL Flexible Server** for the database
- **Azure Blob Storage** for image hosting
- **Google OAuth** for admin authentication

## Prerequisites

Before deploying, ensure you have:

- [ ] Azure account with active subscription ([Create free account](https://azure.microsoft.com/free/))
- [ ] Azure CLI installed and logged in (`az login`)
- [ ] Google OAuth credentials configured ([Setup Guide](./GOOGLE-OAUTH-SETUP.md))
- [ ] Custom domain configured (optional) ([Domain Setup Guide](./DOMAIN_SETUP.md))

---

## Azure Infrastructure Setup

### Option 1: Simplified Setup (Recommended)

This creates a straightforward deployment without VNet complexity:

```bash
# Variables - customize these
RESOURCE_GROUP="portfolio-rg"
LOCATION="centralus"
APP_NAME="your-portfolio"
DB_SERVER_NAME="your-portfolio-db"
DB_NAME="portfolio"
DB_ADMIN="portfolioadmin"
DB_PASSWORD="YourSecurePassword123!"  # Use a strong password
STORAGE_NAME="yourportfoliostore"     # Must be globally unique, lowercase

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create PostgreSQL Flexible Server (public access with firewall)
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER_NAME \
  --location $LOCATION \
  --admin-user $DB_ADMIN \
  --admin-password "$DB_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16 \
  --public-access 0.0.0.0

# Create the database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER_NAME \
  --database-name $DB_NAME

# Create App Service Plan
az appservice plan create \
  --name "${APP_NAME}-plan" \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan "${APP_NAME}-plan" \
  --runtime "NODE:22-lts"

# Create Storage Account
az storage account create \
  --name $STORAGE_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --allow-blob-public-access true

# Create blob container
az storage container create \
  --name portfolio-images \
  --account-name $STORAGE_NAME \
  --public-access blob \
  --auth-mode login

# Get storage connection string
STORAGE_CONN=$(az storage account show-connection-string \
  --name $STORAGE_NAME \
  --resource-group $RESOURCE_GROUP \
  --output tsv)

# Configure App Service settings
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings \
    DATABASE_URL="postgresql://${DB_ADMIN}:${DB_PASSWORD}@${DB_SERVER_NAME}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require" \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONN" \
    AZURE_STORAGE_CONTAINER_NAME="portfolio-images" \
    GOOGLE_CLIENT_ID="your-google-client-id" \
    GOOGLE_CLIENT_SECRET="your-google-client-secret" \
    AUTH_SECRET="$(openssl rand -base64 32)" \
    NEXTAUTH_URL="https://${APP_NAME}.azurewebsites.net" \
    NODE_ENV="production" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true"

# Set startup command
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --startup-file "npm run start:azure"

# Configure local git deployment
az webapp deployment source config-local-git \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP

# Get deployment URL
DEPLOY_URL=$(az webapp deployment source config-local-git \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query url --output tsv)

echo "Add git remote: git remote add azure $DEPLOY_URL"
```

### Option 2: Azure Portal

See [Azure Portal Setup](#azure-portal-setup) at the end of this document.

---

## Deployment Workflow

### Initial Setup

1. **Add the Azure git remote:**
   ```bash
   git remote add azure <deployment-url-from-setup>
   ```

2. **Create local production environment file:**
   
   Create `.env.production.local` (gitignored) with production secrets:
   ```bash
   # Production secrets (DO NOT COMMIT)
   DATABASE_URL="postgresql://user:pass@server.postgres.database.azure.com:5432/portfolio?sslmode=require"
   AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
   AZURE_STORAGE_CONTAINER_NAME="portfolio-images"
   API_BASE="https://your-app.azurewebsites.net/api"
   ```

3. **Run database migrations:**
   ```bash
   npm run db:migrate:prod
   ```

4. **Add your admin email:**
   ```bash
   npm run db:seed-admin:prod your-email@gmail.com
   ```

5. **Deploy the application:**
   ```bash
   npm run build                    # Verify it builds locally first!
   git push azure main              # Deploy to Azure (takes 15-20 min)
   ```

### Subsequent Deployments

```bash
npm run build                       # Always verify local build
git add -A && git commit -m "description"
git push azure main                 # Deploy
```

After deployment, restart the app to pick up changes:
```bash
az webapp restart --resource-group portfolio-rg --name your-app
```

---

## Production Scripts

The project includes `:prod` variants of scripts that run against production using `.env.production.local`:

| Script | Description |
|--------|-------------|
| `npm run db:migrate:prod` | Run Prisma migrations on production database |
| `npm run db:seed-admin:prod <email>` | Add an allowed email to production |
| `npm run db:reset:prod` | Reset production database (preserves AllowedEmail table) |
| `npm run test:populate:sarah:prod` | Populate production with test persona |

### Authentication for Scripts

Some scripts require authentication against the production site:

```bash
# One-time login (stores session cookie locally)
APP_BASE=https://your-app.azurewebsites.net npm run auth:login

# Check auth status
npm run auth:status

# Log out
npm run auth:logout
```

---

## Environment Variables

### Required for Production

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@server.postgres.database.azure.com:5432/db?sslmode=require` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxxxx` |
| `AUTH_SECRET` | Session encryption key (32 bytes) | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Full URL of your site | `https://your-app.azurewebsites.net` |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection | From Azure Portal |
| `AZURE_STORAGE_CONTAINER_NAME` | Blob container name | `portfolio-images` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | Enable Oryx build | `true` |

---

## Custom Domain & SSL

### Add Custom Domain

1. **Configure DNS** (at your registrar, e.g., Namecheap):
   - Add CNAME: `www` → `your-app.azurewebsites.net`
   - Or for apex domain, add A record pointing to App Service IP

2. **Add domain in Azure:**
   ```bash
   az webapp config hostname add \
     --resource-group portfolio-rg \
     --webapp-name your-app \
     --hostname your-domain.com
   ```

3. **Create free managed SSL certificate:**
   ```bash
   az webapp config ssl create \
     --resource-group portfolio-rg \
     --name your-app \
     --hostname your-domain.com
   
   # Get the certificate thumbprint
   THUMBPRINT=$(az webapp config ssl list \
     --resource-group portfolio-rg \
     --query "[?name=='your-domain.com'].thumbprint" -o tsv)
   
   # Bind the certificate
   az webapp config ssl bind \
     --resource-group portfolio-rg \
     --name your-app \
     --certificate-thumbprint $THUMBPRINT \
     --ssl-type SNI
   ```

4. **Update NEXTAUTH_URL:**
   ```bash
   az webapp config appsettings set \
     --resource-group portfolio-rg \
     --name your-app \
     --settings NEXTAUTH_URL="https://your-domain.com"
   ```

5. **Update Google OAuth redirect URIs** in Google Cloud Console:
   - Add: `https://your-domain.com/api/auth/callback/google`

See [Domain Setup Guide](./DOMAIN_SETUP.md) for detailed instructions.

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 500 error on startup | Missing environment variables | Check all required vars are set |
| Database connection fails | Firewall or credentials | Verify DATABASE_URL and firewall rules |
| OAuth "Bad Request" | Missing `trustHost` in NextAuth | Already fixed in codebase |
| Images not uploading | Storage not configured | Check AZURE_STORAGE_* variables |
| Build fails remotely | TypeScript errors | Run `npm run build` locally first |
| Site shows old data after reset | App caching | Restart app: `az webapp restart ...` |

### View Logs

```bash
# Stream live logs
az webapp log tail --resource-group portfolio-rg --name your-app

# Download log files
az webapp log download --resource-group portfolio-rg --name your-app
```

### Check App Settings

```bash
az webapp config appsettings list \
  --resource-group portfolio-rg \
  --name your-app \
  --output table
```

### Restart App

```bash
az webapp restart --resource-group portfolio-rg --name your-app
```

---

## File Structure for Deployment

These files are relevant to deployment:

```
portfolio/
├── .env.example              # Template for environment variables
├── .env.production.local     # Production secrets (gitignored)
├── server.js                 # Custom server for Azure
├── package.json              # Includes start:azure script
└── src/
    └── prisma/
        ├── schema.prisma     # Database schema
        └── migrations/       # PostgreSQL migrations
```

---

## Architecture Notes

### Why PostgreSQL (not SQLite)?

Azure App Service uses network-mounted storage that doesn't support SQLite's file locking properly. PostgreSQL provides reliable concurrent access.

### Why Public PostgreSQL (not VNet)?

Private VNet adds enterprise-grade complexity:
- Can't run migrations from local machine
- Requires complex network configuration
- Overkill for a personal portfolio site

Public PostgreSQL with firewall rules provides adequate security for this use case.

### Why Git Deployment (not ZIP)?

Git-based deployment with Oryx builder:
- Handles `npm install` and `npm run build` automatically
- Caches node_modules between deployments
- Provides consistent, repeatable builds
- Shows build output in deployment logs

---

## Related Documentation

- [Azure Blob Storage Setup](./AZURE_SETUP.md) - Configure image storage
- [Domain Configuration](./DOMAIN_SETUP.md) - Set up custom domain
- [Google OAuth Setup](./GOOGLE-OAUTH-SETUP.md) - Configure authentication
- [Architecture Overview](./ARCHITECTURE.md) - System design details

---

## Azure Portal Setup

If you prefer the Azure Portal over CLI:

### 1. Create Resource Group
- Go to [Azure Portal](https://portal.azure.com)
- Create a resource → Resource group
- Name: `portfolio-rg`, Region: your choice

### 2. Create PostgreSQL Flexible Server
- Create a resource → Azure Database for PostgreSQL Flexible Server
- Server name: `your-portfolio-db`
- Compute: Burstable B1ms
- Storage: 32 GB
- Authentication: PostgreSQL authentication only
- **Networking: Public access** with "Allow public access from any Azure service"

### 3. Create Storage Account
- Create a resource → Storage account
- Name: globally unique, lowercase
- Performance: Standard
- Redundancy: LRS
- After creation: Create container `portfolio-images` with Blob public access

### 4. Create App Service
- Create a resource → Web App
- Runtime: Node 22 LTS
- OS: Linux
- Plan: B1 or higher (needed for custom domains)
- After creation: Configure → Application settings → Add all environment variables

### 5. Configure Deployment
- Deployment Center → Local Git
- Copy the Git Clone URL
- Add as remote: `git remote add azure <url>`
