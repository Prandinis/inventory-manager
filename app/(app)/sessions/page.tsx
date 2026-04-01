import Link from "next/link"
import { getSessions } from "@/actions/sessions"

export default async function SessionsPage() {
  const sessions = await getSessions(50)

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Histórico</h1>

      {sessions.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p>Nenhuma sessão registrada ainda.</p>
        </div>
      )}

      <div className="space-y-2">
        {sessions.map((s) => (
          <Link
            key={s.id}
            href={`/sessions/${s.id}`}
            className="block bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{s.hall.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.guard.name}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  s.status === "open"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {s.status === "open" ? "Em aberto" : "Fechado"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(s.checkinAt)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
