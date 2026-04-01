"use client"

import { useState, useEffect, useTransition } from "react"

export type InventoryItem = {
  id?: string   // sessionItem id (only at checkout)
  name: string
  qty: number
}

type Props = {
  mode: "checkin" | "checkout"
  hallId: string
  sessionId?: string
  initialItems?: InventoryItem[]
  onSubmit: (items: InventoryItem[], notes: string) => Promise<void>
}

const STORAGE_KEY = (hallId: string) => `checkin_draft_${hallId}`

export default function InventoryForm({ mode, hallId, sessionId, initialItems, onSubmit }: Props) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems ?? [])
  const [notes, setNotes] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  // Restore draft from localStorage on checkin
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

  // Save draft to localStorage on change (checkin only)
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

  const PRESETS = ["Cadeiras", "Mesas", "Pratos", "Copos", "Talheres", "Talheres (facas)", "Guardanapos", "Toalhas"]

  function addPreset(name: string) {
    if (items.some((i) => i.name === name)) return
    setItems((prev) => [...prev, { name, qty: 0 }])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const valid = items.filter((i) => i.name.trim())
    if (valid.length === 0) {
      setError("Adicione pelo menos um item ao inventário")
      return
    }

    startTransition(async () => {
      try {
        await onSubmit(valid, notes)
        if (mode === "checkin") localStorage.removeItem(STORAGE_KEY(hallId))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Presets */}
      {mode === "checkin" && items.length === 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Adicionar itens comuns
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => addPreset(p)}
                className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                + {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-3">
            {mode === "checkin" ? (
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(i, "name", e.target.value)}
                placeholder="Nome do item"
                className="flex-1 text-sm bg-transparent focus:outline-none"
                required
              />
            ) : (
              <span className="flex-1 text-sm font-medium text-gray-900">{item.name}</span>
            )}
            <input
              type="number"
              value={item.qty}
              min={0}
              onChange={(e) => updateItem(i, "qty", e.target.value)}
              className="w-20 text-center text-sm border border-gray-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {mode === "checkin" && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {mode === "checkin" && (
        <button
          type="button"
          onClick={addItem}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Adicionar item
        </button>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observações {mode === "checkin" ? "(opcional)" : ""}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder={mode === "checkin" ? "Ex: salão com decoração de aniversário" : "Ex: faltaram 2 copos, pratos com manchas"}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={`w-full text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 ${
          mode === "checkin"
            ? "bg-blue-700 hover:bg-blue-800"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {isPending
          ? mode === "checkin" ? "Salvando check-in..." : "Finalizando checkout..."
          : mode === "checkin" ? "Confirmar Check-in" : "Finalizar e Enviar Relatório"}
      </button>
    </form>
  )
}
