#!/bin/bash
set -e

# Azure deployment script for Next.js standalone output
# Usage: ./scripts/deploy-azure.sh

RESOURCE_GROUP="portfolio-rg"
APP_NAME="sasha-portfolio"

echo "Building Next.js (standalone output)..."
npm run build

echo "Preparing deployment package..."
# Copy static assets into standalone folder
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# Copy Prisma files (needed for migrations on server)
mkdir -p .next/standalone/prisma
cp src/prisma/schema.prisma .next/standalone/prisma/
cp -r src/prisma/migrations .next/standalone/prisma/
cp prisma.config.ts .next/standalone/

# Create zip from standalone folder
echo "Creating deploy.zip..."
cd .next/standalone
zip -r ../../deploy.zip . -x "*.map" -x ".env*" -x "*.db"
cd ../..

echo "Zip size: $(ls -lh deploy.zip | awk '{print $5}')"

echo "Deploying to Azure..."
az webapp deploy \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --src-path deploy.zip \
  --type zip

# Cleanup
rm deploy.zip

echo ""
echo "Deployment complete!"
echo ""
echo "If this is the first deploy or schema changed, run migrations:"
echo "  az webapp ssh --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo "  Then: cd /home/site/wwwroot && npx prisma db push"
