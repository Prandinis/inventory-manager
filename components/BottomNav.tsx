"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export default function BottomNav({ role }: { role: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")
      ? "text-blue-700 font-semibold"
      : "text-gray-500"

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-stretch h-16 z-50">
      <Link href="/dashboard" className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs ${active("/dashboard")}`}>
        <span className="text-xl">🏛️</span>
        <span>Salões</span>
      </Link>
      <Link href="/sessions" className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs ${active("/sessions")}`}>
        <span className="text-xl">📋</span>
        <span>Histórico</span>
      </Link>
      {role === "admin" && (
        <Link href="/admin" className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs ${active("/admin")}`}>
          <span className="text-xl">⚙️</span>
          <span>Admin</span>
        </Link>
      )}
      <button
        onClick={() => signOut().then(() => router.push("/login"))}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs text-gray-500"
      >
        <span className="text-xl">🚪</span>
        <span>Sair</span>
      </button>
    </nav>
  )
}
