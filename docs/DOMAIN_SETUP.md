# Domain Configuration Guide (Namecheap)

This guide covers setting up a custom domain for your Azure Container Apps-hosted portfolio, using Namecheap as the DNS provider.

## Migration Strategy: Subdomain First

We recommend deploying to a **subdomain first** (e.g., `portfolio.yourdomain.com`) before switching your main domain. This approach provides:

| Benefit | Why It Matters |
|---------|----------------|
| **Safe testing** | Test in production without disrupting existing site |
| **Full validation** | Verify SSL, storage, auth all work correctly |
| **Easy rollback** | Just remove the subdomain DNS record |
| **Gradual migration** | Flip to main domain when you're confident |

## Step 1: Deploy to Azure Container Apps

After deploying your application (see [Deployment Guide](./DEPLOYMENT.md)), you'll have a default URL:

```
https://portfolio-app.<unique-id>.<region>.azurecontainerapps.io
```

Find this URL with:
```bash
az containerapp show \
  --name portfolio-app \
  --resource-group portfolio-rg \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv
```

Note this URL -- you'll need it for the DNS configuration.

## Step 2: Configure Subdomain in Namecheap

1. Log into [Namecheap](https://www.namecheap.com)
2. Go to **Domain List** → click **Manage** on your domain
3. Go to the **Advanced DNS** tab
4. Click **Add New Record** and configure:

   | Setting | Value |
   |---------|-------|
   | **Type** | CNAME Record |
   | **Host** | `portfolio` (or your preferred subdomain) |
   | **Value** | `portfolio-app.<unique-id>.<region>.azurecontainerapps.io` |
   | **TTL** | Automatic |

5. Click the checkmark to save

> **Example**: If your domain is `yourdomain.com` and your ACA app FQDN is `portfolio-app.lemoncoast-abc123.westus2.azurecontainerapps.io`, you'd set:
> - Host: `portfolio`
> - Value: `portfolio-app.lemoncoast-abc123.westus2.azurecontainerapps.io`
> - Result: `portfolio.yourdomain.com` → Azure Container Apps

## Step 3: Add Custom Domain in Azure

ACA handles custom domains via CLI:

```bash
# Add custom hostname
az containerapp hostname add \
  --name portfolio-app \
  --resource-group portfolio-rg \
  --hostname portfolio.yourdomain.com
```

Azure will validate the CNAME record. If validation fails, wait a few minutes for DNS propagation and retry.

## Step 4: Enable HTTPS (Free Managed Certificate)

ACA provides free managed TLS certificates (via Let's Encrypt):

```bash
# Bind managed certificate (automatic provisioning + renewal)
az containerapp hostname bind \
  --name portfolio-app \
  --resource-group portfolio-rg \
  --hostname portfolio.yourdomain.com \
  --environment portfolio-env \
  --validation-method CNAME
```

The certificate provisions automatically. This typically takes a few minutes but can take up to 24 hours. Your site will work over HTTP immediately.

> **Note**: Unlike App Service, ACA handles certificate provisioning and renewal entirely automatically. No manual certificate creation, thumbprint lookup, or SSL binding steps are needed.

## Step 5: Update Environment Variables

Update the `NEXTAUTH_URL` on your container app:

```bash
az containerapp update \
  --name portfolio-app \
  --resource-group portfolio-rg \
  --set-env-vars NEXTAUTH_URL=https://portfolio.yourdomain.com
```

### Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://portfolio.yourdomain.com/api/auth/callback/google
   ```
4. Click **Save**

> **Important**: Keep the old ACA default domain redirect URI until you've verified the custom domain works.

## Step 6: Migrate to Main Domain (When Ready)

Once you're satisfied with the subdomain deployment, you can migrate to your main domain.

### Option A: Using CNAME Flattening (If Available)

Some DNS providers support CNAME flattening for apex domains:

1. In Namecheap Advanced DNS, check if ALIAS/ANAME records are available
2. Add an ALIAS record for `@` pointing to your ACA FQDN

### Option B: Keep Subdomain, Redirect Root

If you want to keep using the subdomain:

1. Set up a redirect from `yourdomain.com` to `portfolio.yourdomain.com`
2. In Namecheap, use URL Redirect Record or your hosting provider's redirect feature

> **Note**: ACA does not expose a static IP address for A records the way App Service does. For apex domains, CNAME flattening (Option A) or a redirect (Option B) are the recommended approaches.

## DNS Propagation

DNS changes can take **1-48 hours** to propagate globally. Check propagation status:

### Online Tools
- [DNSChecker.org](https://dnschecker.org) - Check global DNS propagation
- [WhatsMyDNS.net](https://whatsmydns.net) - Another propagation checker

### Command Line
```bash
# Check CNAME record
dig portfolio.yourdomain.com CNAME

# Alternative using nslookup
nslookup portfolio.yourdomain.com
```

### Expected Results

For subdomain (CNAME):
```
portfolio.yourdomain.com. CNAME portfolio-app.<unique-id>.<region>.azurecontainerapps.io.
```

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| "Hostname not verified" | DNS not propagated yet | Wait 15-30 minutes, check with DNSChecker |
| "Hostname not verified" persists | CNAME value incorrect | Verify value matches the ACA FQDN exactly (no `https://`) |
| Certificate pending | Normal for new certs | Wait up to 24 hours for managed certificate |
| Certificate failed | Domain validation issue | Ensure domain resolves correctly, try removing and re-adding hostname |
| OAuth "redirect_uri_mismatch" | NEXTAUTH_URL mismatch | Update NEXTAUTH_URL and Google OAuth URIs |
| Mixed content warnings | HTTP resources on HTTPS page | Ensure all asset URLs use HTTPS |

### Common DNS Mistakes

- **Wrong CNAME format**: Value should be the full ACA FQDN (no trailing dot, no `https://`)
- **Forgot the subdomain**: Host should be `portfolio`, not `portfolio.yourdomain.com`
- **TTL too high**: If testing, set TTL to 1 minute; increase to Automatic after verification

## Next Steps

- [Azure Setup Guide](./AZURE_SETUP.md) - Configure blob storage
- [Deployment Guide](./DEPLOYMENT.md) - Full deployment instructions
