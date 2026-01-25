# Azure Blob Storage Setup Guide

This guide walks through setting up Azure Blob Storage for production image hosting.

## Prerequisites

- Azure account with active subscription ([Create free account](https://azure.microsoft.com/free/))
- Azure CLI installed (optional, for CLI method) - [Install Guide](https://docs.microsoft.com/cli/azure/install-azure-cli)

## Step 1: Create Storage Account

### Azure Portal Method

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** → **Storage account**
3. Configure the basics:
   | Setting | Value |
   |---------|-------|
   | **Subscription** | Your subscription |
   | **Resource group** | Create new (e.g., `portfolio-rg`) or use existing |
   | **Storage account name** | Must be globally unique, lowercase, 3-24 chars (e.g., `portfoliostorage123`) |
   | **Region** | Choose closest to your users (e.g., `East US`) |
   | **Performance** | Standard |
   | **Redundancy** | LRS (Locally-redundant) for cost savings, or GRS for production |

4. Click **Review + create** → **Create**
5. Wait for deployment to complete, then click **Go to resource**

### Azure CLI Method

```bash
# Login to Azure
az login

# Create resource group (if needed)
az group create --name portfolio-rg --location eastus

# Create storage account
az storage account create \
  --name portfoliostorage123 \
  --resource-group portfolio-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2
```

## Step 2: Create Blob Container

The container holds all your uploaded images. We use **public read access** since portfolio images are meant to be viewed by visitors.

### Azure Portal Method

1. Open your storage account
2. In the left menu, go to **Data storage** → **Containers**
3. Click **+ Container**
4. Configure:
   | Setting | Value |
   |---------|-------|
   | **Name** | `portfolio-images` |
   | **Public access level** | **Blob (anonymous read access for blobs only)** |

5. Click **Create**

### Azure CLI Method

```bash
az storage container create \
  --name portfolio-images \
  --account-name portfoliostorage123 \
  --public-access blob
```

## Step 3: Get Connection String

### Azure Portal Method

1. Open your storage account
2. In the left menu, go to **Security + networking** → **Access keys**
3. Click **Show** next to **key1**
4. Copy the **Connection string** value

> **Security Note**: Treat this connection string like a password. Never commit it to source control.

### Azure CLI Method

```bash
az storage account show-connection-string \
  --name portfoliostorage123 \
  --resource-group portfolio-rg \
  --query connectionString \
  --output tsv
```

## Step 4: Configure Environment Variables

Add the connection string to your deployment environment. You have two options:

### Option 1: Connection String (Recommended)

```bash
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=portfoliostorage123;AccountKey=xxx;EndpointSuffix=core.windows.net"
```

### Option 2: Separate Account Credentials

```bash
AZURE_STORAGE_ACCOUNT_NAME=portfoliostorage123
AZURE_STORAGE_ACCOUNT_KEY=your-account-key-here
AZURE_STORAGE_CONTAINER_NAME=portfolio-images
```

> **Note**: If `AZURE_STORAGE_CONTAINER_NAME` is not set, it defaults to `portfolio-images`.

### Where to Set Variables

- **Azure App Service**: Configuration → Application settings
- **Vercel**: Project Settings → Environment Variables
- **Local testing**: `.env.local` file (never commit this)

## Step 5: Verify Setup

Test that your storage account is configured correctly:

```bash
# List containers (should show portfolio-images)
az storage container list \
  --account-name portfoliostorage123 \
  --query "[].name" \
  --output tsv

# Test upload (optional)
echo "test" > test.txt
az storage blob upload \
  --account-name portfoliostorage123 \
  --container-name portfolio-images \
  --name test.txt \
  --file test.txt

# Verify public access
curl https://portfoliostorage123.blob.core.windows.net/portfolio-images/test.txt

# Clean up test file
az storage blob delete \
  --account-name portfoliostorage123 \
  --container-name portfolio-images \
  --name test.txt
```

## Local Development with Azurite (Optional)

[Azurite](https://docs.microsoft.com/azure/storage/common/storage-use-azurite) is a local Azure Storage emulator for testing without a real Azure account.

```bash
# Install Azurite globally
npm install -g azurite

# Create data directory
mkdir -p ./azurite-data

# Start Azurite (blob service on port 10000)
azurite --silent --location ./azurite-data --blobPort 10000

# Use this connection string in .env.local:
AZURE_STORAGE_CONNECTION_STRING="UseDevelopmentStorage=true"
```

> **Note**: Azurite URLs look different from production (`http://127.0.0.1:10000/devstoreaccount1/...`). The storage adapter handles this automatically.

## Cost Considerations

Azure Blob Storage is very cost-effective for image hosting:

| Component | Typical Usage | Estimated Monthly Cost |
|-----------|---------------|------------------------|
| Storage (LRS) | 10 GB | ~$0.20 |
| Write operations | 10,000 uploads | ~$0.05 |
| Read operations | 100,000 views | ~$0.04 |
| Data egress | 50 GB | ~$4.35 |
| **Total** | | **~$5/month** |

### Cost Optimization Tips

1. **Choose LRS redundancy** for non-critical data (portfolio images can be re-uploaded)
2. **Enable soft delete** (7-day retention) for accidental deletion recovery at minimal cost
3. **Set lifecycle management** to move old images to cool storage if needed
4. **Monitor usage** via Azure Cost Management + Billing

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Container not found" | Container doesn't exist | Create container per Step 2 |
| "AuthorizationFailure" | Invalid credentials | Re-copy connection string from portal |
| "PublicAccessNotPermitted" | Storage account blocks public access | Enable blob public access in storage account settings |
| Images not loading | Container not set to public | Set public access level to "Blob" |
| CORS errors | Cross-origin requests blocked | Add CORS rule in storage account (Settings → Resource sharing) |

### Enable Blob Public Access (if blocked)

If your storage account was created with public access disabled:

1. Open storage account in Azure Portal
2. Go to **Settings** → **Configuration**
3. Set **Allow Blob public access** to **Enabled**
4. Save, then recreate container with public access

## Next Steps

- [Domain Setup Guide](./DOMAIN_SETUP.md) - Configure custom domain with Namecheap
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to Azure App Service
