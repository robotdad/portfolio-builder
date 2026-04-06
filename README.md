<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/branding/icons/icon-256.png">
    <source media="(prefers-color-scheme: light)" srcset="assets/branding/icons/icon-256.png">
    <img alt="Portfolio Builder" src="assets/branding/icons/icon-256.png" width="128">
  </picture>
</p>

# Portfolio Builder

A portfolio website builder designed for costume designers and creative professionals. Build and manage a beautiful portfolio with an intuitive admin interface.

![Portfolio Builder](docs/images/hero-screenshot.png)

---

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
- **Database**: PostgreSQL via Prisma
- **Styling**: Tailwind CSS 4
- **Rich Text**: Tiptap editor
- **Images**: Sharp.js for processing
- **Storage**: Local filesystem or Azure Blob Storage

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker Desktop (for local PostgreSQL)

### Installation

```bash
# Clone the repository
git clone https://github.com/robotdad/portfolio-builder.git
cd portfolio-builder

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start the local PostgreSQL database (required before anything else)
docker-compose up -d

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

### Daily Development

If you've already completed the initial setup and are returning to the project, you just need two steps:

```bash
# 1. Start the database (must be running before the dev server)
docker-compose up -d

# 2. Start the development server
npm run dev
```

The dev server requires a running PostgreSQL instance. If you see database connection errors, check that Docker is running and the postgres container is up (`docker ps`).

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
# Authenticate first (one-time, credentials are saved)
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

**Note:** Population scripts make API calls to the running server. Make sure Docker is running (`docker-compose up -d`), start `npm run dev` first, then run populate scripts in a separate terminal.

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
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/portfolio` |
| `AUTH_DISABLED` | Disable authentication for local dev | `false` (auth enabled) |

## Documentation

- [User Guide](docs/USER_GUIDE.md) — How to use the admin interface and manage your portfolio
- [Architecture](docs/ARCHITECTURE.md) — System design overview
- [API Reference](docs/API.md) — REST API documentation
- [Testing Guide](docs/TESTING.md) — Test infrastructure and patterns
- [Deployment Guide](docs/DEPLOYMENT.md) — Azure Container Apps deployment

## Test Data

The `scripts/` directory includes a population script for loading test personas:

```bash
node scripts/populate-persona-api.js <persona-name>
```

See `test-assets/README.md` for available test personas and their content.

## Deployment

This application is designed for single-user deployment on Azure Container Apps.

**Architecture:**
- Azure Container Apps (container hosting, managed TLS)
- Azure Container Registry (private image storage)
- Azure Database for PostgreSQL Flexible Server (VNet-private)
- Azure Blob Storage for images
- Google OAuth for authentication
- GitHub Actions CI/CD with OIDC (no stored secrets)

**Estimated cost:** ~$18-25/month.

See the [Deployment Guide](docs/DEPLOYMENT.md) for full instructions.

## Contributing

This project is not currently accepting contributions. It serves as a demonstration project and personal portfolio solution.

## License

MIT License — see [LICENSE](LICENSE) for details.
