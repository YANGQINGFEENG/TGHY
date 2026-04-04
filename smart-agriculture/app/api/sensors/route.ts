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

// GET /api/sensors - 获取所有传感器
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type')
  
  let sensors = [...mockDatabase.sensors]
  
  if (type) {
    const typeId = mockDatabase.sensorTypes.find(t => t.type === type)?.id
    if (typeId) {
      sensors = sensors.filter(s => s.type_id === typeId)
    }
  }
  
  // 关联传感器类型信息
  const sensorsWithType = sensors.map(sensor => {
    const type = mockDatabase.sensorTypes.find(t => t.id === sensor.type_id)
    return {
      ...sensor,
      type: type?.type,
      type_name: type?.name,
      unit: type?.unit,
    }
  })
  
  return NextResponse.json({
    success: true,
    data: sensorsWithType,
    total: sensorsWithType.length,
  })
}

// POST /api/sensors - 新增传感器
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    if (!body.name || !body.type_id || !body.location) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }
    
    // 生成传感器ID
    const type = mockDatabase.sensorTypes.find(t => t.id === body.type_id)
    if (!type) {
      return NextResponse.json(
        { success: false, error: '传感器类型不存在' },
        { status: 400 }
      )
    }
    
    const typePrefix = type.type.charAt(0).toUpperCase()
    const existingIds = mockDatabase.sensors
      .filter(s => s.id.startsWith(typePrefix))
      .map(s => parseInt(s.id.split('-')[1]) || 0)
    const newId = Math.max(...existingIds, 0) + 1
    const sensorId = `${typePrefix}-${newId.toString().padStart(3, '0')}`
    
    const newSensor = {
      id: sensorId,
      name: body.name,
      type_id: body.type_id,
      location: body.location,
      status: 'offline',
      battery: 100,
      last_update: null,
    }
    
    mockDatabase.sensors.push(newSensor)
    
    return NextResponse.json({
      success: true,
      data: newSensor,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
