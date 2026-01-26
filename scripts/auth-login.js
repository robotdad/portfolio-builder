#!/usr/bin/env node

/**
 * Portfolio Auth CLI - Device-style authentication flow
 * 
 * Similar to `gh auth login` or `az login`:
 * 1. Starts a local callback server
 * 2. Opens browser to sign in with Google
 * 3. Captures and stores session cookie
 * 4. Scripts can then use stored credentials
 * 
 * Usage: 
 *   npm run auth:login           # Interactive login
 *   npm run auth:login -- --status    # Check auth status
 *   npm run auth:login -- --logout    # Clear stored credentials
 */

import http from 'http';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const AUTH_FILE = path.join(os.homedir(), '.portfolio-auth');
const CALLBACK_PORT = 3847; // Random-ish port for callback
const APP_PORT = process.env.PORT || 3000;
const APP_BASE = process.env.API_BASE || `http://localhost:${APP_PORT}`;

// ANSI colors for terminal output
const colors = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

/**
 * Open URL in default browser (cross-platform)
 */
function openBrowser(url) {
  const platform = process.platform;
  const commands = {
    darwin: `open "${url}"`,
    win32: `start "" "${url}"`,
    linux: `xdg-open "${url}"`,
  };
  
  const cmd = commands[platform] || commands.linux;
  exec(cmd, (err) => {
    if (err) {
      console.log(colors.yellow('\nCould not open browser automatically.'));
      console.log(`Please open this URL manually:\n${colors.cyan(url)}\n`);
    }
  });
}

/**
 * Save auth credentials to file
 */
function saveCredentials(credentials) {
  const data = {
    ...credentials,
    savedAt: new Date().toISOString(),
    appBase: APP_BASE,
  };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
}

/**
 * Load saved credentials
 */
function loadCredentials() {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
    }
  } catch {
    // Invalid file, ignore
  }
  return null;
}

/**
 * Clear saved credentials
 */
function clearCredentials() {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      fs.unlinkSync(AUTH_FILE);
      return true;
    }
  } catch {
    // Ignore errors
  }
  return false;
}

/**
 * Verify credentials are still valid by calling the API
 */
async function verifyCredentials(credentials) {
  try {
    const response = await fetch(`${credentials.appBase}/api/portfolio`, {
      headers: {
        Cookie: credentials.cookie,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Show current auth status
 */
async function showStatus() {
  const creds = loadCredentials();
  
  if (!creds) {
    console.log(colors.yellow('Not logged in.'));
    console.log(colors.dim('Run: npm run auth:login'));
    return false;
  }
  
  console.log('Checking authentication status...\n');
  
  const valid = await verifyCredentials(creds);
  
  if (valid) {
    console.log(colors.green('✓ Authenticated'));
    console.log(`  Email: ${colors.cyan(creds.email || 'unknown')}`);
    console.log(`  Server: ${colors.dim(creds.appBase)}`);
    console.log(`  Saved: ${colors.dim(creds.savedAt)}`);
    return true;
  } else {
    console.log(colors.red('✗ Session expired or invalid'));
    console.log(colors.dim('Run: npm run auth:login'));
    return false;
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  if (clearCredentials()) {
    console.log(colors.green('✓ Logged out successfully'));
  } else {
    console.log(colors.yellow('No credentials to clear'));
  }
}

/**
 * Main login flow
 */
async function login() {
  console.log('\n' + colors.cyan('Portfolio Auth Login'));
  console.log('=' .repeat(50) + '\n');
  
  // Check if already logged in
  const existing = loadCredentials();
  if (existing) {
    const valid = await verifyCredentials(existing);
    if (valid) {
      console.log(colors.green('✓ Already authenticated'));
      console.log(`  Email: ${colors.cyan(existing.email || 'unknown')}`);
      console.log(colors.dim('\nUse --logout to sign out first.\n'));
      return;
    }
  }
  
  return new Promise((resolve, reject) => {
    // Create callback server to capture the session cookie
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${CALLBACK_PORT}`);
      
      if (url.pathname === '/callback') {
        // Extract session cookie from query params (passed by our auth page)
        const sessionCookie = url.searchParams.get('session');
        const email = url.searchParams.get('email');
        
        if (sessionCookie) {
          // Save credentials
          saveCredentials({
            cookie: sessionCookie,
            email: email,
          });
          
          // Send success page
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Authentication Successful</title>
              <style>
                body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
                .card { background: white; padding: 2rem 3rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
                .check { font-size: 3rem; margin-bottom: 1rem; }
                h1 { margin: 0 0 0.5rem 0; color: #333; }
                p { color: #666; margin: 0; }
                .close { margin-top: 1rem; color: #999; font-size: 0.9rem; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="check">✓</div>
                <h1>Authenticated!</h1>
                <p>You can close this window and return to your terminal.</p>
                <p class="close">This window will close automatically...</p>
              </div>
              <script>setTimeout(() => window.close(), 2000);</script>
            </body>
            </html>
          `);
          
          // Close server and resolve
          server.close();
          
          console.log(colors.green('\n✓ Authentication successful!'));
          console.log(`  Email: ${colors.cyan(email || 'unknown')}`);
          console.log(`  Credentials saved to: ${colors.dim(AUTH_FILE)}`);
          console.log(colors.dim('\nYou can now run test scripts with auth enabled.\n'));
          
          resolve(true);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Missing session cookie');
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(colors.red(`Port ${CALLBACK_PORT} is in use. Please try again.`));
      } else {
        console.error(colors.red(`Server error: ${err.message}`));
      }
      reject(err);
    });
    
    server.listen(CALLBACK_PORT, () => {
      const callbackUrl = `http://localhost:${CALLBACK_PORT}/callback`;
      const authUrl = `${APP_BASE}/auth/cli-login?callback=${encodeURIComponent(callbackUrl)}`;
      
      console.log('Opening browser for authentication...\n');
      console.log(colors.dim('If browser does not open, visit:'));
      console.log(colors.cyan(authUrl) + '\n');
      console.log('Waiting for authentication...');
      
      openBrowser(authUrl);
      
      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        console.log(colors.yellow('\nAuthentication timed out. Please try again.'));
        resolve(false);
      }, 5 * 60 * 1000);
    });
  });
}

// Parse arguments and run
const args = process.argv.slice(2);

if (args.includes('--status') || args.includes('-s')) {
  showStatus();
} else if (args.includes('--logout') || args.includes('-l')) {
  handleLogout();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Portfolio Auth CLI

Usage:
  npm run auth:login              Interactive login (opens browser)
  npm run auth:login -- --status  Check current auth status
  npm run auth:login -- --logout  Clear stored credentials
  npm run auth:login -- --help    Show this help

Environment:
  API_BASE    Override API base URL (default: http://localhost:3000)
  PORT        Override app port (default: 3000)

Files:
  ${AUTH_FILE}    Stored credentials
`);
} else {
  login().catch((err) => {
    console.error(colors.red(`\nLogin failed: ${err.message}`));
    process.exit(1);
  });
}
