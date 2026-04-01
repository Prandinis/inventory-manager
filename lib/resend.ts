import { Resend } from "resend"
import type { HallSession, SessionItem, Hall, User } from "@prisma/client"

export const resend = new Resend(process.env.RESEND_API_KEY)

type SessionWithRelations = HallSession & {
  hall: Hall
  guard: User
  items: SessionItem[]
}

export async function sendCheckoutReport(
  session: SessionWithRelations,
  recipientEmails: string[],
) {
  if (recipientEmails.length === 0) return

  const diff = session.items.map((item) => ({
    name: item.name,
    checkin: item.checkinQty,
    checkout: item.checkoutQty ?? 0,
    diff: (item.checkoutQty ?? 0) - item.checkinQty,
  }))

  const hasDifferences = diff.some((d) => d.diff !== 0)

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(date)

  const rows = diff
    .map(
      (d) => `
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:8px 12px">${d.name}</td>
        <td style="padding:8px 12px;text-align:center">${d.checkin}</td>
        <td style="padding:8px 12px;text-align:center">${d.checkout}</td>
        <td style="padding:8px 12px;text-align:center;color:${d.diff < 0 ? "#dc2626" : d.diff > 0 ? "#16a34a" : "#6b7280"};font-weight:600">
          ${d.diff > 0 ? "+" : ""}${d.diff}
        </td>
      </tr>`,
    )
    .join("")

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;color:#111827;max-width:600px;margin:0 auto;padding:24px">
  <h1 style="font-size:20px;margin-bottom:4px">Relatório de Uso — ${session.hall.name}</h1>
  <p style="color:#6b7280;margin:0 0 24px">
    Vigilante: <strong>${session.guard.name}</strong><br>
    Check-in: ${formatDate(session.checkinAt)}<br>
    Checkout: ${session.checkoutAt ? formatDate(session.checkoutAt) : "—"}
  </p>

  ${hasDifferences ? `<p style="color:#dc2626;font-weight:600">⚠️ Foram identificadas diferenças no inventário.</p>` : `<p style="color:#16a34a;font-weight:600">✅ Inventário sem diferenças.</p>`}

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <thead>
      <tr style="background:#f3f4f6">
        <th style="padding:8px 12px;text-align:left">Item</th>
        <th style="padding:8px 12px;text-align:center">Check-in</th>
        <th style="padding:8px 12px;text-align:center">Checkout</th>
        <th style="padding:8px 12px;text-align:center">Diferença</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  ${session.notes ? `<p style="background:#fef9c3;padding:12px;border-radius:8px"><strong>Observações:</strong> ${session.notes}</p>` : ""}

  <p style="color:#9ca3af;font-size:12px;margin-top:32px">
    Gerado automaticamente pelo sistema de controle de salões — ${formatDate(new Date())}
  </p>
</body>
</html>`

  await resend.emails.send({
    from: process.env.REPORT_FROM_EMAIL ?? "relatorios@seudominio.com",
    to: recipientEmails,
    subject: `Checkout — ${session.hall.name} — ${formatDate(session.checkoutAt ?? new Date())}`,
    html,
  })
}
