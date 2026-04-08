# API请求文档

## 基础信息

- **API服务器地址**：http://localhost:5000
- **请求格式**：GET请求
- **响应格式**：JSON格式
- **CORS**：已启用，支持跨域请求

## API端点列表

### 1. 获取所有设备列表

**端点**：`GET /api/devices`

**功能**：获取系统中所有设备的列表

**请求参数**：无

**响应格式**：
```json
{
  "success": true,
  "data": [
    {
      "device_id": "string",
      "device_name": "string",
      "device_type": "string",
      "status": "string",
      "last_active": "datetime"
    }
  ]
}
```

**错误响应**：
```json
{
  "success": false,
  "error": "错误信息"
}
```

**状态码**：
- 200：成功
- 500：服务器内部错误

### 2. 获取设备详细信息

**端点**：`GET /api/devices/<device_id>`

**功能**：根据设备ID获取设备的详细信息

**请求参数**：
- `device_id`：路径参数，设备的唯一标识符

**响应格式**：
```json
{
  "success": true,
  "data": {
    "device_id": "string",
    "device_name": "string",
    "device_type": "string",
    "status": "string",
    "last_active": "datetime"
  }
}
```

**错误响应**：
- 设备不存在：
  ```json
  {
    "success": false,
    "error": "设备不存在"
  }
  ```
- 其他错误：
  ```json
  {
    "success": false,
    "error": "错误信息"
  }
  ```

**状态码**：
- 200：成功
- 404：设备不存在
- 500：服务器内部错误

### 3. 获取传感器数据

**端点**：`GET /api/sensor-data`

**功能**：获取传感器数据，支持按设备ID和传感器类型过滤

**请求参数**：
- `device_id`：查询参数，可选，设备ID
- `sensor_type`：查询参数，可选，传感器类型
- `limit`：查询参数，可选，返回数据的最大数量，默认值为100

**响应格式**：
```json
{
  "success": true,
  "data": [
    {
      "id": "integer",
      "device_id": "string",
      "sensor_type": "string",
      "value": "float",
      "unit": "string",
      "timestamp": "datetime"
    }
  ]
}
```

**错误响应**：
```json
{
  "success": false,
  "error": "错误信息"
}
```

**状态码**：
- 200：成功
- 500：服务器内部错误

### 4. 获取最新的传感器数据

**端点**：`GET /api/sensor-data/latest`

**功能**：获取最新的传感器数据，支持按设备ID和传感器类型过滤

**请求参数**：
- `device_id`：查询参数，可选，设备ID
- `sensor_type`：查询参数，可选，传感器类型

**响应格式**：
```json
{
  "success": true,
  "data": {
    "id": "integer",
    "device_id": "string",
    "sensor_type": "string",
    "value": "float",
    "unit": "string",
    "timestamp": "datetime"
  }
}
```

**错误响应**：
- 没有找到数据：
  ```json
  {
    "success": false,
    "error": "没有找到数据"
  }
  ```
- 其他错误：
  ```json
  {
    "success": false,
    "error": "错误信息"
  }
  ```

**状态码**：
- 200：成功
- 404：没有找到数据
- 500：服务器内部错误

## 示例请求

### 1. 获取所有设备列表
```
GET http://localhost:5000/api/devices
```

### 2. 获取特定设备信息
```
GET http://localhost:5000/api/devices/device123
```

### 3. 获取特定设备的传感器数据
```
GET http://localhost:5000/api/sensor-data?device_id=device123&limit=50
```

### 4. 获取特定传感器类型的最新数据
```
GET http://localhost:5000/api/sensor-data/latest?sensor_type=temperature
```

## 注意事项

1. 所有API响应都包含`success`字段，表示请求是否成功
2. 成功响应的`data`字段包含实际数据
3. 失败响应的`error`字段包含错误信息
4. 传感器数据按时间戳降序排列，最新的数据排在前面
5. 所有时间戳格式遵循ISO 8601标准