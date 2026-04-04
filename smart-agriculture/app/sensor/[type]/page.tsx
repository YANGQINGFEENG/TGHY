"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Sun,
  Leaf,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Download,
  RefreshCw,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Spinner } from "@/components/ui/spinner"
import { ThemeToggle } from "@/components/theme-toggle"

const sensorConfig: Record<string, {
  title: string
  unit: string
  icon: typeof Thermometer
  color: string
  bgColor: string
  chartColor: string
  description: string
  normalRange: string
  warningThreshold: { min: number; max: number }
}> = {
  temperature: {
    title: "温度传感器",
    unit: "°C",
    icon: Thermometer,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    chartColor: "var(--chart-4)",
    description: "监测环境温度变化，适用于温室大棚、养殖场等场景",
    normalRange: "18°C - 28°C",
    warningThreshold: { min: 15, max: 32 },
  },
  humidity: {
    title: "空气湿度传感器",
    unit: "%",
    icon: Droplets,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    chartColor: "var(--chart-2)",
    description: "监测空气相对湿度，对作物生长和病虫害防治至关重要",
    normalRange: "60% - 80%",
    warningThreshold: { min: 40, max: 90 },
  },
  light: {
    title: "光照传感器",
    unit: "Lux",
    icon: Sun,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    chartColor: "var(--chart-3)",
    description: "监测光照强度，帮助调节补光灯和遮阳设施",
    normalRange: "8,000 - 15,000 Lux",
    warningThreshold: { min: 5000, max: 20000 },
  },
  soil: {
    title: "土壤湿度传感器",
    unit: "%",
    icon: Leaf,
    color: "text-primary",
    bgColor: "bg-primary/10",
    chartColor: "var(--primary)",
    description: "监测土壤含水量，精准灌溉节约水资源",
    normalRange: "35% - 55%",
    warningThreshold: { min: 25, max: 65 },
  },
}

// Generate mock data
function generateHourlyData(baseValue: number, variance: number) {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, "0")}:00`,
    value: Math.round((baseValue + (Math.random() - 0.5) * variance) * 10) / 10,
  }))
}

function generateWeeklyData(baseValue: number, variance: number) {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  return days.map((day) => ({
    day,
    avg: Math.round((baseValue + (Math.random() - 0.5) * variance) * 10) / 10,
    max: Math.round((baseValue + variance / 2 + Math.random() * variance / 2) * 10) / 10,
    min: Math.round((baseValue - variance / 2 - Math.random() * variance / 2) * 10) / 10,
  }))
}

function generateSensorList(type: string) {
  const zones = ["A区温室", "B区温室", "C区大棚", "D区露天"]
  return zones.flatMap((zone, zoneIdx) =>
    Array.from({ length: 3 }, (_, i) => ({
      id: `${type.toUpperCase()}-${zoneIdx + 1}${i + 1}`,
      name: `${zone} ${i + 1}号`,
      status: Math.random() > 0.1 ? "online" : "offline",
      value: Math.round((20 + Math.random() * 20) * 10) / 10,
      lastUpdate: `${Math.floor(Math.random() * 10) + 1}分钟前`,
      battery: Math.floor(60 + Math.random() * 40),
    }))
  )
}

export default function SensorDetailPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = use(params)
  const config = sensorConfig[type]
  const [timeRange, setTimeRange] = useState("24h")
  const [currentTime, setCurrentTime] = useState("")
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date().toLocaleString("zh-CN"))
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString("zh-CN"))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <h1 className="text-xl font-bold text-foreground mb-4">传感器类型不存在</h1>
          <Link href="/">
            <Button>返回首页</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const Icon = config.icon
  const hourlyData = generateHourlyData(
    type === "temperature" ? 24 : type === "humidity" ? 68 : type === "light" ? 12000 : 42,
    type === "temperature" ? 8 : type === "humidity" ? 15 : type === "light" ? 5000 : 10
  )
  const weeklyData = generateWeeklyData(
    type === "temperature" ? 24 : type === "humidity" ? 68 : type === "light" ? 12000 : 42,
    type === "temperature" ? 6 : type === "humidity" ? 12 : type === "light" ? 4000 : 8
  )
  const sensorList = generateSensorList(type)
  const currentValue = hourlyData[hourlyData.length - 1]?.value || 0
  const avgValue = Math.round((hourlyData.reduce((a, b) => a + b.value, 0) / hourlyData.length) * 10) / 10
  const maxValue = Math.max(...hourlyData.map((d) => d.value))
  const minValue = Math.min(...hourlyData.map((d) => d.value))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{config.title}</h1>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px] bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24小时</SelectItem>
                <SelectItem value="7d">7天</SelectItem>
                <SelectItem value="30d">30天</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="bg-secondary border-border">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <ThemeToggle />
            <Button variant="outline" className="bg-secondary border-border">
              <Download className="w-4 h-4 mr-2" />
              导出数据
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">当前值</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${config.color}`}>{currentValue}</span>
                <span className="text-sm text-muted-foreground">{config.unit}</span>
              </div>
              <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary">
                <Activity className="w-3 h-3 mr-1" />
                实时
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">平均值</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{avgValue}</span>
                <span className="text-sm text-muted-foreground">{config.unit}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">过去24小时</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">最高值</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <TrendingUp className="w-5 h-5 text-chart-4 mr-1" />
                <span className="text-3xl font-bold text-chart-4">{maxValue}</span>
                <span className="text-sm text-muted-foreground">{config.unit}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">过去24小时</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">最低值</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <TrendingDown className="w-5 h-5 text-chart-2 mr-1" />
                <span className="text-3xl font-bold text-chart-2">{minValue}</span>
                <span className="text-sm text-muted-foreground">{config.unit}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">过去24小时</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="trend">趋势图</TabsTrigger>
            <TabsTrigger value="comparison">对比分析</TabsTrigger>
            <TabsTrigger value="sensors">传感器列表</TabsTrigger>
          </TabsList>

          <TabsContent value="trend" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">24小时变化趋势</CardTitle>
                <CardDescription>显示{config.title}在过去24小时内的数据变化</CardDescription>
              </CardHeader>
              <CardContent>
                {mounted ? (
                  <ChartContainer
                    config={{
                      value: { label: config.title, color: config.chartColor },
                    }}
                    className="h-[350px] w-full"
                  >
                    <AreaChart data={hourlyData} width={1000} height={350} accessibilityLayer>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={config.chartColor} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={config.chartColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={config.chartColor}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        name={config.title}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center">
                    <Spinner className="text-primary" />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">正常范围参考</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                    <span className="text-muted-foreground">建议范围</span>
                    <span className="font-semibold text-primary">{config.normalRange}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-chart-4/10">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-chart-4" />
                      <span className="text-muted-foreground">高温预警阈值</span>
                    </div>
                    <span className="font-semibold text-chart-4">
                      {">"} {config.warningThreshold.max} {config.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-chart-2/10">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-chart-2" />
                      <span className="text-muted-foreground">低温预警阈值</span>
                    </div>
                    <span className="font-semibold text-chart-2">
                      {"<"} {config.warningThreshold.min} {config.unit}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">传感器状态概览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-primary/10 text-center">
                      <p className="text-3xl font-bold text-primary">
                        {sensorList.filter((s) => s.status === "online").length}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">在线设备</p>
                    </div>
                    <div className="p-4 rounded-lg bg-chart-4/10 text-center">
                      <p className="text-3xl font-bold text-chart-4">
                        {sensorList.filter((s) => s.status === "offline").length}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">离线设备</p>
                    </div>
                    <div className="p-4 rounded-lg bg-chart-3/10 text-center">
                      <p className="text-3xl font-bold text-chart-3">{sensorList.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">总设备数</p>
                    </div>
                    <div className="p-4 rounded-lg bg-chart-2/10 text-center">
                      <p className="text-3xl font-bold text-chart-2">
                        {Math.round(
                          (sensorList.filter((s) => s.status === "online").length /
                            sensorList.length) *
                            100
                        )}
                        %
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">在线率</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">每周数据对比</CardTitle>
                <CardDescription>显示本周每天的平均值、最高值和最低值对比</CardDescription>
              </CardHeader>
              <CardContent>
                {mounted ? (
                  <ChartContainer
                    config={{
                      min: { label: "最低值", color: "var(--chart-2)" },
                      avg: { label: "平均值", color: config.chartColor },
                      max: { label: "最高值", color: "var(--chart-4)" },
                    }}
                    className="h-[400px] w-full"
                  >
                    <BarChart data={weeklyData} width={1000} height={400} accessibilityLayer>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                      <Bar dataKey="min" fill="var(--chart-2)" name="最低值" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="avg" fill={config.chartColor} name="平均值" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="max" fill="var(--chart-4)" name="最高值" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <Spinner className="text-primary" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sensors">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">传感器列表</CardTitle>
                <CardDescription>所有{config.title}的详细信息和状态</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">设备ID</TableHead>
                      <TableHead className="text-muted-foreground">位置</TableHead>
                      <TableHead className="text-muted-foreground">状态</TableHead>
                      <TableHead className="text-muted-foreground">当前值</TableHead>
                      <TableHead className="text-muted-foreground">电量</TableHead>
                      <TableHead className="text-muted-foreground">最后更新</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensorList.map((sensor) => (
                      <TableRow key={sensor.id} className="border-border">
                        <TableCell className="font-mono text-foreground">{sensor.id}</TableCell>
                        <TableCell className="text-foreground">{sensor.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={sensor.status === "online" ? "default" : "destructive"}
                            className={
                              sensor.status === "online"
                                ? "bg-primary/20 text-primary hover:bg-primary/30"
                                : ""
                            }
                          >
                            {sensor.status === "online" ? "在线" : "离线"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {sensor.value} {config.unit}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  sensor.battery > 60
                                    ? "bg-primary"
                                    : sensor.battery > 30
                                    ? "bg-chart-3"
                                    : "bg-chart-4"
                                }`}
                                style={{ width: `${sensor.battery}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{sensor.battery}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{sensor.lastUpdate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-border bg-card/50 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">
          智慧农业物联网监控平台 v1.0.0 | 数据更新时间: {currentTime || "--"}
        </p>
      </footer>
    </div>
  )
}
