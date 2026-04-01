"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ResetPasswordSchema } from "@/lib/schemas/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { KeyRound, AlertCircle, Loader2 } from "lucide-react"

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isPending) return
    setError("")
    const fd = new FormData(e.currentTarget)

    const result = ResetPasswordSchema.safeParse({
      newPassword: String(fd.get("newPassword") ?? ""),
      confirm: String(fd.get("confirm") ?? ""),
    })

    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    startTransition(async () => {
      const { error } = await authClient.resetPassword({
        newPassword: result.data.newPassword,
        token,
      })
      if (error) {
        setError("Link inválido ou expirado. Solicite um novo link de redefinição.")
      } else {
        router.push("/login")
      }
    })
  }

  if (!token) {
    return (
      <Card className="w-full max-w-sm shadow-2xl border-0">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            Link de redefinição inválido. Solicite um novo pelo seu perfil.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm shadow-2xl border-0">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700">
          <KeyRound className="h-7 w-7 text-white" />
        </div>
        <CardTitle className="text-2xl">Nova Senha</CardTitle>
        <CardDescription>Defina sua nova senha de acesso</CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="newPassword">Nova Senha</FieldLabel>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm">Confirmar Senha</FieldLabel>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repita a nova senha"
              />
            </Field>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full" size="lg">
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Salvando...
                </>
              ) : (
                "Salvar nova senha"
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
