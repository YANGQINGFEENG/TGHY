/**
 * 上传服务模块
 * 负责处理文件和数据上传
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

/**
 * 上传服务类
 */
class UploadService {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl
    this.uploadCount = 0
    this.successCount = 0
    this.failCount = 0
    this.isRunning = false
    this.timer = null
  }

  /**
   * 设置服务器地址
   * @param {string} url - 服务器地址
   */
  setBaseUrl(url) {
    this.baseUrl = url
  }

  /**
   * 上传传感器数据
   * @param {string} sensorId - 传感器ID
   * @param {number} value - 数据值
   * @returns {Promise<Object>} 上传结果
   */
  async uploadSensorData(sensorId, value) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/sensors/${sensorId}/data`, {
        value: value
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      this.uploadCount++
      
      if (response.data.success) {
        this.successCount++
        return {
          success: true,
          sensorId,
          value,
          message: '上传成功'
        }
      } else {
        this.failCount++
        return {
          success: false,
          sensorId,
          value,
          message: response.data.error || '上传失败'
        }
      }
    } catch (error) {
      this.uploadCount++
      this.failCount++
      return {
        success: false,
        sensorId,
        value,
        message: error.message
      }
    }
  }

  /**
   * 上传文件
   * @param {string} filePath - 文件路径
   * @param {string} uploadUrl - 上传地址
   * @returns {Promise<Object>} 上传结果
   */
  async uploadFile(filePath, uploadUrl) {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: '文件不存在'
        }
      }

      const formData = new FormData()
      formData.append('file', fs.createReadStream(filePath))

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders()
        }
      })

      this.uploadCount++
      this.successCount++

      return {
        success: true,
        filePath,
        message: '文件上传成功'
      }
    } catch (error) {
      this.uploadCount++
      this.failCount++
      return {
        success: false,
        filePath,
        message: error.message
      }
    }
  }

  /**
   * 批量上传传感器数据
   * @param {Array<Object>} sensors - 传感器数据数组
   * @returns {Promise<Array>} 上传结果数组
   */
  async batchUploadSensorData(sensors) {
    const results = []
    
    for (const sensor of sensors) {
      const result = await this.uploadSensorData(sensor.id, sensor.value)
      results.push(result)
      
      // 添加延迟，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return results
  }

  /**
   * 生成随机传感器数据
   * @param {Array<Object>} sensorConfigs - 传感器配置数组
   * @returns {Array<Object>} 生成的传感器数据
   */
  generateRandomData(sensorConfigs) {
    return sensorConfigs.map(config => ({
      id: config.id,
      value: parseFloat((config.min + Math.random() * (config.max - config.min)).toFixed(2))
    }))
  }

  /**
   * 开始定时上传
   * @param {Object} config - 配置对象
   * @param {Function} onProgress - 进度回调函数
   */
  startScheduledUpload(config, onProgress) {
    if (this.isRunning) {
      return
    }

    this.isRunning = true
    this.uploadCount = 0
    this.successCount = 0
    this.failCount = 0

    let currentCount = 0
    const maxCount = config.maxCount || 10
    const interval = (config.interval || 5) * 1000

    const upload = async () => {
      if (!this.isRunning || currentCount >= maxCount) {
        this.stopScheduledUpload()
        if (onProgress) {
          onProgress({
            status: 'completed',
            currentCount,
            maxCount,
            uploadCount: this.uploadCount,
            successCount: this.successCount,
            failCount: this.failCount
          })
        }
        return
      }

      currentCount++
      
      // 生成随机数据
      const sensorData = this.generateRandomData(config.sensors)
      
      // 批量上传
      const results = await this.batchUploadSensorData(sensorData)
      
      // 回调进度
      if (onProgress) {
        onProgress({
          status: 'uploading',
          currentCount,
          maxCount,
          uploadCount: this.uploadCount,
          successCount: this.successCount,
          failCount: this.failCount,
          results
        })
      }

      // 设置下一次上传
      if (this.isRunning && currentCount < maxCount) {
        this.timer = setTimeout(upload, interval)
      }
    }

    // 立即执行第一次上传
    upload()
  }

  /**
   * 停止定时上传
   */
  stopScheduledUpload() {
    this.isRunning = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      uploadCount: this.uploadCount,
      successCount: this.successCount,
      failCount: this.failCount,
      isRunning: this.isRunning
    }
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.uploadCount = 0
    this.successCount = 0
    this.failCount = 0
  }
}

module.exports = UploadService
