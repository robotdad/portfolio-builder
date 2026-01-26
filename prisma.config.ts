import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
  },
  datasource: {
    // Azure SSH sessions use APPSETTING_ prefix, regular runtime uses DATABASE_URL
    url: process.env.DATABASE_URL ?? process.env.APPSETTING_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/portfolio",
  },
});
