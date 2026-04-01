"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Building2, AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isPending) return
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get("email"))
    const password = String(fd.get("password"))

    startTransition(async () => {
      const { error } = await signIn.email({ email, password })
      if (error) {
        setError("Email ou senha inválidos")
      } else {
        router.push("/dashboard")
      }
    })
  }

  return (
    <Card className="w-full max-w-sm shadow-2xl border-0">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <CardTitle className="text-2xl">Salão de Festas</CardTitle>
        <CardDescription>Condomínio — Controle de Uso</CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
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

            <Field>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
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
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Esqueci minha senha
              </a>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
