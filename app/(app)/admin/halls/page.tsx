import Link from "next/link"
import { getHalls } from "@/actions/admin"
import { Card, CardContent } from "@/components/ui/card"
import { CreateHallForm, ToggleHallButton } from "./HallActions"

export default async function AdminHallsPage() {
  const halls = await getHalls()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">←</Link>
        <h1 className="text-xl font-bold">Salões</h1>
      </div>

      <CreateHallForm />

      <div className="flex flex-col gap-2">
        {halls.map((hall) => (
          <Card key={hall.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{hall.name}</p>
                {hall.description && <p className="text-xs text-muted-foreground">{hall.description}</p>}
              </div>
              <ToggleHallButton id={hall.id} active={hall.active} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
