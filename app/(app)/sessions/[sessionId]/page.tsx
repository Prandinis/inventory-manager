import Link from "next/link"
import { notFound } from "next/navigation"
import { getSession } from "@/actions/sessions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
        <Link href="/sessions" className="text-muted-foreground hover:text-foreground">←</Link>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Sessão</p>
          <h1 className="text-xl font-bold">{session.hall.name}</h1>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-2 py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vigilante</span>
            <span className="font-medium">{session.guard.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-in</span>
            <span>{fmt(session.checkinAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Checkout</span>
            <span>{fmt(session.checkoutAt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={session.status === "open" ? "secondary" : "outline"}>
              {session.status === "open" ? "Em aberto" : "Finalizado"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {session.items.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm">Inventário</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Check-in</TableHead>
                  <TableHead className="text-center">Checkout</TableHead>
                  <TableHead className="text-center">Diff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {session.items.map((item) => {
                  const diff = item.checkoutQty != null ? item.checkoutQty - item.checkinQty : null
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-center">{item.checkinQty}</TableCell>
                      <TableCell className="text-center">{item.checkoutQty ?? "—"}</TableCell>
                      <TableCell className="text-center font-semibold">
                        {diff == null ? (
                          <span className="text-muted-foreground font-normal">—</span>
                        ) : diff < 0 ? (
                          <span className="text-destructive">{diff}</span>
                        ) : diff > 0 ? (
                          <span className="text-green-600">+{diff}</span>
                        ) : (
                          <span className="text-muted-foreground font-normal">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {session.notes && (
        <Alert>
          <AlertTitle>Observações</AlertTitle>
          <AlertDescription>{session.notes}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
