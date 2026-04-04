import { NextRequest, NextResponse } from 'next/server'

// 模拟数据库连接和操作
const mockDatabase = {
  sensorTypes: [
    { id: 1, type: 'temperature', name: '温度传感器', unit: '°C' },
    { id: 2, type: 'humidity', name: '空气湿度传感器', unit: '%' },
    { id: 3, type: 'light', name: '光照传感器', unit: 'Lux' },
    { id: 4, type: 'soil', name: '土壤湿度传感器', unit: '%' },
  ],
}

// GET /api/sensor-types - 获取所有传感器类型
export async function GET() {
  return NextResponse.json({
    success: true,
    data: mockDatabase.sensorTypes,
    total: mockDatabase.sensorTypes.length,
  })
}

// POST /api/sensor-types - 新增传感器类型
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    if (!body.type || !body.name || !body.unit) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }
    
    // 检查类型是否已存在
    if (mockDatabase.sensorTypes.find(t => t.type === body.type)) {
      return NextResponse.json(
        { success: false, error: '传感器类型已存在' },
        { status: 400 }
      )
    }
    
    const newType = {
      id: mockDatabase.sensorTypes.length + 1,
      type: body.type,
      name: body.name,
      unit: body.unit,
    }
    
    mockDatabase.sensorTypes.push(newType)
    
    return NextResponse.json({
      success: true,
      data: newType,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
