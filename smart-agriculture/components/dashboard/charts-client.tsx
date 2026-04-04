"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const temperatureData = [
  { time: "00:00", value: 18.5 },
  { time: "04:00", value: 16.2 },
  { time: "08:00", value: 20.8 },
  { time: "12:00", value: 28.5 },
  { time: "16:00", value: 26.3 },
  { time: "20:00", value: 22.1 },
  { time: "24:00", value: 19.8 },
]

const humidityData = [
  { time: "00:00", air: 72, soil: 45 },
  { time: "04:00", air: 78, soil: 44 },
  { time: "08:00", air: 65, soil: 42 },
  { time: "12:00", air: 55, soil: 38 },
  { time: "16:00", air: 58, soil: 40 },
  { time: "20:00", air: 68, soil: 43 },
  { time: "24:00", air: 74, soil: 46 },
]

const weeklyData = [
  { day: "周一", temperature: 24.2, humidity: 65 },
  { day: "周二", temperature: 25.8, humidity: 62 },
  { day: "周三", temperature: 23.5, humidity: 70 },
  { day: "周四", temperature: 26.1, humidity: 58 },
  { day: "周五", temperature: 24.8, humidity: 64 },
  { day: "周六", temperature: 27.2, humidity: 55 },
  { day: "周日", temperature: 25.5, humidity: 68 },
]

export function ChartsClient() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
            温度趋势
            <span className="text-xs text-muted-foreground font-normal">过去24小时</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "温度",
                color: "var(--color-chart-4)",
              },
            }}
            className="h-[200px] w-full"
          >
            <AreaChart data={temperatureData} width={500} height={200}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-4)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-chart-4)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                domain={[10, 35]}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-chart-4)"
                strokeWidth={2}
                fill="url(#tempGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
            湿度对比
            <div className="flex items-center gap-4 text-xs font-normal">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-chart-2" />
                空气湿度
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" />
                土壤湿度
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              air: {
                label: "空气湿度",
                color: "var(--color-chart-2)",
              },
              soil: {
                label: "土壤湿度",
                color: "var(--color-primary)",
              },
            }}
            className="h-[200px] w-full"
          >
            <LineChart data={humidityData} width={500} height={200}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                domain={[30, 90]}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="air"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="soil"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
            本周数据汇总
            <div className="flex items-center gap-4 text-xs font-normal">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-chart-4" />
                温度 (°C)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-chart-2" />
                湿度 (%)
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              temperature: {
                label: "温度",
                color: "var(--color-chart-4)",
              },
              humidity: {
                label: "湿度",
                color: "var(--color-chart-2)",
              },
            }}
            className="h-[200px] w-full"
          >
            <BarChart data={weeklyData} width={1000} height={200}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="temperature" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="humidity" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
