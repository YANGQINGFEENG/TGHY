"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"

const sensorData = [
  {
    id: "SN-001",
    name: "温度传感器 A1",
    type: "温度",
    value: "24.5°C",
    location: "大棚1区",
    time: "2024-01-15 14:30:25",
    status: "正常",
  },
  {
    id: "SN-002",
    name: "湿度传感器 B1",
    type: "湿度",
    value: "68%",
    location: "大棚1区",
    time: "2024-01-15 14:30:22",
    status: "正常",
  },
  {
    id: "SN-003",
    name: "土壤传感器 C1",
    type: "土壤",
    value: "42%",
    location: "大棚2区",
    time: "2024-01-15 14:30:18",
    status: "正常",
  },
  {
    id: "SN-004",
    name: "光照传感器 D1",
    type: "光照",
    value: "12,450 Lux",
    location: "大棚2区",
    time: "2024-01-15 14:30:15",
    status: "正常",
  },
  {
    id: "SN-005",
    name: "温度传感器 A2",
    type: "温度",
    value: "32.8°C",
    location: "大棚3区",
    time: "2024-01-15 14:30:12",
    status: "警告",
  },
  {
    id: "SN-006",
    name: "湿度传感器 B2",
    type: "湿度",
    value: "25%",
    location: "大棚3区",
    time: "2024-01-15 14:30:08",
    status: "警告",
  },
  {
    id: "SN-007",
    name: "土壤传感器 C2",
    type: "土壤",
    value: "58%",
    location: "大棚4区",
    time: "2024-01-15 14:30:05",
    status: "正常",
  },
  {
    id: "SN-008",
    name: "光照传感器 D2",
    type: "光照",
    value: "8,200 Lux",
    location: "大棚4区",
    time: "2024-01-15 14:30:02",
    status: "正常",
  },
]

export function DetailedData() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredData = sensorData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || item.type === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span>精细数据查看</span>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索传感器..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[200px] bg-secondary border-border"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px] bg-secondary border-border">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="筛选类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="温度">温度</SelectItem>
                <SelectItem value="湿度">湿度</SelectItem>
                <SelectItem value="土壤">土壤</SelectItem>
                <SelectItem value="光照">光照</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="text-muted-foreground">传感器ID</TableHead>
                <TableHead className="text-muted-foreground">名称</TableHead>
                <TableHead className="text-muted-foreground">类型</TableHead>
                <TableHead className="text-muted-foreground">当前数值</TableHead>
                <TableHead className="text-muted-foreground">位置</TableHead>
                <TableHead className="text-muted-foreground">更新时间</TableHead>
                <TableHead className="text-muted-foreground">状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-secondary/30">
                  <TableCell className="font-mono text-sm text-foreground">{item.id}</TableCell>
                  <TableCell className="text-foreground">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{item.value}</TableCell>
                  <TableCell className="text-muted-foreground">{item.location}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.time}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.status === "正常"
                          ? "bg-primary/20 text-primary hover:bg-primary/30"
                          : "bg-chart-3/20 text-chart-3 hover:bg-chart-3/30"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            显示 {filteredData.length} 条记录，共 {sensorData.length} 条
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-secondary border-border">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">第 1 页</span>
            <Button variant="outline" size="sm" className="bg-secondary border-border">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
