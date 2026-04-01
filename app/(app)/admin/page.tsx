import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

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
      <h1 className="text-2xl font-bold mb-6">Administração</h1>
      <div className="flex flex-col gap-3">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 py-4">
                <span className="text-3xl">{t.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <span className="text-muted-foreground">→</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
