#!/bin/bash
# Reset the development database
# Usage: npm run db:reset

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$(dirname "$SCRIPT_DIR")"

echo "🗑️  Removing database..."
rm -f "$SRC_DIR/prisma/dev.db"

echo "📦 Pushing schema to new database..."
cd "$SRC_DIR"
npx prisma db push

echo "✅ Database reset complete!"
echo ""
echo "Next steps:"
echo "  npm run test:setup    # Populate with test data"
echo "  npm run dev           # Start the dev server"
