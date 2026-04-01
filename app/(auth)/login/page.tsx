"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth-client"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🏛️</div>
        <h1 className="text-2xl font-bold text-gray-900">Salão de Festas</h1>
        <p className="text-sm text-gray-500 mt-1">Condomínio — Controle de Uso</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="vigilante@condominio.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors"
        >
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  )
}
