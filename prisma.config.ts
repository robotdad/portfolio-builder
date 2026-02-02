import { defineConfig } from "prisma/config";
import fs from "fs";

// Detect environment: Azure deploys to /prisma, local dev uses /src/prisma
const isAzure = fs.existsSync("prisma/schema.prisma") && !fs.existsSync("src/prisma/schema.prisma");
const schemaPath = isAzure ? "prisma/schema.prisma" : "src/prisma/schema.prisma";
const migrationsPath = isAzure ? "prisma/migrations" : "src/prisma/migrations";

export default defineConfig({
  schema: schemaPath,
  migrations: {
    path: migrationsPath,
  },
  datasource: {
    // SQLite database - local file for development, can be volume-mounted in containers
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
