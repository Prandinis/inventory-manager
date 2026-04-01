"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ChangePasswordSchema } from "@/lib/schemas/account"

export async function changeFirstLoginPassword(formData: FormData) {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders })
  if (!session?.user) redirect("/login")

  const { currentPassword, newPassword } = ChangePasswordSchema.parse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  })

  await auth.api.changePassword({
    body: { currentPassword, newPassword, revokeOtherSessions: true },
    headers: reqHeaders,
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { mustChangePassword: false },
  })

  redirect("/dashboard")
}
