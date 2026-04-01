"use server"

import { randomBytes } from "crypto"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendWelcomeEmail } from "@/lib/resend"
import { revalidatePath } from "next/cache"
import {
  CuidSchema,
  AuthIdSchema,
  CreateHallSchema,
  AddReportEmailSchema,
  CreateUserSchema,
  CreateInitialAdminSchema,
  UserRoleSchema,
} from "@/lib/schemas/admin"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")
  if (session.user.role !== "admin") throw new Error("Acesso restrito a administradores")
  return session.user
}

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")
  return session.user
}

// ─── Halls ────────────────────────────────────────────────────────────────────

export async function createHall(formData: FormData) {
  await requireAdmin()
  const { name, description } = CreateHallSchema.parse({
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
  })
  await prisma.hall.create({ data: { name, description: description ?? null } })
  revalidatePath("/admin/halls")
  revalidatePath("/dashboard")
}

export async function toggleHall(id: string) {
  await requireAdmin()
  CuidSchema.parse(id)
  const hall = await prisma.hall.findUnique({ where: { id } })
  if (!hall) throw new Error("Salão não encontrado")
  await prisma.hall.update({ where: { id }, data: { active: !hall.active } })
  revalidatePath("/admin/halls")
  revalidatePath("/dashboard")
}

export async function getHalls() {
  await requireAdmin()
  return prisma.hall.findMany({ orderBy: { createdAt: "asc" } })
}

export async function getActiveHalls() {
  await requireSession()
  return prisma.hall.findMany({ where: { active: true }, orderBy: { name: "asc" } })
}

// ─── Report emails ────────────────────────────────────────────────────────────

export async function addReportEmail(formData: FormData) {
  await requireAdmin()
  const { email, name } = AddReportEmailSchema.parse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    name: String(formData.get("name") ?? "").trim() || undefined,
  })
  await prisma.reportEmail.upsert({
    where: { email },
    update: { active: true, name: name ?? null },
    create: { email, name: name ?? null },
  })
  revalidatePath("/admin/emails")
}

export async function toggleReportEmail(id: string) {
  await requireAdmin()
  CuidSchema.parse(id)
  const rec = await prisma.reportEmail.findUnique({ where: { id } })
  if (!rec) throw new Error("Email não encontrado")
  await prisma.reportEmail.update({ where: { id }, data: { active: !rec.active } })
  revalidatePath("/admin/emails")
}

export async function getReportEmails() {
  await requireAdmin()
  return prisma.reportEmail.findMany({ orderBy: { createdAt: "asc" } })
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers() {
  await requireAdmin()
  return prisma.user.findMany({ orderBy: { createdAt: "asc" } })
}

export async function setUserRole(userId: string, role: "admin" | "guard") {
  await requireAdmin()
  AuthIdSchema.parse(userId)
  UserRoleSchema.parse(role)
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath("/admin/users")
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefghjkmnpqrstwxyz23456789"
  const bytes = randomBytes(12)
  return Array.from(bytes).map((b) => chars[b % chars.length]).join("")
}

export async function createUser(formData: FormData) {
  await requireAdmin()
  const { name, email } = CreateUserSchema.parse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  })

  const tempPassword = generateTempPassword()

  await auth.api.signUpEmail({
    body: { name, email, password: tempPassword },
    headers: new Headers(),
  })

  await prisma.user.update({ where: { email }, data: { mustChangePassword: true } })

  sendWelcomeEmail(email, name, tempPassword).catch(console.error)

  revalidatePath("/admin/users")
}

// ─── Seed first admin (run once) ─────────────────────────────────────────────

export async function createInitialAdmin(formData: FormData) {
  const existing = await prisma.user.count()
  if (existing > 0) throw new Error("Já existem usuários cadastrados")

  const { name, email, password } = CreateInitialAdminSchema.parse({
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  })

  await auth.api.signUpEmail({
    body: { name, email, password },
    headers: new Headers(),
  })

  await prisma.user.update({ where: { email }, data: { role: "admin" } })
  redirect("/login")
}
