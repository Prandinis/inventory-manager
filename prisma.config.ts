import path from "node:path"
import { defineConfig } from "@prisma/config"

// Load .env manually for CLI tools that don't auto-load it
import { config } from "dotenv"
config({ path: ".env" })

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
