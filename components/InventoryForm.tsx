"use client"

import { useState, useEffect, useTransition } from "react"
import { unstable_rethrow } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export type InventoryItem = {
  id?: string
  name: string
  qty: number
}

type Props = {
  mode: "checkin" | "checkout"
  hallId: string
  sessionId?: string
  initialItems?: InventoryItem[]
  defaultWatchmanName?: string
  defaultUnit?: string
  onSubmit: (items: InventoryItem[], notes: string, watchmanName: string, unit: string) => Promise<void>
}

const STORAGE_KEY = (hallId: string) => `checkin_draft_${hallId}`

const PRESETS = ["Cadeiras", "Mesas", "Pratos", "Copos", "Talheres", "Talheres (facas)", "Guardanapos", "Toalhas"]

export default function InventoryForm({ mode, hallId, sessionId, initialItems, defaultWatchmanName, defaultUnit, onSubmit }: Props) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems ?? [])
  const [notes, setNotes] = useState("")
  const [watchmanName, setWatchmanName] = useState(defaultWatchmanName ?? "")
  const [unit, setUnit] = useState(defaultUnit ?? "")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (mode !== "checkin") return
    try {
      const saved = localStorage.getItem(STORAGE_KEY(hallId))
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.items?.length) setItems(parsed.items)
        if (parsed.notes) setNotes(parsed.notes)
      }
    } catch {}
  }, [mode, hallId])

  useEffect(() => {
    if (mode !== "checkin") return
    localStorage.setItem(STORAGE_KEY(hallId), JSON.stringify({ items, notes }))
  }, [items, notes, mode, hallId])

  function addItem() {
    setItems((prev) => [...prev, { name: "", qty: 0 }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: "name" | "qty", value: string | number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: field === "qty" ? Number(value) : value } : item,
      ),
    )
  }

  function addPreset(name: string) {
    if (items.some((i) => i.name === name)) return
    setItems((prev) => [...prev, { name, qty: 0 }])
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (isPending) return

    const valid = items.filter((i) => i.name.trim())
    if (valid.length === 0) {
      toast.error("Adicione pelo menos um item ao inventário")
      return
    }

    startTransition(async () => {
      try {
        await onSubmit(valid, notes, watchmanName, unit)
        if (mode === "checkin") {
          localStorage.removeItem(STORAGE_KEY(hallId))
          toast.success("Check-in registrado com sucesso")
        } else {
          toast.success("Checkout finalizado — relatório enviado")
        }
      } catch (err) {
        unstable_rethrow(err)
        toast.error(err instanceof Error ? err.message : "Erro inesperado")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {/* Presets */}
        {mode === "checkin" && items.length === 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Adicionar itens comuns
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPreset(p)}
                >
                  + {p}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Items list */}
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {mode === "checkin" ? (
                <Input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(i, "name", e.target.value)}
                  placeholder="Nome do item"
                  className="flex-1"
                  required
                />
              ) : (
                <span className="flex-1 text-sm font-medium">{item.name}</span>
              )}
              <Input
                type="number"
                value={item.qty}
                min={0}
                onChange={(e) => updateItem(i, "qty", e.target.value)}
                className="w-20 text-center"
              />
              {mode === "checkin" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(i)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>

        {mode === "checkin" && (
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={addItem}
          >
            + Adicionar item
          </Button>
        )}

        {/* Watchman and unit */}
        <div className="flex gap-3">
          <Field className="flex-1">
            <FieldLabel htmlFor="watchmanName">Vigilante</FieldLabel>
            <Input
              id="watchmanName"
              value={watchmanName}
              onChange={(e) => setWatchmanName(e.target.value)}
              placeholder="Nome do vigilante"
            />
          </Field>
          <Field className="w-36">
            <FieldLabel htmlFor="unit">Unidade</FieldLabel>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Ex: Bloco A"
            />
          </Field>
        </div>

        {/* Notes */}
        <Field>
          <FieldLabel htmlFor="notes">
            Observações {mode === "checkin" ? "(opcional)" : ""}
          </FieldLabel>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={
              mode === "checkin"
                ? "Ex: salão com decoração de aniversário"
                : "Ex: faltaram 2 copos, pratos com manchas"
            }
          />
        </Field>

        <Button
          type="submit"
          disabled={isPending}
          variant={mode === "checkout" ? "destructive" : "default"}
          className="w-full"
          size="lg"
        >
          {isPending
            ? mode === "checkin" ? "Salvando check-in..." : "Finalizando checkout..."
            : mode === "checkin" ? "Confirmar Check-in" : "Finalizar e Enviar Relatório"}
        </Button>
      </FieldGroup>
    </form>
  )
}
