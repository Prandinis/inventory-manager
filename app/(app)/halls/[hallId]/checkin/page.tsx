import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getLastCheckoutItems, checkinAction } from "@/actions/sessions"
import InventoryForm from "@/components/InventoryForm"
import type { InventoryItem } from "@/components/InventoryForm"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

type Props = { params: Promise<{ hallId: string }> }

export default async function CheckinPage({ params }: Props) {
  const { hallId } = await params
  const hall = await prisma.hall.findUnique({ where: { id: hallId, active: true } })
  if (!hall) notFound()

  const openSession = await prisma.hallSession.findFirst({
    where: { hallId, status: "open" },
  })

  if (openSession) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertTitle>Salão em uso</AlertTitle>
          <AlertDescription>
            Este salão já tem um check-in aberto. Finalize o checkout primeiro.
          </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard">← Voltar ao dashboard</Link>
        </Button>
      </div>
    )
  }

  const templateItems = await getLastCheckoutItems(hallId)
  const initialItems: InventoryItem[] = templateItems?.map((i) => ({ name: i.name, qty: i.qty })) ?? []

  async function handleCheckin(items: InventoryItem[], notes: string) {
    "use server"
    await checkinAction({ hallId, items: items.map((i) => ({ name: i.name, qty: i.qty })), notes })
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">←</Link>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Check-in</p>
          <h1 className="text-xl font-bold">{hall.name}</h1>
        </div>
      </div>

      {templateItems && (
        <Alert className="mb-4">
          <AlertDescription>
            Itens pré-carregados do último checkout. Ajuste as quantidades se necessário.
          </AlertDescription>
        </Alert>
      )}

      <InventoryForm
        mode="checkin"
        hallId={hallId}
        initialItems={initialItems}
        onSubmit={handleCheckin}
      />
    </div>
  )
}
