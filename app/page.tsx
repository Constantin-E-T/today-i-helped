import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { getRandomChallenge } from "@/app/actions/challenge";
import type { Category, Difficulty } from "@prisma/client";

// Category color mapping
const categoryColors: Record<Category, string> = {
  PEOPLE: "bg-blue-500 text-white",
  ANIMALS: "bg-green-500 text-white",
  ENVIRONMENT: "bg-emerald-500 text-white",
  COMMUNITY: "bg-purple-500 text-white",
};

// Difficulty color mapping
const difficultyColors: Record<Difficulty, string> = {
  EASY: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  MEDIUM: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export default async function Home() {
  const result = await getRandomChallenge();

  return (
    <AuthWrapper>
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl">Today I Helped</CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Small actions, big impact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.success ? (
              <>
                {/* Category Badge */}
                <div className="flex justify-center">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[result.data.category]}`}
                  >
                    {result.data.category}
                  </span>
                </div>

                {/* Challenge Text */}
                <div className="text-center">
                  <p className="text-lg sm:text-xl font-medium text-foreground leading-relaxed">
                    {result.data.text}
                  </p>
                </div>

                {/* Difficulty Badge */}
                <div className="flex justify-center">
                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${difficultyColors[result.data.difficulty]}`}
                  >
                    {result.data.difficulty}
                  </span>
                </div>

                {/* Complete Button */}
                <div className="flex justify-center pt-2">
                  <Button size="lg" disabled className="w-full sm:w-auto">
                    Complete This Challenge
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-base">
                  No challenges available at the moment. Please check back later!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthWrapper>
  );
}
