
# 智能农业监控系统 - 框架架构说明

## 概述

本框架采用分层架构设计，为STM32F103C8微控制器的智能农业监控系统提供可扩展、易维护的基础架构。

## 目录结构

```
Framework/
├── Config/          # 系统配置模块
├── Core/            # 核心功能（事件驱动、任务调度）
├── Data/            # 数据管理模块
├── Protocol/        # 通信协议抽象层
├── Utils/           # 工具模块（日志等）
├── Tasks/           # 应用任务示例
├── framework.h      # 框架统一入口头文件
└── framework.c      # 框架统一入口实现
```

## 架构设计原则

### 1. 分层架构

- **硬件驱动层 (Hardware/)**: 保持现有驱动代码不变
- **协议接口层 (Framework/Protocol/)**: 抽象通信协议，支持HTTP/MQTT/TCP/UDP
- **应用业务层 (Framework/Tasks/)**: 实现具体业务逻辑

### 2. 事件驱动

采用事件队列机制，实现模块间松耦合通信。

### 3. 任务调度

基于时间片的任务调度器，避免使用阻塞式延时。

### 4. 数据集中管理

所有传感器数据、执行器状态、系统配置集中管理。

## 核心模块说明

### Config - 系统配置

文件: [sys_config.h](file:///workspace/硬件端/主代码/Framework/Config/sys_config.h), [sys_config.c](file:///workspace/硬件端/主代码/Framework/Config/sys_config.c)

功能：
- 统一管理系统配置参数
- WiFi配置、服务器配置
- 采样间隔、上传间隔等运行参数

### Core - 事件驱动与任务调度

文件: [event.h](file:///workspace/硬件端/主代码/Framework/Core/event.h), [event.c](file:///workspace/硬件端/主代码/Framework/Core/event.c)

功能：
- 事件队列管理
- 事件订阅/发布机制
- 定时任务调度
- 系统时间管理

### Data - 数据管理

文件: [data_manager.h](file:///workspace/硬件端/主代码/Framework/Data/data_manager.h), [data_manager.c](file:///workspace/硬件端/主代码/Framework/Data/data_manager.c)

功能：
- 传感器数据存储与滤波
- 执行器状态管理
- 告警配置与触发
- 系统状态监控

### Protocol - 通信协议抽象

文件: [protocol.h](file:///workspace/硬件端/主代码/Framework/Protocol/protocol.h), [protocol.c](file:///workspace/硬件端/主代码/Framework/Protocol/protocol.c)

功能：
- 协议驱动注册机制
- 统一的数据发送接口
- JSON数据格式封装
- 连接状态管理

### Utils - 工具模块

文件: [logger.h](file:///workspace/硬件端/主代码/Framework/Utils/logger.h), [logger.c](file:///workspace/硬件端/主代码/Framework/Utils/logger.c)

功能：
- 分级日志系统（DEBUG/INFO/WARN/ERROR）
- 带标签的日志输出
- 十六进制数据dump

## 使用指南

### 1. 框架初始化

```c
#include "framework.h"

int main(void)
{
    // 初始化硬件
    delay_init(72);
    usart_init(115200);
    OLED_Init();
    LED_Init();
    
    // 初始化框架
    framework_init();
    
    // 初始化应用任务
    tasks_init();
    
    // 运行框架
    framework_run();
    
    return 0;
}
```

### 2. 添加新传感器

```c
// 在Data模块中设置传感器数据
data_set_sensor_value(SENSOR_TEMP, 25.5f);

// 读取传感器数据
sensor_data_t data;
data_get_sensor_value(SENSOR_TEMP, &amp;data);
```

### 3. 创建新任务

```c
void my_task(void *param)
{
    // 任务逻辑
    log_info(LOG_TAG_TASK, "My task running");
}

// 在tasks_init中创建
int8_t task_id = task_create(my_task, NULL, 1000);
task_start(task_id);
```

### 4. 发布和订阅事件

```c
// 发布事件
event_post(EVENT_USER_1, my_data, data_len);

// 订阅事件
void my_event_handler(event_t *event)
{
    // 处理事件
}

event_subscribe(EVENT_USER_1, my_event_handler);
```

## 扩展指南

### 添加新通信协议

1. 实现`proto_driver_t`接口
2. 调用`protocol_register_driver()`注册
3. 使用`protocol_select()`选择协议

### 添加新传感器类型

1. 在`sensor_type_t`枚举中添加
2. 在数据管理器中使用

## 优势

1. **模块化设计**: 各模块独立，便于维护和测试
2. **易于扩展**: 添加新功能不影响现有代码
3. **低耦合**: 事件驱动机制减少模块依赖
4. **可配置**: 参数集中管理，便于调试
5. **日志完善**: 便于问题定位和系统监控

## 版本历史

- v1.0.0: 初始版本，实现核心框架功能

