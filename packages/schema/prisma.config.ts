import path from "node:path";
import process from "node:process";
import { defineConfig, env } from "prisma/config";

process.loadEnvFile(path.resolve(import.meta.dirname, "../../.env"));

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
