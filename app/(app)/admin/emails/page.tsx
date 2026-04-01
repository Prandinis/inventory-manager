import Link from "next/link"
import { getReportEmails, addReportEmail, toggleReportEmail } from "@/actions/admin"

export default async function AdminEmailsPage() {
  const emails = await getReportEmails()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-xl font-bold text-gray-900">Emails de Relatório</h1>
      </div>

      <form action={addReportEmail} className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Adicionar Email</h2>
        <input
          name="email"
          type="email"
          required
          placeholder="email@exemplo.com"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="name"
          placeholder="Nome (opcional)"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-800 transition-colors"
        >
          Adicionar
        </button>
      </form>

      <div className="space-y-2">
        {emails.map((rec) => (
          <div key={rec.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3">
            <div>
              {rec.name && <p className="font-medium text-gray-900 text-sm">{rec.name}</p>}
              <p className="text-sm text-gray-600">{rec.email}</p>
            </div>
            <form action={toggleReportEmail.bind(null, rec.id)}>
              <button
                type="submit"
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  rec.active
                    ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                    : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
                }`}
              >
                {rec.active ? "Ativo" : "Inativo"}
              </button>
            </form>
          </div>
        ))}
        {emails.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-6">Nenhum email cadastrado.</p>
        )}
      </div>
    </div>
  )
}
