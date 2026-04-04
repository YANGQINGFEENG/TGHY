"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Sun, Leaf, TrendingUp, TrendingDown } from "lucide-react"

const stats = [
  {
    title: "平均温度",
    value: "24.5",
    unit: "°C",
    change: "+2.3%",
    trend: "up",
    icon: Thermometer,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    slug: "temperature",
  },
  {
    title: "空气湿度",
    value: "68",
    unit: "%",
    change: "-1.2%",
    trend: "down",
    icon: Droplets,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    slug: "humidity",
  },
  {
    title: "光照强度",
    value: "12,450",
    unit: "Lux",
    change: "+5.8%",
    trend: "up",
    icon: Sun,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    slug: "light",
  },
  {
    title: "土壤湿度",
    value: "42",
    unit: "%",
    change: "+0.8%",
    trend: "up",
    icon: Leaf,
    color: "text-primary",
    bgColor: "bg-primary/10",
    slug: "soil",
  },
]

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Link key={index} href={`/sensor/${stat.slug}`}>
          <Card className="bg-card border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.unit}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {stat.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-primary" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-chart-4" />
                )}
                <span
                  className={`text-xs ${
                    stat.trend === "up" ? "text-primary" : "text-chart-4"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">较昨日</span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                点击查看详情 →
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
