# Portfolio Builder

A portfolio website builder designed for costume designers and creative professionals. Build and manage a beautiful portfolio with an intuitive admin interface.

## Overview

This is a single-user portfolio application built with Next.js. It provides:

- **Admin Dashboard** — Manage your portfolio content through a clean interface
- **Theme System** — Three distinct visual themes to match your style
- **Image Processing** — Automatic responsive image generation
- **Draft/Publish Workflow** — Preview changes before going live
- **Mobile-First Design** — Works beautifully on all devices

### Themes

| Theme | Description |
|-------|-------------|
| Modern Minimal | Clean lines, generous whitespace, understated elegance |
| Classic Elegant | Traditional typography, refined details, timeless appeal |
| Bold Editorial | High contrast, dramatic layouts, magazine-inspired |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite via Prisma
- **Styling**: Tailwind CSS 4
- **Rich Text**: Tiptap editor
- **Images**: Sharp.js for processing
- **Storage**: Local filesystem or Azure Blob Storage

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/robotdad/portfolio-builder.git
cd portfolio-builder

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Generate Prisma client
npm run db:generate

# Create database and run migrations
npm run db:setup

# Add your email to admin allowlist (REQUIRED for login)
npm run db:seed-admin your-email@gmail.com

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### First Run

1. Navigate to `http://localhost:3000`
2. Sign in with Google using the email you added to the allowlist
3. Create your portfolio with a name and choose a theme
4. Add your first project with images
5. Visit the admin dashboard at `/admin` to continue building

### Optional: Populate with Test Data

For a fully-populated portfolio to explore:

**Terminal 1 - Start server:**
```bash
npm run dev
```

**Terminal 2 - Populate data:**
```bash
# Option A: Disable auth for easier local dev
# Edit .env.local and add: AUTH_DISABLED=true
npm run test:populate:sarah

# Option B: Authenticate first
npm run auth:login  # Opens browser to sign in
npm run test:populate:sarah
```

This creates a complete portfolio for costume designer Sarah Chen with categories, projects, and images.

## Project Structure

```
portfolio/
├── src/                    # Next.js application
│   ├── app/               # App Router pages and API routes
│   ├── components/        # React components
│   ├── lib/               # Utilities and helpers
│   └── prisma/            # Database schema and migrations
├── scripts/               # Utility scripts
├── test-assets/           # Test data and personas
└── docs/                  # Documentation (WIP)
```

## Scripts

Run all commands from the project root:

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

### Database

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:setup` | Create database and run migrations (initial setup) |
| `npm run db:reset` | Reset local database (clear all tables) |
| `npm run db:seed-admin <email>` | Add an allowed admin email |
| `npm run db:migrate:prod` | Run migrations on production |
| `npm run db:reset:prod` | Reset production database |
| `npm run db:seed-admin:prod <email>` | Add admin email to production |

### Testing

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:e2e:ui` | Run tests with Playwright UI |
| `npm run test:setup` | Setup DB + populate with Sarah Chen (requires server running) |
| `npm run test:populate:sarah` | Populate with Sarah Chen test persona (requires server running) |
| `npm run test:populate:sarah:prod` | Populate production with test persona |

**Note:** Population scripts make API calls to the running server. Start `npm run dev` first, then run populate scripts in a separate terminal.

### Authentication (for scripts)

| Command | Description |
|---------|-------------|
| `npm run auth:login` | Authenticate for production scripts |
| `npm run auth:status` | Check authentication status |
| `npm run auth:logout` | Clear stored credentials |

## Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database file path | `file:./dev.db` |
| `AUTH_DISABLED` | Disable authentication for local dev | `false` (auth enabled) |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design overview
- [API Reference](docs/API.md) — REST API documentation
- [Testing Guide](docs/TESTING.md) — Test infrastructure and patterns
- [Deployment Guide](docs/DEPLOYMENT.md) — Production deployment options *(coming soon)*

## Test Data

The `scripts/` directory includes a population script for loading test personas:

```bash
node scripts/populate-persona-api.js <persona-name>
```

See `test-assets/README.md` for available test personas and their content.

## Deployment

This application is designed for single-user deployment on Azure using .NET Aspire.

**Quick overview:**
- Azure Container Apps with Docker
- SQLite database (volume-mounted)
- Azure Blob Storage for images (optional)
- Google OAuth for authentication
- .NET Aspire for orchestration and observability

See the [Migration Plan](ai_working/2026-02-01/ASPIRE-MIGRATION-PLAN.md) for the Aspire deployment strategy.

## Contributing

This project is not currently accepting contributions. It serves as a demonstration project and personal portfolio solution.

## License

MIT License — see [LICENSE](LICENSE) for details.
