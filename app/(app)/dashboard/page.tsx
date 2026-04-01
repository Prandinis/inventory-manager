import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getActiveHalls } from "@/actions/admin"
import { getOpenSessions } from "@/actions/sessions"

export default async function DashboardPage() {
  const [session, halls, openSessions] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getActiveHalls(),
    getOpenSessions(),
  ])

  const openByHall = new Map(openSessions.map((s) => [s.hallId, s]))

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <p className="text-sm text-gray-500">Olá, {session?.user.name}</p>
        <h1 className="text-2xl font-bold text-gray-900">Salões de Festa</h1>
      </div>

      {halls.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">🏛️</div>
          <p>Nenhum salão cadastrado ainda.</p>
        </div>
      )}

      <div className="space-y-3">
        {halls.map((hall) => {
          const open = openByHall.get(hall.id)
          return (
            <div
              key={hall.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-gray-900">{hall.name}</h2>
                  {hall.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{hall.description}</p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    open
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {open ? "Em uso" : "Disponível"}
                </span>
              </div>

              {open ? (
                <div>
                  <p className="text-xs text-gray-500 mb-3">
                    Check-in por <strong>{open.guard.name}</strong> às{" "}
                    {new Intl.DateTimeFormat("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(open.checkinAt)}
                  </p>
                  <Link
                    href={`/halls/${hall.id}/checkout?session=${open.id}`}
                    className="block w-full text-center bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Fazer Checkout
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/halls/${hall.id}/checkin`}
                  className="block w-full text-center bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-800 transition-colors"
                >
                  Fazer Check-in
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
