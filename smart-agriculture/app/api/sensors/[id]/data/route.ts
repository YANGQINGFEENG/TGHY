import { NextRequest, NextResponse } from 'next/server'

// 模拟数据库连接和操作
const mockDatabase = {
  sensorTypes: [
    { id: 1, type: 'temperature', name: '温度传感器', unit: '°C' },
    { id: 2, type: 'humidity', name: '空气湿度传感器', unit: '%' },
    { id: 3, type: 'light', name: '光照传感器', unit: 'Lux' },
    { id: 4, type: 'soil', name: '土壤湿度传感器', unit: '%' },
  ],
  sensors: [
    { id: 'T-001', name: 'A区温室1号温度传感器', type_id: 1, location: 'A区温室', status: 'online', battery: 95, last_update: new Date() },
    { id: 'T-002', name: 'A区温室2号温度传感器', type_id: 1, location: 'A区温室', status: 'online', battery: 92, last_update: new Date() },
    { id: 'T-003', name: 'B区温室1号温度传感器', type_id: 1, location: 'B区温室', status: 'online', battery: 88, last_update: new Date() },
    { id: 'H-001', name: 'A区温室1号湿度传感器', type_id: 2, location: 'A区温室', status: 'online', battery: 90, last_update: new Date() },
    { id: 'H-002', name: 'B区温室1号湿度传感器', type_id: 2, location: 'B区温室', status: 'online', battery: 85, last_update: new Date() },
    { id: 'L-001', name: 'A区温室1号光照传感器', type_id: 3, location: 'A区温室', status: 'online', battery: 93, last_update: new Date() },
    { id: 'L-002', name: 'B区温室1号光照传感器', type_id: 3, location: 'B区温室', status: 'online', battery: 89, last_update: new Date() },
    { id: 'S-001', name: 'A区温室1号土壤湿度传感器', type_id: 4, location: 'A区温室', status: 'online', battery: 91, last_update: new Date() },
    { id: 'S-002', name: 'B区温室1号土壤湿度传感器', type_id: 4, location: 'B区温室', status: 'online', battery: 87, last_update: new Date() },
    { id: 'S-003', name: 'C区大棚1号土壤湿度传感器', type_id: 4, location: 'C区大棚', status: 'online', battery: 84, last_update: new Date() },
  ],
  sensorData: [],
}

// 生成模拟数据
function generateMockData() {
  const data = []
  const now = new Date()
  
  // 为每个传感器生成24小时的数据
  mockDatabase.sensors.forEach(sensor => {
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      let value = 0
      
      if (sensor.type_id === 1) { // 温度
        value = 18 + Math.random() * 12
      } else if (sensor.type_id === 2) { // 湿度
        value = 50 + Math.random() * 30
      } else if (sensor.type_id === 3) { // 光照
        value = 5000 + Math.random() * 10000
      } else if (sensor.type_id === 4) { // 土壤湿度
        value = 30 + Math.random() * 30
      }
      
      data.push({
        id: data.length + 1,
        sensor_id: sensor.id,
        value: parseFloat(value.toFixed(2)),
        timestamp,
      })
    }
  })
  
  mockDatabase.sensorData = data
}

// 初始化模拟数据
generateMockData()

// GET /api/sensors/[id]/data - 获取传感器数据
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(request.url)
  const startTime = url.searchParams.get('startTime')
  const endTime = url.searchParams.get('endTime')
  const limit = parseInt(url.searchParams.get('limit') || '100')
  
  // 验证传感器是否存在
  const sensor = mockDatabase.sensors.find(s => s.id === id)
  if (!sensor) {
    return NextResponse.json(
      { success: false, error: '传感器不存在' },
      { status: 404 }
    )
  }
  
  // 过滤数据
  let data = mockDatabase.sensorData.filter(d => d.sensor_id === id)
  
  // 按时间范围过滤
  if (startTime) {
    const start = new Date(startTime)
    data = data.filter(d => d.timestamp >= start)
  }
  
  if (endTime) {
    const end = new Date(endTime)
    data = data.filter(d => d.timestamp <= end)
  }
  
  // 按时间降序排序
  data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  
  // 限制返回数量
  data = data.slice(0, limit)
  
  // 计算统计数据
  const values = data.map(d => d.value)
  const stats = {
    avg: values.length > 0 ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0,
    max: values.length > 0 ? Math.max(...values) : 0,
    min: values.length > 0 ? Math.min(...values) : 0,
  }
  
  return NextResponse.json({
    success: true,
    data,
    stats,
    total: data.length,
  })
}

// POST /api/sensors/[id]/data - 新增传感器数据
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // 验证请求数据
    if (typeof body.value !== 'number') {
      return NextResponse.json(
        { success: false, error: '缺少必要参数value' },
        { status: 400 }
      )
    }
    
    // 验证传感器是否存在
    const sensor = mockDatabase.sensors.find(s => s.id === id)
    if (!sensor) {
      return NextResponse.json(
        { success: false, error: '传感器不存在' },
        { status: 404 }
      )
    }
    
    const newData = {
      id: mockDatabase.sensorData.length + 1,
      sensor_id: id,
      value: parseFloat(body.value.toFixed(2)),
      timestamp: new Date(),
    }
    
    mockDatabase.sensorData.push(newData)
    
    // 更新传感器最后更新时间和状态
    sensor.last_update = newData.timestamp
    sensor.status = 'online'
    
    return NextResponse.json({
      success: true,
      data: newData,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
