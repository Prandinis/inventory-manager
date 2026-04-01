import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import BottomNav from "@/components/BottomNav"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")
  if ((session.user as { mustChangePassword?: boolean }).mustChangePassword) redirect("/change-password")

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <main className="flex-1">{children}</main>
      <BottomNav role={session.user.role as string} />
    </div>
  )
}
