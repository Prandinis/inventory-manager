import Link from "next/link"
import { getUsers, setUserRole, createUser } from "@/actions/admin"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function AdminUsersPage() {
  const [users, session] = await Promise.all([
    getUsers(),
    auth.api.getSession({ headers: await headers() }),
  ])

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-xl font-bold text-gray-900">Vigilantes</h1>
      </div>

      {/* Criar novo usuário */}
      <form action={createUser} className="bg-white border border-gray-100 rounded-2xl px-4 py-4 mb-6 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Novo usuário</p>
        <input
          name="name"
          type="text"
          required
          minLength={2}
          placeholder="Nome completo"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400">Senha inicial: <span className="font-mono">123456789</span> — o usuário deverá alterá-la no primeiro acesso.</p>
        <button
          type="submit"
          className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors text-sm"
        >
          Criar usuário
        </button>
      </form>

      {/* Lista de usuários */}
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3">
            <div>
              <p className="font-medium text-gray-900 text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            {user.id === session?.user.id ? (
              <span className="text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 font-medium">Você</span>
            ) : (
              <form action={setUserRole.bind(null, user.id, user.role === "admin" ? "guard" : "admin")}>
                <button
                  type="submit"
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700 hover:bg-gray-100 hover:text-gray-600"
                      : "bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                  }`}
                >
                  {user.role === "admin" ? "Admin" : "Vigilante"}
                </button>
              </form>
            )}
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-6">Nenhum usuário.</p>
        )}
      </div>
    </div>
  )
}
