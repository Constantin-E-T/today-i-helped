import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Today I Helped</CardTitle>
          <CardDescription className="text-lg">
            Small actions, big impact 🌟
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button size="lg">Get Started</Button>
        </CardContent>
      </Card>
    </div>
  );
}
