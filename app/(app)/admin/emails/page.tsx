import Link from "next/link"
import { getReportEmails } from "@/actions/admin"
import { Card, CardContent } from "@/components/ui/card"
import { AddEmailForm, ToggleEmailButton } from "./EmailActions"

export default async function AdminEmailsPage() {
  const emails = await getReportEmails()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">←</Link>
        <h1 className="text-xl font-bold">Emails de Relatório</h1>
      </div>

      <AddEmailForm />

      <div className="flex flex-col gap-2">
        {emails.map((rec) => (
          <Card key={rec.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                {rec.name && <p className="font-medium text-sm">{rec.name}</p>}
                <p className="text-sm text-muted-foreground">{rec.email}</p>
              </div>
              <ToggleEmailButton id={rec.id} active={rec.active} />
            </CardContent>
          </Card>
        ))}
        {emails.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">Nenhum email cadastrado.</p>
        )}
      </div>
    </div>
  )
}
