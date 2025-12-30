---
bundle:
  name: portfolio-safe
  version: 1.0.0
  description: Portfolio project with dev server safety guards

includes:
  - bundle: git+https://github.com/microsoft/amplifier-foundation@main

---
## Dev Server Policy

**DO NOT run the Next.js dev server (`npm run dev`).**

It consistently hangs in this environment and causes session issues. No workarounds have proven reliable.

**Instead, verify your work with:**

```bash
# Build the project (catches all TypeScript and build errors)
npm run build
```

**For manual testing:**
- The USER will run `npm run dev` in their own terminal if needed
- Ask the user to test in browser and report back

**This applies to all long-running processes** - avoid starting dev servers, watch modes, or any process that doesn't terminate on its own.
