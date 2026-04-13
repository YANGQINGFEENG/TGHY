"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

const ChartsClient = dynamic(
  () => import("./charts-client").then((mod) => mod.ChartsClient),
  {
    ssr: false,
    loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-card border-border animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">温度趋势</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Spinner className="text-primary" />
            <span className="text-sm">加载数据中...</span>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">湿度对比</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Spinner className="text-primary" />
            <span className="text-sm">加载数据中...</span>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border lg:col-span-2 animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">本周数据汇总</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Spinner className="text-primary" />
            <span className="text-sm">加载数据中...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  }
)

export function DataCharts() {
  return <ChartsClient />
}
