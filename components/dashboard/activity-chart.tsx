"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import type { ActivityChartData } from "@/types/dashboard";

interface ActivityChartProps {
  data: ActivityChartData[];
  title?: string;
  description?: string;
  height?: number;
}

// Color palette for the pie chart
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

/**
 * Activity Chart Component
 *
 * Displays recent activity as a donut chart grouped by week.
 * Features:
 * - Responsive sizing
 * - Dark mode support
 * - Smooth animations
 * - Interactive tooltips
 */
export function ActivityChart({
  data,
  title = "Recent Activity",
  description = "Your last 30 days breakdown",
  height = 300,
}: ActivityChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Group data by weeks
  const groupByWeeks = (data: ActivityChartData[]) => {
    const weeks = [];
    const today = new Date();

    // Last 7 days
    const week1 = data.slice(-7).reduce((sum, d) => sum + d.actions, 0);
    weeks.push({ name: "This Week", value: week1 });

    // 8-14 days ago
    const week2 = data.slice(-14, -7).reduce((sum, d) => sum + d.actions, 0);
    if (week2 > 0) weeks.push({ name: "Last Week", value: week2 });

    // 15-21 days ago
    const week3 = data.slice(-21, -14).reduce((sum, d) => sum + d.actions, 0);
    if (week3 > 0) weeks.push({ name: "2 Weeks Ago", value: week3 });

    // 22-30 days ago
    const week4 = data.slice(-30, -21).reduce((sum, d) => sum + d.actions, 0);
    if (week4 > 0) weeks.push({ name: "3+ Weeks Ago", value: week4 });

    return weeks.filter((w) => w.value > 0);
  };

  const pieData = groupByWeeks(data);
  const totalActions = pieData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percent = ((payload[0].value / totalActions) * 100).toFixed(1);
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} {payload[0].value === 1 ? "action" : "actions"} (
            {percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle empty data
  if (totalActions === 0) {
    return (
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground">
              Complete an action to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  percent > 0.05
                    ? `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                    : ""
                }
                outerRadius="80%"
                innerRadius="50%"
                dataKey="value"
                animationDuration={1000}
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
