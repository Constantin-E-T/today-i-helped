import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Today I Helped</CardTitle>
          <CardDescription>Small actions, big impact 🌟</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Get Started</Button>
        </CardContent>
      </Card>
    </main>
  )
}
