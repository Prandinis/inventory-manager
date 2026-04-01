"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")
  if (session.user.role !== "admin") throw new Error("Acesso restrito a administradores")
  return session.user
}

// ─── Halls ────────────────────────────────────────────────────────────────────

export async function createHall(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  if (!name) throw new Error("Nome obrigatório")
  await prisma.hall.create({ data: { name, description: description || null } })
  revalidatePath("/admin/halls")
  revalidatePath("/dashboard")
}

export async function toggleHall(id: string) {
  await requireAdmin()
  const hall = await prisma.hall.findUnique({ where: { id } })
  if (!hall) throw new Error("Salão não encontrado")
  await prisma.hall.update({ where: { id }, data: { active: !hall.active } })
  revalidatePath("/admin/halls")
  revalidatePath("/dashboard")
}

export async function getHalls() {
  return prisma.hall.findMany({ orderBy: { createdAt: "asc" } })
}

export async function getActiveHalls() {
  return prisma.hall.findMany({ where: { active: true }, orderBy: { name: "asc" } })
}

// ─── Report emails ────────────────────────────────────────────────────────────

export async function addReportEmail(formData: FormData) {
  await requireAdmin()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const name = String(formData.get("name") ?? "").trim()
  z.string().email().parse(email)
  await prisma.reportEmail.upsert({
    where: { email },
    update: { active: true, name: name || null },
    create: { email, name: name || null },
  })
  revalidatePath("/admin/emails")
}

export async function toggleReportEmail(id: string) {
  await requireAdmin()
  const rec = await prisma.reportEmail.findUnique({ where: { id } })
  if (!rec) throw new Error("Email não encontrado")
  await prisma.reportEmail.update({ where: { id }, data: { active: !rec.active } })
  revalidatePath("/admin/emails")
}

export async function getReportEmails() {
  return prisma.reportEmail.findMany({ orderBy: { createdAt: "asc" } })
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers() {
  return prisma.user.findMany({ orderBy: { createdAt: "asc" } })
}

export async function setUserRole(userId: string, role: "admin" | "guard") {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath("/admin/users")
}

const DEFAULT_PASSWORD = "123456789"

export async function createUser(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  z.object({ name: z.string().min(2), email: z.string().email() }).parse({ name, email })

  await auth.api.signUpEmail({
    body: { name, email, password: DEFAULT_PASSWORD },
    headers: new Headers(),
  })

  await prisma.user.update({ where: { email }, data: { mustChangePassword: true } })
  revalidatePath("/admin/users")
}

// ─── Seed first admin (run once) ─────────────────────────────────────────────

export async function createInitialAdmin(formData: FormData) {
  const existing = await prisma.user.count()
  if (existing > 0) throw new Error("Já existem usuários cadastrados")

  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) }).parse(
    { name, email, password },
  )

  await auth.api.signUpEmail({
    body: { name, email, password },
    headers: new Headers(),
  })

  // Promote to admin
  await prisma.user.update({ where: { email }, data: { role: "admin" } })
  redirect("/login")
}
