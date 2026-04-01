"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendCheckoutReport } from "@/lib/resend"
import { z } from "zod"

async function getGuard() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")
  return session.user
}

// ─── Check-in ────────────────────────────────────────────────────────────────

const CheckinSchema = z.object({
  hallId: z.string().min(1),
  items: z.array(
    z.object({
      name: z.string().min(1),
      qty: z.coerce.number().int().min(0),
    }),
  ),
  notes: z.string().optional(),
})

export type CheckinInput = z.infer<typeof CheckinSchema>

export async function checkinAction(input: CheckinInput) {
  const guard = await getGuard()
  const data = CheckinSchema.parse(input)

  // Verify hall exists
  const hall = await prisma.hall.findUnique({ where: { id: data.hallId, active: true } })
  if (!hall) throw new Error("Salão não encontrado")

  // Check if there's already an open session for this hall
  const existing = await prisma.hallSession.findFirst({
    where: { hallId: data.hallId, status: "open" },
  })
  if (existing) throw new Error("Já existe um check-in aberto para este salão")

  const session = await prisma.hallSession.create({
    data: {
      hallId: data.hallId,
      guardId: guard.id,
      status: "open",
      notes: data.notes,
      items: {
        create: data.items.map((item) => ({
          name: item.name,
          checkinQty: item.qty,
        })),
      },
    },
  })

  redirect(`/dashboard`)
}

// ─── Get last checkout template ───────────────────────────────────────────────

export async function getLastCheckoutItems(hallId: string) {
  const lastSession = await prisma.hallSession.findFirst({
    where: { hallId, status: "closed" },
    orderBy: { checkoutAt: "desc" },
    include: { items: true },
  })
  if (!lastSession) return null
  return lastSession.items.map((item) => ({
    name: item.name,
    qty: item.checkoutQty ?? item.checkinQty,
  }))
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

const CheckoutSchema = z.object({
  sessionId: z.string().min(1),
  items: z.array(
    z.object({
      itemId: z.string().min(1),
      qty: z.coerce.number().int().min(0),
    }),
  ),
  notes: z.string().optional(),
})

export type CheckoutInput = z.infer<typeof CheckoutSchema>

export async function checkoutAction(input: CheckoutInput) {
  const guard = await getGuard()
  const data = CheckoutSchema.parse(input)

  const session = await prisma.hallSession.findUnique({
    where: { id: data.sessionId, status: "open" },
    include: { items: true },
  })
  if (!session) throw new Error("Sessão não encontrada ou já encerrada")
  if (session.guardId !== guard.id && guard.role !== "admin")
    throw new Error("Sem permissão para fazer checkout desta sessão")

  const checkoutAt = new Date()

  // Update each item's checkoutQty
  await Promise.all(
    data.items.map((i) =>
      prisma.sessionItem.update({
        where: { id: i.itemId },
        data: { checkoutQty: i.qty },
      }),
    ),
  )

  // Close the session
  await prisma.hallSession.update({
    where: { id: data.sessionId },
    data: {
      status: "closed",
      checkoutAt,
      notes: data.notes ?? session.notes,
    },
  })

  // Fetch full session for email
  const fullSession = await prisma.hallSession.findUnique({
    where: { id: data.sessionId },
    include: { hall: true, guard: true, items: true },
  })

  // Send report email (non-blocking, swallows errors to not break the flow)
  if (fullSession) {
    const emails = await prisma.reportEmail.findMany({
      where: { active: true },
      select: { email: true },
    })
    sendCheckoutReport(
      fullSession,
      emails.map((e) => e.email),
    ).catch(console.error)
  }

  redirect(`/sessions/${data.sessionId}`)
}

// ─── Fetch helpers (used by server components) ────────────────────────────────

export async function getOpenSessions() {
  return prisma.hallSession.findMany({
    where: { status: "open" },
    include: { hall: true, guard: true },
    orderBy: { checkinAt: "desc" },
  })
}

export async function getSession(id: string) {
  return prisma.hallSession.findUnique({
    where: { id },
    include: { hall: true, guard: true, items: true },
  })
}

export async function getSessions(limit = 20) {
  return prisma.hallSession.findMany({
    orderBy: { checkinAt: "desc" },
    take: limit,
    include: { hall: true, guard: true },
  })
}
