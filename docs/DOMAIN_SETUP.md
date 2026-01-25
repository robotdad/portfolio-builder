# Domain Configuration Guide (Namecheap)

This guide covers setting up a custom domain for your Azure-hosted portfolio, using Namecheap as the DNS provider.

## Migration Strategy: Subdomain First

We recommend deploying to a **subdomain first** (e.g., `portfolio.yourdomain.com`) before switching your main domain. This approach provides:

| Benefit | Why It Matters |
|---------|----------------|
| **Safe testing** | Test in production without disrupting existing site |
| **Full validation** | Verify SSL, storage, auth all work correctly |
| **Easy rollback** | Just remove the subdomain DNS record |
| **Gradual migration** | Flip to main domain when you're confident |

## Step 1: Deploy to Azure App Service

After deploying your application (see [Deployment Guide](./DEPLOYMENT.md)), you'll have a default URL:

```
https://your-app-name.azurewebsites.net
```

Note this URL - you'll need it for the DNS configuration.

## Step 2: Configure Subdomain in Namecheap

1. Log into [Namecheap](https://www.namecheap.com)
2. Go to **Domain List** → click **Manage** on your domain
3. Go to the **Advanced DNS** tab
4. Click **Add New Record** and configure:

   | Setting | Value |
   |---------|-------|
   | **Type** | CNAME Record |
   | **Host** | `portfolio` (or your preferred subdomain) |
   | **Value** | `your-app-name.azurewebsites.net` |
   | **TTL** | Automatic |

5. Click the checkmark to save

> **Example**: If your domain is `example.com` and your Azure app is `myportfolio`, you'd set:
> - Host: `portfolio`
> - Value: `myportfolio.azurewebsites.net`
> - Result: `portfolio.example.com` → Azure

## Step 3: Add Custom Domain in Azure

1. In [Azure Portal](https://portal.azure.com), open your App Service
2. In the left menu, go to **Settings** → **Custom domains**
3. Click **+ Add custom domain**
4. Enter your full subdomain: `portfolio.yourdomain.com`
5. Azure will validate the CNAME record
   - If validation fails, wait a few minutes for DNS propagation
6. Once validated, click **Add**

## Step 4: Enable HTTPS (Free with Azure Managed Certificate)

Azure provides free SSL certificates for custom domains:

1. In **Custom domains**, find your subdomain in the list
2. Under the **SSL state** column, click **Add binding**
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Custom domain** | `portfolio.yourdomain.com` |
   | **Private Key Certificate** | Create App Service Managed Certificate (free) |
   | **TLS/SSL type** | SNI SSL |

4. Click **Add**
5. Go to **Settings** → **Configuration** → **General settings**
6. Set **HTTPS Only** to **On**
7. Save

> **Note**: The managed certificate can take up to 24 hours to provision. Your site will work over HTTP immediately.

## Step 5: Update Environment Variables

Update your Azure App Service environment variables:

### In Azure Portal

1. Go to **Settings** → **Configuration** → **Application settings**
2. Add or update:
   ```
   NEXTAUTH_URL=https://portfolio.yourdomain.com
   ```
3. Click **Save** and confirm restart

### Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://portfolio.yourdomain.com/api/auth/callback/google
   ```
4. Click **Save**

> **Important**: Keep the old `azurewebsites.net` redirect URI until you've verified the custom domain works.

## Step 6: Migrate to Main Domain (When Ready)

Once you're satisfied with the subdomain deployment, you can migrate to your main domain.

### Option A: Using CNAME Flattening (If Available)

Some DNS providers support CNAME flattening for apex domains:

1. In Namecheap Advanced DNS, check if ALIAS/ANAME records are available
2. Add an ALIAS record for `@` pointing to `your-app-name.azurewebsites.net`

### Option B: Using A Records (Standard Method)

1. Get your App Service IP address:
   - In Azure Portal, go to your App Service
   - Go to **Settings** → **Custom domains**
   - Note the **IP address** shown

2. In Namecheap Advanced DNS, add/update:
   | Type | Host | Value |
   |------|------|-------|
   | A Record | `@` | Your App Service IP |
   | A Record | `www` | Your App Service IP |

3. In Azure, add both `yourdomain.com` and `www.yourdomain.com` as custom domains

4. Update environment variables:
   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   ```

5. Add new Google OAuth redirect URI:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

### Option C: Keep Subdomain, Redirect Root

If you want to keep using the subdomain:

1. Set up a redirect from `yourdomain.com` to `portfolio.yourdomain.com`
2. In Namecheap, use URL Redirect Record or your hosting provider's redirect feature

## DNS Propagation

DNS changes can take **1-48 hours** to propagate globally. Check propagation status:

### Online Tools
- [DNSChecker.org](https://dnschecker.org) - Check global DNS propagation
- [WhatsMyDNS.net](https://whatsmydns.net) - Another propagation checker

### Command Line
```bash
# Check CNAME record
dig portfolio.yourdomain.com CNAME

# Check A record (for apex domain)
dig yourdomain.com A

# Alternative using nslookup
nslookup portfolio.yourdomain.com
```

### Expected Results

For subdomain (CNAME):
```
portfolio.yourdomain.com. CNAME your-app-name.azurewebsites.net.
```

For apex domain (A record):
```
yourdomain.com. A 20.xx.xx.xx
```

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| "Domain not verified" in Azure | DNS not propagated yet | Wait 15-30 minutes, check with DNSChecker |
| "Domain not verified" persists | CNAME value incorrect | Verify value is exactly `app-name.azurewebsites.net` (no `https://`) |
| SSL certificate pending | Normal for new certs | Wait up to 24 hours for managed certificate |
| SSL certificate failed | Domain validation issue | Ensure domain resolves correctly, try removing and re-adding |
| OAuth "redirect_uri_mismatch" | NEXTAUTH_URL mismatch | Update NEXTAUTH_URL and Google OAuth URIs |
| Mixed content warnings | HTTP resources on HTTPS page | Ensure all asset URLs use HTTPS |
| "Too many redirects" | Multiple redirect rules | Check HTTPS Only setting, remove conflicting redirects |

### Common DNS Mistakes

- **Wrong CNAME format**: Value should be `app-name.azurewebsites.net` (no trailing dot, no https://)
- **Forgot the subdomain**: Host should be `portfolio`, not `portfolio.yourdomain.com`
- **TTL too high**: If testing, set TTL to 1 minute; increase to Automatic after verification

## Next Steps

- [Azure Setup Guide](./AZURE_SETUP.md) - Configure blob storage
- [Deployment Guide](./DEPLOYMENT.md) - Full deployment instructions
