import Link from "next/link"
import { notFound } from "next/navigation"
import { getSession } from "@/actions/sessions"

type Props = { params: Promise<{ sessionId: string }> }

export default async function SessionDetailPage({ params }: Props) {
  const { sessionId } = await params
  const session = await getSession(sessionId)
  if (!session) notFound()

  const fmt = (date: Date | null) =>
    date
      ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date)
      : "—"

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/sessions" className="text-gray-400 hover:text-gray-600">←</Link>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Sessão</p>
          <h1 className="text-xl font-bold text-gray-900">{session.hall.name}</h1>
        </div>
      </div>

      {/* Meta */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Vigilante</span>
          <span className="font-medium">{session.guard.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Check-in</span>
          <span>{fmt(session.checkinAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Checkout</span>
          <span>{fmt(session.checkoutAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <span className={`font-medium ${session.status === "open" ? "text-orange-600" : "text-green-600"}`}>
            {session.status === "open" ? "Em aberto" : "Finalizado"}
          </span>
        </div>
      </div>

      {/* Inventory diff */}
      {session.items.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Inventário</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Item</th>
                <th className="text-center px-3 py-2 text-xs text-gray-500 font-medium">Check-in</th>
                <th className="text-center px-3 py-2 text-xs text-gray-500 font-medium">Checkout</th>
                <th className="text-center px-3 py-2 text-xs text-gray-500 font-medium">Diff</th>
              </tr>
            </thead>
            <tbody>
              {session.items.map((item) => {
                const diff = item.checkoutQty != null ? item.checkoutQty - item.checkinQty : null
                return (
                  <tr key={item.id} className="border-t border-gray-50">
                    <td className="px-4 py-2.5 text-gray-900">{item.name}</td>
                    <td className="text-center px-3 py-2.5 text-gray-600">{item.checkinQty}</td>
                    <td className="text-center px-3 py-2.5 text-gray-600">
                      {item.checkoutQty ?? "—"}
                    </td>
                    <td className="text-center px-3 py-2.5">
                      {diff == null ? (
                        <span className="text-gray-400">—</span>
                      ) : diff < 0 ? (
                        <span className="text-red-600 font-semibold">{diff}</span>
                      ) : diff > 0 ? (
                        <span className="text-green-600 font-semibold">+{diff}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes */}
      {session.notes && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 text-sm text-yellow-800">
          <p className="font-medium mb-1">Observações</p>
          <p>{session.notes}</p>
        </div>
      )}
    </div>
  )
}
