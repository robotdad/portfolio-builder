# Portfolio Builder

A professional portfolio creation tool for costume designers and creative professionals. Create beautiful, themed portfolio pages with a simple admin interface.

## Features

- **Simple Admin Interface** - Create and edit your portfolio at `/admin`
- **3 Professional Themes**:
  - **Modern Minimal** - Clean, professional, blue accents (default)
  - **Classic Elegant** - Warm, sophisticated, larger typography
  - **Bold Editorial** - Dark, dramatic, fashion-forward
- **Instant Publishing** - Your portfolio is live at `/{your-slug}`
- **Responsive Design** - Looks great on all devices

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Prisma + SQLite
- CSS Custom Properties (design tokens)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
cd src
npm install
```

### Database Setup

The database should already be set up. If you need to reset it:

```bash
npx prisma migrate reset
```

### Running the App

**Development mode:**

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

**Production build:**

```bash
npm run build
npm run start
```

## Usage

### Create Your Portfolio

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Fill in your details:
   - **Name** - Your display name
   - **Portfolio URL** - Auto-generated from your name (e.g., `jane-smith`)
   - **Professional Title** - What you do
   - **Bio** - Brief description of your work
3. Select a theme
4. Click **Create Portfolio**

### View Your Portfolio

After creating, click **View Portfolio** or navigate directly to:

```
http://localhost:3000/{your-slug}
```

For example: `http://localhost:3000/jane-smith`

### Update Your Portfolio

Return to `/admin` - your existing portfolio will load automatically. Make changes and click **Update Portfolio**.

## Project Structure

```
src/
├── app/
│   ├── admin/page.tsx       # Admin form
│   ├── [slug]/page.tsx      # Published portfolio viewer
│   ├── api/portfolio/       # REST API endpoints
│   ├── globals.css          # Design system & themes
│   └── layout.tsx           # Root layout with fonts
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── dev.db               # SQLite database
└── lib/
    └── prisma.ts            # Database client
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | Fetch portfolio |
| POST | `/api/portfolio` | Create new portfolio |
| PUT | `/api/portfolio` | Update existing portfolio |

## Themes

Each theme applies different colors, typography, and spacing:

| Theme | Background | Accent | Headings | Feel |
|-------|------------|--------|----------|------|
| Modern Minimal | Cool gray | Blue | Playfair Display | Professional |
| Classic Elegant | Warm cream | Terracotta | Playfair Display (larger) | Sophisticated |
| Bold Editorial | Dark | Hot pink | Sora | Dramatic |

## License

Private - All rights reserved.
