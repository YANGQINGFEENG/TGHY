# Embedded-Agent-Bridge 快速部署指南

## 什么是 Embedded-Agent-Bridge？

Embedded-Agent-Bridge（简称 EAB）是一个让 AI 代理能够与嵌入式硬件（STM32、ESP32 等）进行交互的工具。它通过后台守护进程管理串口、GDB 和 OpenOCD，让 AI 可以通过简单的命令行调用与硬件通信，而不会卡住或浪费上下文。

---

## 前置要求

在开始之前，请确保你已经安装了：

1. **Python 3.8 或更高版本**
2. **Git**（可选，用于克隆源码）
3. **Keil MDK**（如果你在使用 STM32）
4. **ST-Link/J-Link 驱动**（根据你的调试器）

---

## 快速部署步骤（5分钟搞定）

### 第一步：安装 Embedded-Agent-Bridge

打开 PowerShell 或命令提示符，运行：

```powershell
pip install embedded-agent-bridge
```

或者，如果你想从源码安装（推荐开发者）：

```powershell
# 克隆仓库
git clone https://github.com/shanemmattner/embedded-agent-bridge.git
cd embedded-agent-bridge

# 安装
pip install -e .
```

### 第二步：验证安装

安装完成后，运行以下命令验证：

```powershell
eabctl --help
```

如果看到帮助信息，说明安装成功！

### 第三步：启动串口守护进程

将你的单片机通过 USB 连接到电脑，然后运行：

```powershell
eabctl start --port auto
```

这会自动检测可用的 USB 串口并启动守护进程。

### 第四步：测试常用命令

现在你可以使用以下命令了：

#### 1. 查看串口输出
```powershell
eabctl tail 50 --json
```

#### 2. 发送命令到设备
```powershell
eabctl send "AT+RST" --json
```

#### 3. 检查连接状态
```powershell
eabctl status --json
```

#### 4. 烧录固件（ESP32 示例）
```powershell
eabctl flash firmware.bin --chip esp32s3
```

#### 5. 健康检查
```powershell
eabctl diagnose --json
```

---

## 常见使用场景

### 场景 1：监控 STM32 串口输出

1. 确保 STM32 通过 ST-Link 或 USB 串口连接
2. 启动守护进程：
   ```powershell
   eabctl start --port auto
   ```
3. 查看实时输出：
   ```powershell
   eabctl tail 100
   ```

### 场景 2：烧录 Keil 编译的固件

1. 先用 Keil 编译项目，确保生成了 `.hex` 文件
2. 找到 `.hex` 文件路径（通常在 `Objects/` 目录下）
3. 烧录固件（STM32 示例）：
   ```powershell
   eabctl flash Objects/Project.hex --chip stm32
   ```

### 场景 3：使用 OpenOCD 调试

1. 启动 OpenOCD：
   ```powershell
   eabctl openocd start --chip stm32f103
   ```
2. 运行 GDB 命令：
   ```powershell
   eabctl gdb --cmd "bt" --cmd "info registers"
   ```

---

## 配置文件

EAB 的配置和日志文件通常位于：
- **Windows**: `%USERPROFILE%\.embedded-agent-bridge\`
- **Linux/Mac**: `~/.embedded-agent-bridge/`

重要文件：
- `latest.log` - 最新的串口日志
- `events.jsonl` - JSON 格式的事件流
- `alerts.log` - 警报日志（崩溃、错误等）

---

## 故障排除

### 问题 1：找不到串口
**解决方案**：
- 检查 USB 线是否连接好
- 确认设备管理器中有串口设备
- 尝试手动指定端口：`eabctl start --port COM3`

### 问题 2：权限不足
**解决方案**：
- Windows：以管理员身份运行 PowerShell
- Linux：将用户添加到 dialout 组：`sudo usermod -aG dialout $USER`

### 问题 3：烧录失败
**解决方案**：
- 检查调试器驱动是否正确安装
- 确认芯片型号参数正确（`--chip stm32` 或 `--chip esp32`）
- 尝试先停止守护进程再烧录

---

## 与你的项目配合使用

你已经创建了两个 skill，可以与 EAB 配合使用：

1. **keil-compile-result-check** - 检查 Keil 编译结果
2. **keil-firmware-flasher** - 烧录固件到单片机

这两个 skill 都会自动使用 EAB 来完成它们的任务！

---

## 下一步

- 访问 [GitHub 项目页面](https://github.com/shanemmattner/embedded-agent-bridge) 查看完整文档
- 尝试硬件在环（HIL）测试功能
- 探索 RTT 实时传输功能

祝你使用愉快！🚀
