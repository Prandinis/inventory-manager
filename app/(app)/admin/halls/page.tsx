import Link from "next/link"
import { getHalls, createHall, toggleHall } from "@/actions/admin"

export default async function AdminHallsPage() {
  const halls = await getHalls()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-xl font-bold text-gray-900">Salões</h1>
      </div>

      {/* Create form */}
      <form action={createHall} className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Novo Salão</h2>
        <input
          name="name"
          required
          placeholder="Nome do salão"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="description"
          placeholder="Descrição (opcional)"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-800 transition-colors"
        >
          Adicionar Salão
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {halls.map((hall) => (
          <div key={hall.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">{hall.name}</p>
              {hall.description && <p className="text-xs text-gray-500">{hall.description}</p>}
            </div>
            <form action={toggleHall.bind(null, hall.id)}>
              <button
                type="submit"
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  hall.active
                    ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                    : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
                }`}
              >
                {hall.active ? "Ativo" : "Inativo"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
