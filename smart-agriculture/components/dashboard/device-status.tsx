"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Wifi,
  WifiOff,
  Signal,
  Battery,
  RefreshCw,
  MoreVertical,
  MapPin,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const devices = [
  {
    id: "DEV-001",
    name: "温湿度采集器 #1",
    type: "环境监测",
    location: "大棚1区 - A排",
    status: "online",
    signal: 95,
    battery: 87,
    lastSync: "1分钟前",
    ip: "192.168.1.101",
  },
  {
    id: "DEV-002",
    name: "土壤传感节点 #1",
    type: "土壤监测",
    location: "大棚1区 - B排",
    status: "online",
    signal: 88,
    battery: 92,
    lastSync: "2分钟前",
    ip: "192.168.1.102",
  },
  {
    id: "DEV-003",
    name: "光照感应器 #1",
    type: "光照监测",
    location: "大棚2区 - A排",
    status: "online",
    signal: 72,
    battery: 65,
    lastSync: "3分钟前",
    ip: "192.168.1.103",
  },
  {
    id: "DEV-004",
    name: "智能灌溉控制器",
    type: "执行设备",
    location: "大棚2区 - 中央",
    status: "offline",
    signal: 0,
    battery: 0,
    lastSync: "2小时前",
    ip: "192.168.1.104",
  },
  {
    id: "DEV-005",
    name: "温湿度采集器 #2",
    type: "环境监测",
    location: "大棚3区 - A排",
    status: "online",
    signal: 91,
    battery: 78,
    lastSync: "1分钟前",
    ip: "192.168.1.105",
  },
  {
    id: "DEV-006",
    name: "气象站主机",
    type: "气象监测",
    location: "室外 - 北区",
    status: "warning",
    signal: 45,
    battery: 23,
    lastSync: "5分钟前",
    ip: "192.168.1.106",
  },
]

const summaryStats = [
  { label: "在线设备", value: 4, color: "text-primary" },
  { label: "离线设备", value: 1, color: "text-destructive" },
  { label: "警告状态", value: 1, color: "text-chart-3" },
  { label: "总设备数", value: 6, color: "text-foreground" },
]

export function DeviceStatus() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">设备连接状态</CardTitle>
          <Button variant="outline" size="sm" className="bg-secondary border-border">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新状态
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="p-4 rounded-xl border border-border bg-secondary/30 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        device.status === "online"
                          ? "bg-primary/20"
                          : device.status === "warning"
                          ? "bg-chart-3/20"
                          : "bg-destructive/20"
                      }`}
                    >
                      {device.status === "online" ? (
                        <Wifi className="w-5 h-5 text-primary" />
                      ) : device.status === "warning" ? (
                        <AlertCircle className="w-5 h-5 text-chart-3" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{device.name}</h4>
                      <p className="text-xs text-muted-foreground">{device.id}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>查看详情</DropdownMenuItem>
                      <DropdownMenuItem>重启设备</DropdownMenuItem>
                      <DropdownMenuItem>设备配置</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge
                      variant="secondary"
                      className="bg-secondary text-muted-foreground text-xs"
                    >
                      {device.type}
                    </Badge>
                    <Badge
                      className={
                        device.status === "online"
                          ? "bg-primary/20 text-primary"
                          : device.status === "warning"
                          ? "bg-chart-3/20 text-chart-3"
                          : "bg-destructive/20 text-destructive"
                      }
                    >
                      {device.status === "online"
                        ? "在线"
                        : device.status === "warning"
                        ? "警告"
                        : "离线"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {device.location}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Signal className="w-3 h-3" />
                          信号强度
                        </span>
                        <span className="text-foreground">{device.signal}%</span>
                      </div>
                      <Progress value={device.signal} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Battery className="w-3 h-3" />
                          电池电量
                        </span>
                        <span className="text-foreground">{device.battery}%</span>
                      </div>
                      <Progress
                        value={device.battery}
                        className={`h-1 ${
                          device.battery < 30 ? "[&>div]:bg-destructive" : ""
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {device.lastSync}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="w-3 h-3" />
                      {device.ip}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
