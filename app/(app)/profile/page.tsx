"use client"

import { useState, useTransition } from "react"
import { useSession } from "@/lib/auth-client"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, User, CheckCircle } from "lucide-react"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const appUrl = typeof window !== "undefined" ? window.location.origin : ""

  function handleResetPassword() {
    if (!session?.user.email) return
    setError("")
    startTransition(async () => {
      const { error } = await authClient.requestPasswordReset({
        email: session.user.email,
        redirectTo: `${appUrl}/reset-password`,
      })
      if (error) {
        setError("Não foi possível enviar o email. Tente novamente.")
      } else {
        setSent(true)
      }
    })
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Meu Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da conta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <User className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm">{session?.user.name ?? "—"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm">{session?.user.email ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Senha</CardTitle>
          <CardDescription>
            Enviaremos um link de redefinição para o seu email.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {sent ? (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="size-4 shrink-0" />
              Email enviado! Verifique sua caixa de entrada.
            </div>
          ) : (
            <>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                variant="outline"
                onClick={handleResetPassword}
                disabled={isPending || !session}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Enviando...
                  </>
                ) : (
                  "Redefinir senha"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
