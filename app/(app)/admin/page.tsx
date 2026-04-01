import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user.role !== "admin") redirect("/dashboard")

  const tiles = [
    { href: "/admin/halls", emoji: "🏛️", label: "Salões", desc: "Adicionar ou desativar salões" },
    { href: "/admin/users", emoji: "👤", label: "Vigilantes", desc: "Gerenciar usuários e papéis" },
    { href: "/admin/emails", emoji: "📧", label: "Emails de Relatório", desc: "Destinatários dos relatórios" },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Administração</h1>
      <div className="space-y-3">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">{t.emoji}</span>
            <div>
              <p className="font-semibold text-gray-900">{t.label}</p>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </div>
            <span className="ml-auto text-gray-300">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
