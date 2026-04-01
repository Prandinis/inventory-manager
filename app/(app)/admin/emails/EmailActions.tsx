"use client"

import { useTransition, useRef } from "react"
import { toast } from "sonner"
import { addReportEmail, toggleReportEmail } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export function AddEmailForm() {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await addReportEmail(fd)
        toast.success("Email adicionado com sucesso")
        formRef.current?.reset()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao adicionar email")
      }
    })
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Adicionar Email</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" required placeholder="email@exemplo.com" />
            </Field>
            <Field>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input id="name" name="name" placeholder="Nome (opcional)" />
            </Field>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export function ToggleEmailButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        await toggleReportEmail(id)
        toast.success(`Email ${active ? "desativado" : "ativado"}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao atualizar email")
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={active ? "text-green-700" : "text-muted-foreground"}
    >
      {isPending ? "..." : active ? "Ativo" : "Inativo"}
    </Button>
  )
}
