"use client"

import { useTransition, useRef } from "react"
import { toast } from "sonner"
import { createHall, toggleHall } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export function CreateHallForm() {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createHall(fd)
        toast.success("Salão criado com sucesso")
        formRef.current?.reset()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao criar salão")
      }
    })
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Novo Salão</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input id="name" name="name" required placeholder="Nome do salão" />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Descrição</FieldLabel>
              <Input id="description" name="description" placeholder="Descrição (opcional)" />
            </Field>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Salvando..." : "Adicionar Salão"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export function ToggleHallButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        await toggleHall(id)
        toast.success(`Salão ${active ? "desativado" : "ativado"}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao atualizar salão")
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
