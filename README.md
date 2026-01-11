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

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio.git
cd portfolio

# Install dependencies
cd src
npm install

# Initialize the database
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

See [src/README.md](src/README.md) for detailed application documentation.

## Scripts

Run these from the `src/` directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./prisma/dev.db` |

## Documentation

- [Application Details](src/README.md) — Tech stack, API endpoints, theme details
- [Deployment Guide](docs/DEPLOYMENT.md) — Production deployment options *(coming soon)*
- [API Reference](docs/API.md) — REST API documentation *(coming soon)*
- [Architecture](docs/ARCHITECTURE.md) — System design overview *(coming soon)*

## Test Data

The `scripts/` directory includes a population script for loading test personas:

```bash
node scripts/populate-persona-api.js <persona-name>
```

See `test-assets/README.md` for available test personas and their content.

## Deployment

*Documentation coming soon.*

This application is designed for single-user deployment. It uses SQLite for simplicity but can be adapted for PostgreSQL or other databases supported by Prisma.

## Contributing

This project is not currently accepting contributions. It serves as a demonstration project and personal portfolio solution.

## License

MIT License — see [LICENSE](LICENSE) for details.
