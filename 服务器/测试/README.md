# 农业物联网传感器数据模拟与MQTT上传系统

## 项目简介

本项目旨在开发一个农业物联网传感器数据模拟与MQTT上传系统，用于模拟各种环境、土壤、水质和安全类传感器的实时数据，并通过MQTT协议上传到物联网平台。系统将模拟春季环境下的各种传感器数据，确保数据随机但合理，为农业物联网应用提供测试和演示数据。

## 功能特性

- 模拟多种传感器数据，包括环境、土壤、水质和安全类传感器
- 通过MQTT协议将数据上传到物联网平台
- 支持春季环境参数的模拟
- 实时获取系统时间并包含在数据中
- 可配置的上传间隔和MQTT broker信息
- 详细的日志记录

## 系统架构

- **数据模拟模块**：负责生成各种传感器的模拟数据
- **MQTT客户端**：负责将数据通过MQTT协议上传
- **配置管理模块**：负责管理系统配置参数
- **日志模块**：负责记录系统运行状态和错误信息

## 目录结构

```
server/
├── config/              # 配置文件目录
│   └── config.ini       # 系统配置文件
├── src/                 # 源代码目录
│   ├── __init__.py
│   ├── sensor_simulator.py  # 传感器数据模拟模块
│   ├── mqtt_client.py       # MQTT客户端模块
│   ├── config_manager.py    # 配置管理模块
│   └── logger.py            # 日志模块
├── logs/                # 日志文件目录
├── main.py              # 主程序
├── requirements.txt     # 依赖库
├── README.md            # 项目说明
└── 开发技术文档.md         # 开发技术文档
```

## 环境要求

- Python 3.7+
- paho-mqtt 1.6.1
- MQTT broker（如Mosquitto、EMQ X等）

## 安装与运行

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置MQTT broker

编辑 `config/config.ini` 文件，设置MQTT broker的信息：

```ini
[MQTT]
broker = localhost  # MQTT broker地址
port = 1883         # MQTT broker端口
username =          # 用户名（可选）
password =          # 密码（可选）

[Simulation]
interval = 10       # 数据上传间隔（秒）
device_id_prefix = device_  # 设备ID前缀
```

### 3. 运行系统

```bash
python main.py
```

## MQTT消息格式

### 消息主题

- 环境类传感器：`agriculture/iot/environment`
- 土壤类传感器：`agriculture/iot/soil`
- 水质类传感器：`agriculture/iot/water`
- 安全类传感器：`agriculture/iot/security`

### 消息payload格式

```json
{
  "device_id": "env_device_001",
  "timestamp": "2023-04-01T12:00:00",
  "season": "spring",
  "sensors": {
    "temperature": {
      "value": 22.5,
      "unit": "℃"
    },
    "humidity": {
      "value": 55.0,
      "unit": "%"
    },
    "illumination": {
      "value": 5000,
      "unit": "lux"
    },
    "co2": {
      "value": 800,
      "unit": "ppm"
    },
    "pressure": {
      "value": 1013.2,
      "unit": "hPa"
    }
  }
}
```

## 传感器数据范围

### 环境类传感器
- **温度**：15-25℃（春季）
- **湿度**：40%-70%（春季）
- **光照强度**：0-10000 lux（根据时间变化）
- **CO₂浓度**：400-2000 ppm
- **气压**：1000-1020 hPa

### 土壤类传感器
- **土壤湿度**：20%-80%
- **土壤pH值**：5.5-7.5
- **土壤EC值**：0.1-2.0 mS/cm

### 水质类传感器
- **水质pH值**：6.5-8.5
- **溶解氧**：5-10 mg/L
- **浊度**：0-50 NTU

### 安全类传感器
- **人体红外**：True/False（有人/无人）
- **烟雾**：0-1000 ppm（95%概率为0-200 ppm，5%概率为500-1000 ppm）
- **雨滴**：True/False（降雨/无降雨）

## 扩展与维护

### 扩展新传感器
1. 在 `sensor_simulator.py` 中添加新的传感器模拟方法
2. 在 `generate_all_sensors_data` 方法中添加新传感器的数据
3. 重启系统

### 调整模拟参数
1. 修改 `sensor_simulator.py` 中的模拟方法，调整数据范围和波动幅度
2. 重启系统

### 系统维护
1. 定期检查 `logs/app.log` 文件，及时发现和解决问题
2. 根据MQTT broker的稳定性调整重连策略
3. 优化数据上传频率，平衡实时性和系统负载

## 故障排查

1. **MQTT连接失败**：检查MQTT broker地址、端口、用户名和密码是否正确
2. **数据上传失败**：检查网络连接和MQTT broker状态
3. **日志文件不存在**：确保logs目录存在且有写入权限
4. **配置文件不存在**：系统会自动创建默认配置文件

## 许可证

本项目采用MIT许可证。
