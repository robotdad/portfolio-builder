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
- **Database**: PostgreSQL via Prisma
- **Styling**: Tailwind CSS 4
- **Rich Text**: Tiptap editor
- **Images**: Sharp.js for processing

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 14+ (native or Docker)

### Database Setup

#### Option 1: Native PostgreSQL (Recommended)

If you have PostgreSQL installed locally (e.g., via Homebrew):

```bash
# Create the database
createdb portfolio

# Or with psql
psql -c "CREATE DATABASE portfolio;"
```

The default connection string assumes:
- Host: localhost
- Port: 5432
- User: postgres
- Password: postgres
- Database: portfolio

Update your `.env` file if your setup differs.

#### Option 2: Docker PostgreSQL

If you prefer Docker:

```bash
# Start PostgreSQL container
docker compose up -d

# Wait a few seconds for PostgreSQL to initialize
```

### Installation

```bash
# Clone the repository
git clone https://github.com/robotdad/portfolio-builder.git
cd portfolio-builder

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database connection string if needed

# Generate Prisma client
npm run db:generate

# Push schema to database
npx prisma db push

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### First Run

1. Navigate to `http://localhost:3000` — you'll be redirected to the welcome flow
2. Create your portfolio with a name and choose a theme
3. Add your first project with images
4. Visit the admin dashboard at `/admin` to continue building

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
| `npm run db:reset` | Reset local database (truncate all tables) |
| `npm run db:seed-admin <email>` | Add an allowed admin email |
| `npm run db:migrate:prod` | Run migrations on production |
| `npm run db:reset:prod` | Reset production database |
| `npm run db:seed-admin:prod <email>` | Add admin email to production |

### Testing

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:e2e:ui` | Run tests with Playwright UI |
| `npm run test:populate:sarah` | Populate with Sarah Chen test persona |
| `npm run test:populate:sarah:prod` | Populate production with test persona |

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

This application is designed for single-user deployment on Azure App Service.

**Quick overview:**
- Azure App Service with Node.js 22
- Azure PostgreSQL Flexible Server
- Azure Blob Storage for images
- Google OAuth for authentication
- Git-based deployment (`git push azure main`)

See the [Deployment Guide](docs/DEPLOYMENT.md) for complete instructions including:
- Infrastructure setup (CLI and Portal methods)
- Environment variable configuration
- Custom domain and SSL setup
- Production scripts for database management

## Contributing

This project is not currently accepting contributions. It serves as a demonstration project and personal portfolio solution.

## License

MIT License — see [LICENSE](LICENSE) for details.
