"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { changeFirstLoginPassword } from "@/actions/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { KeyRound, Loader2 } from "lucide-react"

export default function ChangePasswordPage() {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isPending) return
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await changeFirstLoginPassword(fd)
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Erro ao alterar senha")
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 px-4">
      <Card className="w-full max-w-sm shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Alterar Senha</CardTitle>
          <CardDescription>Primeiro acesso — defina uma senha pessoal</CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="currentPassword">Senha atual</FieldLabel>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Senha recebida por email"
                />
                <FieldDescription>A senha temporária enviada para o seu email.</FieldDescription>
              </Field>

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

              <Button type="submit" disabled={isPending} className="w-full" size="lg">
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Salvando...
                  </>
                ) : (
                  "Definir Senha"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
