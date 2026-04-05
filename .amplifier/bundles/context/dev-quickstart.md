# Portfolio Dev Quickstart

## Environment Configuration

Two env files control local vs production behavior (both gitignored):

| File | Loaded By | Purpose |
|------|-----------|---------|
| `.env.local` | Next.js automatically | Local development (localhost DB, no Azure storage, auth bypass) |
| `.env.production.local` | `:prod` scripts via `dotenv -e` | Running scripts against production Azure (remote DB, Azure storage, live API) |

`.env.example` is the committed reference showing all variables with placeholder values.

Key environment variables that control runtime behavior:

| Variable | Local | Production | Effect |
|----------|-------|------------|--------|
| `NEXT_OUTPUT_MODE` | unset | `standalone` (in App Service) | Controls Next.js build output mode |
| `AUTH_DISABLED` | `true` | unset | Bypasses Google OAuth for test profile population |
| `AZURE_STORAGE_CONNECTION_STRING` | unset | set | Switches storage from local filesystem to Azure Blob |
| `API_BASE` | unset (defaults to localhost:3000) | `https://your-domain.com/api` | Target for populate/admin scripts |

**Never** set production credentials in `.env.local`. Use `.env.production.local` with `:prod` script variants instead.

## Admin Authentication

Admin pages at `/admin/*` require authentication. Browser agents should generate a session token using `AUTH_SECRET` from `.env.local`.

- Read `AUTH_SECRET` from `.env.local` and use it to generate a valid session cookie
- Reuse an authenticated browser agent session via `session_id` for follow-up work
- **Never** modify `.env.local` or any auth configuration
- **Never** weaken, bypass, or disable authentication in code or environment

## Test Data

### Persona Population

`scripts/populate-persona-api.js` populates the database with complete persona portfolios via direct API calls.

```bash
node scripts/populate-persona-api.js sarah-chen
# Available personas: sarah-chen, julian-vane, emma-rodriguez
```

Creates portfolio, categories, projects, uploads images, and creates gallery sections. Takes 10-20 seconds per persona.

### Image Generation

`scripts/generate-persona-images.js` generates AI images for personas using prompts from `persona.json`.

```bash
node scripts/generate-persona-images.js sarah-chen
node scripts/generate-persona-images.js sarah-chen --profile-only
node scripts/generate-persona-images.js sarah-chen --category theater-production
```

## Testing

```bash
npm run db:generate       # Generate Prisma client (after fresh install)
npm run test:setup        # Reset DB + populate test data
npm run test:e2e          # Run Playwright tests
npm run test:e2e:ui       # Playwright UI mode
```

- All interactive elements have `data-testid` attributes
- Selectors centralized in `src/tests/e2e/fixtures.ts`
- Use API population for setup, Playwright for UI verification
- Never commit screenshots -- use `ai_working/screenshots/` (gitignored)

## AI Working Directory

`ai_working/` is the only place for AI agent temporary work.

Always create a date folder: `ai_working/YYYY-MM-DD/your-file.md`

Images and binary artifacts are gitignored. Text artifacts (`.md`, `.yaml`, `.json`, `.js`) are tracked as session history.

Never dump files in `ai_working/` root or in the project root.

## Documentation

| Document | Content |
|----------|---------|
| `docs/API.md` | REST API endpoints, request/response formats |
| `docs/ARCHITECTURE.md` | Tech stack, project structure, data model |
| `docs/TESTING.md` | Test infrastructure, personas, E2E patterns |
| `README.md` | Setup, development, deployment |
