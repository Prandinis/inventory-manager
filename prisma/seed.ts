import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

import ws from "ws"
import { neonConfig } from "@neondatabase/serverless"
neonConfig.webSocketConstructor = ws

import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { hashPassword } from "better-auth/crypto"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

async function main() {
  const email = "leofelixscandura@gmail.com"
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log("Usuário já existe, pulando seed.")
    return
  }

  const id = crypto.randomUUID()
  const now = new Date()
  const password = await hashPassword("123456789")

  await prisma.user.create({
    data: {
      id,
      name: "Leo",
      email,
      emailVerified: true,
      role: "admin",
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: id,
          providerId: "credential",
          password,
          createdAt: now,
          updatedAt: now,
        },
      },
    },
  })

  console.log(`Admin criado: ${email}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
