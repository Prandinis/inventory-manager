"use client"

import { useTransition, useRef } from "react"
import { toast } from "sonner"
import { createUser, setUserRole } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export function CreateUserForm() {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createUser(fd)
        toast.success("Usuário criado — credenciais enviadas por email")
        formRef.current?.reset()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao criar usuário")
      }
    })
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Novo usuário</CardTitle>
        <CardDescription>
          Uma senha temporária será gerada e enviada por email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome completo</FieldLabel>
              <Input id="name" name="name" type="text" required minLength={2} placeholder="Nome completo" />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" required placeholder="email@exemplo.com" />
            </Field>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Criando..." : "Criar usuário"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export function ToggleRoleButton({ userId, role }: { userId: string; role: string }) {
  const [isPending, startTransition] = useTransition()
  const isAdmin = role === "admin"
  const nextRole = isAdmin ? "guard" : "admin"

  function handleClick() {
    startTransition(async () => {
      try {
        await setUserRole(userId, nextRole)
        toast.success(`Permissão alterada para ${nextRole === "admin" ? "Admin" : "Vigilante"}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao alterar permissão")
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "..." : isAdmin ? "Admin" : "Vigilante"}
    </Button>
  )
}
