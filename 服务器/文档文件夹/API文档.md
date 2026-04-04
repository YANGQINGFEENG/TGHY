# API接口文档

## 1. 概述

本系统提供了一系列RESTful API接口，用于查询设备信息和传感器数据。所有API接口均返回JSON格式数据。

### 1.1 API基础URL

```
http://localhost:5000/api
```

### 1.2 响应格式

所有API接口返回的响应格式如下：

```json
{
  "success": true,  // 操作是否成功
  "data": {...},   // 返回的数据（成功时）
  "error": "..."   // 错误信息（失败时）
}
```

## 2. 设备管理接口

### 2.1 获取设备列表

**接口描述**：获取所有设备的列表

**URL**：`/api/devices`

**方法**：GET

**参数**：无

**成功响应**：

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "device_id": "esp32_001",
      "device_name": "环境传感器",
      "device_type": "environment",
      "ip_address": "192.168.1.100",
      "last_seen": "2026-04-02 12:00:00",
      "created_at": "2026-04-01 00:00:00"
    },
    {
      "id": 2,
      "device_id": "esp32_002",
      "device_name": "土壤传感器",
      "device_type": "soil",
      "ip_address": "192.168.1.101",
      "last_seen": "2026-04-02 12:01:00",
      "created_at": "2026-04-01 00:01:00"
    }
  ]
}
```

**失败响应**：

```json
{
  "success": false,
  "error": "数据库连接失败"
}
```

### 2.2 获取设备详情

**接口描述**：根据设备ID获取设备详细信息

**URL**：`/api/devices/{device_id}`

**方法**：GET

**参数**：
- `device_id`：设备ID（路径参数）

**成功响应**：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "device_id": "esp32_001",
    "device_name": "环境传感器",
    "device_type": "environment",
    "ip_address": "192.168.1.100",
    "last_seen": "2026-04-02 12:00:00",
    "created_at": "2026-04-01 00:00:00"
  }
}
```

**失败响应**：

```json
{
  "success": false,
  "error": "设备不存在"
}
```

## 3. 传感器数据接口

### 3.1 获取传感器数据

**接口描述**：获取传感器数据，支持按设备ID和传感器类型筛选

**URL**：`/api/sensor-data`

**方法**：GET

**参数**：
- `device_id`：设备ID（可选）
- `sensor_type`：传感器类型（可选）
- `limit`：返回数据条数（默认100）

**示例请求**：
```
/api/sensor-data?device_id=esp32_001&sensor_type=temperature&limit=50
```

**成功响应**：

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "device_id": "esp32_001",
      "timestamp": "2026-04-02 12:00:00",
      "sensor_type": "temperature",
      "value": 25.5,
      "unit": "℃",
      "created_at": "2026-04-02 12:00:00"
    },
    {
      "id": 2,
      "device_id": "esp32_001",
      "timestamp": "2026-04-02 11:55:00",
      "sensor_type": "temperature",
      "value": 25.3,
      "unit": "℃",
      "created_at": "2026-04-02 11:55:00"
    }
  ]
}
```

**失败响应**：

```json
{
  "success": false,
  "error": "获取数据失败"
}
```

### 3.2 获取最新传感器数据

**接口描述**：获取最新的传感器数据，支持按设备ID和传感器类型筛选

**URL**：`/api/sensor-data/latest`

**方法**：GET

**参数**：
- `device_id`：设备ID（可选）
- `sensor_type`：传感器类型（可选）

**示例请求**：
```
/api/sensor-data/latest?device_id=esp32_001&sensor_type=humidity
```

**成功响应**：

```json
{
  "success": true,
  "data": {
    "id": 5,
    "device_id": "esp32_001",
    "timestamp": "2026-04-02 12:00:00",
    "sensor_type": "humidity",
    "value": 60.0,
    "unit": "%",
    "created_at": "2026-04-02 12:00:00"
  }
}
```

**失败响应**：

```json
{
  "success": false,
  "error": "没有找到数据"
}
```

## 4. 数据格式说明

### 4.1 设备类型

- `environment`：环境传感器
- `soil`：土壤传感器
- `water`：水质传感器
- `security`：安全传感器

### 4.2 传感器类型

| 传感器类型 | 描述 | 单位 |
|-----------|------|------|
| temperature | 温度 | ℃ |
| humidity | 湿度 | % |
| illumination | 光照强度 | lux |
| co2 | CO2浓度 | ppm |
| pressure | 气压 | hPa |
| soil_moisture | 土壤湿度 | % |
| soil_ph | 土壤pH值 | pH |
| soil_ec | 土壤EC值 | mS/cm |
| water_ph | 水质pH值 | pH |
| dissolved_oxygen | 溶解氧 | mg/L |
| turbidity | 浊度 | NTU |
| pir | 人体红外 | status |
| smoke | 烟雾浓度 | ppm |
| rain | 雨滴 | status |

## 5. 错误码说明

| 错误码 | 描述 |
|-------|------|
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 6. 示例代码

### 6.1 使用Python请求API

```python
import requests

# 获取设备列表
response = requests.get('http://localhost:5000/api/devices')
data = response.json()
print(data)

# 获取设备详情
response = requests.get('http://localhost:5000/api/devices/esp32_001')
data = response.json()
print(data)

# 获取传感器数据
response = requests.get('http://localhost:5000/api/sensor-data?device_id=esp32_001&sensor_type=temperature')
data = response.json()
print(data)

# 获取最新传感器数据
response = requests.get('http://localhost:5000/api/sensor-data/latest?device_id=esp32_001&sensor_type=humidity')
data = response.json()
print(data)
```

### 6.2 使用JavaScript请求API

```javascript
// 获取设备列表
fetch('http://localhost:5000/api/devices')
  .then(response => response.json())
  .then(data => console.log(data));

// 获取设备详情
fetch('http://localhost:5000/api/devices/esp32_001')
  .then(response => response.json())
  .then(data => console.log(data));

// 获取传感器数据
fetch('http://localhost:5000/api/sensor-data?device_id=esp32_001&sensor_type=temperature')
  .then(response => response.json())
  .then(data => console.log(data));

// 获取最新传感器数据
fetch('http://localhost:5000/api/sensor-data/latest?device_id=esp32_001&sensor_type=humidity')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 7. 性能优化建议

1. **使用缓存**：对于频繁查询的数据，可以使用缓存减少数据库查询
2. **分页查询**：当数据量较大时，使用分页查询减少数据传输
3. **合理使用参数**：通过device_id和sensor_type参数筛选数据，减少返回数据量
4. **优化数据库索引**：确保数据库表有适当的索引

## 8. 安全注意事项

1. **访问控制**：建议在生产环境中添加访问控制
2. **输入验证**：对API输入参数进行验证，防止SQL注入等攻击
3. **HTTPS**：在生产环境中使用HTTPS加密传输
4. **速率限制**：实现API速率限制，防止滥用
