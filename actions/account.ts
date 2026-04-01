"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DEFAULT_PASSWORD = "123456789"

export async function changeFirstLoginPassword(formData: FormData) {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders })
  if (!session?.user) redirect("/login")

  const newPassword = String(formData.get("newPassword") ?? "")
  const confirm = String(formData.get("confirm") ?? "")

  if (newPassword.length < 8) throw new Error("Senha deve ter no mínimo 8 caracteres")
  if (newPassword !== confirm) throw new Error("As senhas não coincidem")
  if (newPassword === DEFAULT_PASSWORD) throw new Error("A nova senha não pode ser igual à senha padrão")

  await auth.api.changePassword({
    body: { currentPassword: DEFAULT_PASSWORD, newPassword, revokeOtherSessions: false },
    headers: reqHeaders,
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { mustChangePassword: false },
  })

  redirect("/dashboard")
}
