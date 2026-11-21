import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prisma does not read .env.local on its own; load it (then .env) for CLI commands.
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
