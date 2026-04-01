"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, ClipboardList, User, Settings, LogOut } from "lucide-react"

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
        <Building2 className="size-5" />
        <span>Salões</span>
      </Link>
      <Link href="/sessions" className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs ${active("/sessions")}`}>
        <ClipboardList className="size-5" />
        <span>Histórico</span>
      </Link>
      <Link href="/profile" className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs ${active("/profile")}`}>
        <User className="size-5" />
        <span>Perfil</span>
      </Link>
      {role === "admin" && (
        <Link href="/admin" className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs ${active("/admin")}`}>
          <Settings className="size-5" />
          <span>Admin</span>
        </Link>
      )}
      <Button
        variant="ghost"
        onClick={() => signOut().then(() => router.push("/login"))}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs text-gray-500 h-full rounded-none"
      >
        <LogOut className="size-5" />
        <span>Sair</span>
      </Button>
    </nav>
  )
}
