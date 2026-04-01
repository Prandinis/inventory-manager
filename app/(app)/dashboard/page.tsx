import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getActiveHalls } from "@/actions/admin"
import { getOpenSessions } from "@/actions/sessions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
        <p className="text-sm text-muted-foreground">Olá, {session?.user.name}</p>
        <h1 className="text-2xl font-bold">Salões de Festa</h1>
      </div>

      {halls.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-5xl mb-3">🏛️</div>
          <p className="text-sm">Nenhum salão cadastrado ainda.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {halls.map((hall) => {
          const open = openByHall.get(hall.id)
          return (
            <Card key={hall.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-semibold">{hall.name}</h2>
                    {hall.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{hall.description}</p>
                    )}
                  </div>
                  <Badge variant={open ? "secondary" : "outline"}>
                    {open ? "Em uso" : "Disponível"}
                  </Badge>
                </div>

                {open ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Check-in por <strong>{open.guard.name}</strong> às{" "}
                      {new Intl.DateTimeFormat("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(open.checkinAt)}
                    </p>
                    <Button asChild variant="destructive" className="w-full">
                      <Link href={`/halls/${hall.id}/checkout?session=${open.id}`}>
                        Fazer Checkout
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={`/halls/${hall.id}/checkin`}>Fazer Check-in</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
