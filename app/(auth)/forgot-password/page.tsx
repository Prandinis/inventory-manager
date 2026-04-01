"use client"

import { useState, useTransition } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Building2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isPending) return
    setError("")
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get("email"))

    startTransition(async () => {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) {
        setError("Não foi possível enviar o email. Tente novamente.")
      } else {
        setSent(true)
      }
    })
  }

  return (
    <Card className="w-full max-w-sm shadow-2xl border-0">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <CardTitle className="text-2xl">Redefinir senha</CardTitle>
        <CardDescription>Informe seu email para receber o link de redefinição</CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <p className="text-sm text-muted-foreground">
              Se este email estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
            </p>
            <a
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Voltar ao login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="vigilante@condominio.com"
                />
              </Field>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isPending} className="w-full" size="lg">
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link"
                )}
              </Button>

              <div className="text-center">
                <a
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                >
                  Voltar ao login
                </a>
              </div>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
