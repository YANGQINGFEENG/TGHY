/**
 * 配置管理模块
 * 负责管理上传测试的配置参数
 */

const fs = require('fs')
const path = require('path')

/**
 * 默认传感器配置
 */
const DEFAULT_SENSORS = [
  { id: 'T-001', name: '温度传感器1', min: 18, max: 30, unit: '°C', type: 'temperature' },
  { id: 'T-002', name: '温度传感器2', min: 18, max: 30, unit: '°C', type: 'temperature' },
  { id: 'T-003', name: '温度传感器3', min: 18, max: 30, unit: '°C', type: 'temperature' },
  { id: 'H-001', name: '湿度传感器1', min: 50, max: 80, unit: '%', type: 'humidity' },
  { id: 'H-002', name: '湿度传感器2', min: 50, max: 80, unit: '%', type: 'humidity' },
  { id: 'L-001', name: '光照传感器1', min: 5000, max: 15000, unit: 'Lux', type: 'light' },
  { id: 'L-002', name: '光照传感器2', min: 5000, max: 15000, unit: 'Lux', type: 'light' },
  { id: 'S-001', name: '土壤湿度传感器1', min: 30, max: 60, unit: '%', type: 'soil' },
  { id: 'S-002', name: '土壤湿度传感器2', min: 30, max: 60, unit: '%', type: 'soil' },
  { id: 'S-003', name: '土壤湿度传感器3', min: 30, max: 60, unit: '%', type: 'soil' }
]

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
  serverUrl: 'http://localhost:3000',
  uploadInterval: 5,
  maxUploadCount: 10,
  sensors: DEFAULT_SENSORS,
  selectedSensors: DEFAULT_SENSORS.map(s => s.id),
  uploadMode: 'sensor',
  filePath: '',
  uploadUrl: ''
}

/**
 * 配置管理器类
 */
class ConfigManager {
  constructor(configPath = './config.json') {
    this.configPath = configPath
    this.config = this.loadConfig()
  }

  /**
   * 加载配置
   * @returns {Object} 配置对象
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8')
        const config = JSON.parse(data)
        
        // 合并默认配置，确保所有字段都存在
        return {
          ...DEFAULT_CONFIG,
          ...config
        }
      }
    } catch (error) {
      console.error('加载配置失败:', error.message)
    }
    
    return { ...DEFAULT_CONFIG }
  }

  /**
   * 保存配置
   * @param {Object} config - 配置对象
   */
  saveConfig(config) {
    try {
      this.config = { ...this.config, ...config }
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8')
      return true
    } catch (error) {
      console.error('保存配置失败:', error.message)
      return false
    }
  }

  /**
   * 获取配置
   * @returns {Object} 配置对象
   */
  getConfig() {
    return { ...this.config }
  }

  /**
   * 更新配置
   * @param {string} key - 配置键
   * @param {*} value - 配置值
   */
  updateConfig(key, value) {
    this.config[key] = value
    this.saveConfig(this.config)
  }

  /**
   * 重置配置为默认值
   */
  resetConfig() {
    this.config = { ...DEFAULT_CONFIG }
    this.saveConfig(this.config)
  }

  /**
   * 获取选中的传感器
   * @returns {Array<Object>} 选中的传感器数组
   */
  getSelectedSensors() {
    return this.config.sensors.filter(s => 
      this.config.selectedSensors.includes(s.id)
    )
  }

  /**
   * 设置选中的传感器
   * @param {Array<string>} sensorIds - 传感器ID数组
   */
  setSelectedSensors(sensorIds) {
    this.updateConfig('selectedSensors', sensorIds)
  }

  /**
   * 添加自定义传感器
   * @param {Object} sensor - 传感器配置
   */
  addCustomSensor(sensor) {
    const sensors = [...this.config.sensors]
    
    // 检查是否已存在
    const index = sensors.findIndex(s => s.id === sensor.id)
    if (index >= 0) {
      sensors[index] = sensor
    } else {
      sensors.push(sensor)
    }
    
    this.updateConfig('sensors', sensors)
  }

  /**
   * 删除自定义传感器
   * @param {string} sensorId - 传感器ID
   */
  removeCustomSensor(sensorId) {
    const sensors = this.config.sensors.filter(s => s.id !== sensorId)
    const selectedSensors = this.config.selectedSensors.filter(id => id !== sensorId)
    
    this.config.sensors = sensors
    this.config.selectedSensors = selectedSensors
    this.saveConfig(this.config)
  }

  /**
   * 验证配置
   * @returns {Object} 验证结果
   */
  validateConfig() {
    const errors = []
    
    if (!this.config.serverUrl) {
      errors.push('服务器地址不能为空')
    }
    
    if (this.config.uploadInterval < 1) {
      errors.push('上传间隔不能小于1秒')
    }
    
    if (this.config.maxUploadCount < 1) {
      errors.push('上传次数不能小于1')
    }
    
    if (this.config.uploadMode === 'sensor' && this.config.selectedSensors.length === 0) {
      errors.push('请至少选择一个传感器')
    }
    
    if (this.config.uploadMode === 'file' && !this.config.filePath) {
      errors.push('请选择要上传的文件')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

module.exports = {
  ConfigManager,
  DEFAULT_SENSORS,
  DEFAULT_CONFIG
}
