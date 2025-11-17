import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatCardData } from "@/types/dashboard";

interface StatsCardProps {
  stat: StatCardData;
  className?: string;
}

/**
 * Stats Card Component
 *
 * Modern stat card with:
 * - Large icon with gradient background
 * - Prominent value display
 * - Label and description
 * - Optional trend indicator
 * - Hover effects and animations
 */
export function StatsCard({ stat, className }: StatsCardProps) {
  const Icon = stat.icon;

  const colorClasses = {
    default: "text-foreground",
    primary: "text-primary",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
  };

  const iconBgClasses = {
    default:
      "bg-gradient-to-br from-slate-500/10 to-slate-600/10 text-slate-600 dark:text-slate-400",
    primary: "bg-gradient-to-br from-primary/10 to-primary/20 text-primary",
    success:
      "bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 text-emerald-600 dark:text-emerald-400",
    warning:
      "bg-gradient-to-br from-amber-500/10 to-amber-600/20 text-amber-600 dark:text-amber-400",
  };

  const color = stat.color || "default";

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-lg hover:scale-[1.02] border-2",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl", iconBgClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
          {stat.trend && (
            <Badge
              variant={stat.trend.isPositive ? "default" : "secondary"}
              className={cn(
                "text-xs font-semibold",
                stat.trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/20"
              )}
            >
              {stat.trend.isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(stat.trend.value)}%
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <div
            className={cn(
              "text-3xl font-bold tracking-tight",
              colorClasses[color]
            )}
          >
            {stat.value}
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {stat.label}
          </p>
          {stat.description && (
            <p className="text-xs text-muted-foreground/80">
              {stat.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Stats Grid Component
 *
 * Displays multiple stat cards in a responsive grid
 */
interface StatsGridProps {
  stats: StatCardData[];
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridClasses[columns])}>
      {stats.map((stat, index) => (
        <StatsCard key={index} stat={stat} />
      ))}
    </div>
  );
}
