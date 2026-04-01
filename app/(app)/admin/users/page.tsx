import Link from "next/link"
import { getUsers } from "@/actions/admin"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateUserForm, ToggleRoleButton } from "./UserActions"

export default async function AdminUsersPage() {
  const [users, session] = await Promise.all([
    getUsers(),
    auth.api.getSession({ headers: await headers() }),
  ])

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">←</Link>
        <h1 className="text-xl font-bold">Vigilantes</h1>
      </div>

      <CreateUserForm />

      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              {user.id === session?.user.id ? (
                <Button variant="secondary" size="sm" disabled>Você</Button>
              ) : (
                <ToggleRoleButton userId={user.id} role={user.role} />
              )}
            </CardContent>
          </Card>
        ))}
        {users.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">Nenhum usuário.</p>
        )}
      </div>
    </div>
  )
}
