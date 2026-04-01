import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { sendPasswordResetEmail } from "./resend"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 256,
    sendResetPassword: async ({ user, url }) => {
      sendPasswordResetEmail(user.email, user.name, url).catch(console.error)
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "guard",
        input: false,
      },
      mustChangePassword: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 5,
    storage: "memory",
  },
})

export type Session = typeof auth.$Infer.Session
