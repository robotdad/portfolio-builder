---
bundle:
  name: portfolio-safe
  version: 1.0.0
  description: Portfolio project with dev server safety guards

includes:
  - bundle: git+https://github.com/microsoft/amplifier-foundation@main

---
## Dev Server Management

**Running Next.js dev server for testing:**

```bash
# Start in background with logging
npm run dev > /tmp/nextjs.log 2>&1 & echo $!
# Returns PID immediately, e.g., "95969"

# Verify it's running
ps -p 95969

# View logs
tail -20 /tmp/nextjs.log

# Stop when done
kill 95969
```

**CRITICAL - Never do this:**
- ❌ `npm run dev` (hangs indefinitely - cannot be killed)
- ❌ `run_in_background` parameter (unreliable - times out after 30s)

**Always do this:**
- ✅ Use Unix job control: `command > /tmp/log 2>&1 & echo $!`
- ✅ Capture PID for later cleanup
- ✅ Redirect output to log file

**This pattern works for all long-running processes** (dev servers, build watchers, etc.)
