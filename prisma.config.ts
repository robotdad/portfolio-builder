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
    // Azure SSH sessions use APPSETTING_ prefix, regular runtime uses DATABASE_URL
    url: process.env.DATABASE_URL ?? process.env.APPSETTING_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/portfolio",
  },
});
