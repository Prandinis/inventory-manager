import Link from "next/link"
import { getSessions } from "@/actions/sessions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function SessionsPage() {
  const sessions = await getSessions(50)

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Histórico</h1>

      {sessions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-sm">Nenhuma sessão registrada ainda.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {sessions.map((s) => (
          <Link key={s.id} href={`/sessions/${s.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-start justify-between py-3">
                <div>
                  <p className="font-semibold">{s.hall.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.guard.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(s.checkinAt)}
                  </p>
                </div>
                <Badge variant={s.status === "open" ? "secondary" : "outline"}>
                  {s.status === "open" ? "Em aberto" : "Fechado"}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
