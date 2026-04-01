import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { checkoutAction } from "@/actions/sessions"
import InventoryForm from "@/components/InventoryForm"
import type { InventoryItem } from "@/components/InventoryForm"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Props = {
  params: Promise<{ hallId: string }>
  searchParams: Promise<{ session?: string }>
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { hallId } = await params
  const { session: sessionId } = await searchParams

  const hall = await prisma.hall.findUnique({ where: { id: hallId, active: true } })
  if (!hall) notFound()

  const session = await prisma.hallSession.findFirst({
    where: { hallId, status: "open", ...(sessionId ? { id: sessionId } : {}) },
    include: { items: true, guard: true },
  })

  if (!session) redirect("/dashboard")

  const checkoutItems: InventoryItem[] = session.items.map((item) => ({
    id: item.id,
    name: item.name,
    qty: item.checkinQty,
  }))

  async function handleCheckout(items: InventoryItem[], notes: string, watchmanName: string, unit: string, residentName: string) {
    "use server"
    await checkoutAction({
      sessionId: session!.id,
      items: items.map((i) => ({ itemId: i.id!, qty: i.qty })),
      notes,
      watchmanName,
      unit,
      residentName,
    })
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">←</Link>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Checkout</p>
          <h1 className="text-xl font-bold">{hall.name}</h1>
        </div>
      </div>

      <Alert className="mb-4">
        <AlertDescription>
          Check-in feito por <strong>{session.guard.name}</strong> às{" "}
          {new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(
            session.checkinAt,
          )}. Informe as quantidades <strong>atuais</strong> de cada item.
        </AlertDescription>
      </Alert>

      <InventoryForm
        mode="checkout"
        hallId={hallId}
        sessionId={session.id}
        initialItems={checkoutItems}
        defaultWatchmanName={session.watchmanName ?? ""}
        defaultUnit={session.unit ?? ""}
        defaultResidentName={session.residentName ?? ""}
        onSubmit={handleCheckout}
      />
    </div>
  )
}
