import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

export const description = "A multiple bar chart";

const chartData = [
  { date: "2024-04-01", income: 222, expense: 150 },
  { date: "2024-04-02", income: 97, expense: 180 },
  { date: "2024-04-03", income: 167, expense: 120 },
  { date: "2024-04-04", income: 242, expense: 260 },
  { date: "2024-04-05", income: 373, expense: 290 },
  { date: "2024-04-06", income: 301, expense: 340 },
  { date: "2024-04-07", income: 245, expense: 180 },
  { date: "2024-04-08", income: 409, expense: 320 },
  { date: "2024-04-09", income: 59, expense: 110 },
  { date: "2024-04-10", income: 261, expense: 190 },
  { date: "2024-04-11", income: 327, expense: 350 },
  { date: "2024-04-12", income: 292, expense: 210 },
  { date: "2024-04-13", income: 342, expense: 380 },
  { date: "2024-04-14", income: 137, expense: 220 },
  { date: "2024-04-15", income: 120, expense: 170 },
  { date: "2024-04-16", income: 138, expense: 190 },
  { date: "2024-04-17", income: 446, expense: 360 },
  { date: "2024-04-18", income: 364, expense: 410 },
  { date: "2024-04-19", income: 243, expense: 180 },
  { date: "2024-04-20", income: 89, expense: 150 },
  { date: "2024-04-21", income: 137, expense: 200 },
  { date: "2024-04-22", income: 224, expense: 170 },
  { date: "2024-04-23", income: 138, expense: 230 },
  { date: "2024-04-24", income: 387, expense: 290 },
  { date: "2024-04-25", income: 215, expense: 250 },
  { date: "2024-04-26", income: 75, expense: 130 },
  { date: "2024-04-27", income: 383, expense: 420 },
  { date: "2024-04-28", income: 122, expense: 180 },
  { date: "2024-04-29", income: 315, expense: 240 },
  { date: "2024-04-30", income: 454, expense: 380 },
  { date: "2024-05-01", income: 165, expense: 220 },
  { date: "2024-05-02", income: 293, expense: 310 },
  { date: "2024-05-03", income: 247, expense: 190 },
  { date: "2024-05-04", income: 385, expense: 420 },
  { date: "2024-05-05", income: 481, expense: 390 },
  { date: "2024-05-06", income: 498, expense: 520 },
  { date: "2024-05-07", income: 388, expense: 300 },
  { date: "2024-05-08", income: 149, expense: 210 },
  { date: "2024-05-09", income: 227, expense: 180 },
  { date: "2024-05-10", income: 293, expense: 330 },
  { date: "2024-05-11", income: 335, expense: 270 },
  { date: "2024-05-12", income: 197, expense: 240 },
  { date: "2024-05-13", income: 197, expense: 160 },
  { date: "2024-05-14", income: 448, expense: 490 },
  { date: "2024-05-15", income: 473, expense: 380 },
  { date: "2024-05-16", income: 338, expense: 400 },
  { date: "2024-05-17", income: 499, expense: 420 },
  { date: "2024-05-18", income: 315, expense: 350 },
  { date: "2024-05-19", income: 235, expense: 180 },
  { date: "2024-05-20", income: 177, expense: 230 },
  { date: "2024-05-21", income: 82, expense: 140 },
  { date: "2024-05-22", income: 81, expense: 120 },
  { date: "2024-05-23", income: 252, expense: 290 },
  { date: "2024-05-24", income: 294, expense: 220 },
  { date: "2024-05-25", income: 201, expense: 250 },
  { date: "2024-05-26", income: 213, expense: 170 },
  { date: "2024-05-27", income: 420, expense: 460 },
  { date: "2024-05-28", income: 233, expense: 190 },
  { date: "2024-05-29", income: 78, expense: 130 },
  { date: "2024-05-30", income: 340, expense: 280 },
  { date: "2024-05-31", income: 178, expense: 230 },
  { date: "2024-06-01", income: 178, expense: 200 },
  { date: "2024-06-02", income: 470, expense: 410 },
  { date: "2024-06-03", income: 103, expense: 160 },
  { date: "2024-06-04", income: 439, expense: 380 },
  { date: "2024-06-05", income: 88, expense: 140 },
  { date: "2024-06-06", income: 294, expense: 250 },
  { date: "2024-06-07", income: 323, expense: 370 },
  { date: "2024-06-08", income: 385, expense: 320 },
  { date: "2024-06-09", income: 438, expense: 480 },
  { date: "2024-06-10", income: 155, expense: 200 },
  { date: "2024-06-11", income: 92, expense: 150 },
  { date: "2024-06-12", income: 492, expense: 420 },
  { date: "2024-06-13", income: 81, expense: 130 },
  { date: "2024-06-14", income: 426, expense: 380 },
  { date: "2024-06-15", income: 307, expense: 350 },
  { date: "2024-06-16", income: 371, expense: 310 },
  { date: "2024-06-17", income: 475, expense: 520 },
  { date: "2024-06-18", income: 107, expense: 170 },
  { date: "2024-06-19", income: 341, expense: 290 },
  { date: "2024-06-20", income: 408, expense: 450 },
  { date: "2024-06-21", income: 169, expense: 210 },
  { date: "2024-06-22", income: 317, expense: 270 },
  { date: "2024-06-23", income: 480, expense: 530 },
  { date: "2024-06-24", income: 132, expense: 180 },
  { date: "2024-06-25", income: 141, expense: 190 },
  { date: "2024-06-26", income: 434, expense: 380 },
  { date: "2024-06-27", income: 448, expense: 490 },
  { date: "2024-06-28", income: 149, expense: 200 },
  { date: "2024-06-29", income: 103, expense: 160 },
  { date: "2024-06-30", income: 446, expense: 400 },
];
const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Expense",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartBarMultiple() {
  const [timeRange, setTimeRange] = React.useState("90d");

  const getAggregatedData = (data: typeof chartData, timeRange: string) => {
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const filtered = data.filter((d) => new Date(d.date) >= startDate);

    let groupSize = 1;
    if (timeRange === "30d") groupSize = 3;
    if (timeRange === "90d") groupSize = 7;

    const groups: any[] = [];
    for (let i = 0; i < filtered.length; i += groupSize) {
      const chunk = filtered.slice(i, i + groupSize);
      const avgIncome =
        chunk.reduce((sum, d) => sum + d.income, 0) / chunk.length;
      const avgExpense =
        chunk.reduce((sum, d) => sum + d.expense, 0) / chunk.length;
      groups.push({
        date: chunk[0].date,
        income: Math.round(avgIncome),
        expense: Math.round(avgExpense),
      });
    }

    const totalRevenue = filtered.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = filtered.reduce((sum, d) => sum + d.expense, 0);
    const profit = totalRevenue - totalExpense;

    return { groups, totalRevenue, totalExpense, profit };
  };

  const {
    groups: filteredData,
    totalRevenue,
    profit,
  } = React.useMemo(() => getAggregatedData(chartData, timeRange), [timeRange]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Bar Chart - Multiple</CardTitle>
          <CardDescription>April - June 2024</CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Total {profit >= 0 ? "Profit" : "Loss"}
            </div>
            <div
              className={`text-xl font-bold ${
                profit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${Math.abs(profit).toLocaleString()}
            </div>
          </div>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={filteredData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              domain={["dataMin", "dataMax"]}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval="preserveStartEnd"
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={3}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {profit >= 0 ? (
            <>
              Profit up by {((profit / totalRevenue) * 100).toFixed(1)}%{" "}
              <TrendingUp className="h-4 w-4 text-green-600" />
            </>
          ) : (
            <>Loss recorded this period</>
          )}
        </div>

        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
