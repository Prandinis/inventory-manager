import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getLastCheckoutItems, checkinAction } from "@/actions/sessions"
import InventoryForm from "@/components/InventoryForm"
import type { InventoryItem } from "@/components/InventoryForm"

type Props = { params: Promise<{ hallId: string }> }

export default async function CheckinPage({ params }: Props) {
  const { hallId } = await params
  const hall = await prisma.hall.findUnique({ where: { id: hallId, active: true } })
  if (!hall) notFound()

  // Check for existing open session
  const openSession = await prisma.hallSession.findFirst({
    where: { hallId, status: "open" },
  })
  if (openSession) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="font-bold text-orange-800 mb-2">Salão em uso</h2>
          <p className="text-sm text-orange-700 mb-4">
            Este salão já tem um check-in aberto. Finalize o checkout primeiro.
          </p>
          <Link href="/dashboard" className="text-sm text-blue-700 font-medium underline">
            Voltar ao dashboard
          </Link>
        </div>
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
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
          ←
        </Link>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Check-in</p>
          <h1 className="text-xl font-bold text-gray-900">{hall.name}</h1>
        </div>
      </div>

      {templateItems && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-sm text-blue-700">
          Itens pré-carregados do último checkout. Ajuste as quantidades se necessário.
        </div>
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
