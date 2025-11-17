import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, History } from "lucide-react";
import { formatRelativeTime } from "@/lib/date-utils";
import { Category } from "@prisma/client";
import type { Action } from "@prisma/client";

interface ActionTimelineProps {
  actions: Array<
    Action & {
      challenge: {
        text: string;
        category: Category;
      } | null;
    }
  >;
  username: string;
}

const categoryStyles = {
  PEOPLE: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  ANIMALS:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  ENVIRONMENT:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  COMMUNITY:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
};

/**
 * ActionTimeline Component
 * Displays a user's public action history in chronological order
 * Shows action text, category, location, and time completed
 */
export function ActionTimeline({ actions, username }: ActionTimelineProps) {
  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Action Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {username} hasn't completed any actions yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Action Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {actions.map((action, index) => (
            <div key={action.id} className="relative">
              {/* Timeline line */}
              {index < actions.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
              )}

              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-background" />
                  </div>
                </div>

                {/* Action content */}
                <div className="flex-1 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-foreground flex-1">
                      {action.customText || action.challenge?.text}
                    </p>
                    <Badge
                      variant="outline"
                      className={categoryStyles[action.category]}
                    >
                      {action.category}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(action.completedAt)}
                    </div>
                    {action.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {action.location}
                      </div>
                    )}
                    {action.clapsCount > 0 && (
                      <div className="flex items-center gap-1">
                        <span>👏</span>
                        <span>{action.clapsCount} claps</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
