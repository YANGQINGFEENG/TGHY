/**
 * 渲染进程脚本
 * 负责 UI 交互和业务逻辑
 */

const UploadService = require('./upload-service')
const { ConfigManager, DEFAULT_SENSORS } = require('./config-manager')

// 初始化配置管理器和上传服务
const configManager = new ConfigManager()
let uploadService = null

// DOM 元素
const elements = {
  // 配置相关
  serverUrl: document.getElementById('serverUrl'),
  uploadInterval: document.getElementById('uploadInterval'),
  maxUploadCount: document.getElementById('maxUploadCount'),
  uploadMode: document.getElementById('uploadMode'),
  sensorSection: document.getElementById('sensorSection'),
  fileSection: document.getElementById('fileSection'),
  sensorGrid: document.getElementById('sensorGrid'),
  selectAllBtn: document.getElementById('selectAllBtn'),
  deselectAllBtn: document.getElementById('deselectAllBtn'),
  filePath: document.getElementById('filePath'),
  selectFileBtn: document.getElementById('selectFileBtn'),
  fileUploadUrl: document.getElementById('fileUploadUrl'),
  
  // 控制按钮
  startBtn: document.getElementById('startBtn'),
  stopBtn: document.getElementById('stopBtn'),
  resetBtn: document.getElementById('resetBtn'),
  
  // 状态显示
  totalCount: document.getElementById('totalCount'),
  successCount: document.getElementById('successCount'),
  failCount: document.getElementById('failCount'),
  currentProgress: document.getElementById('currentProgress'),
  maxProgress: document.getElementById('maxProgress'),
  progressPercent: document.getElementById('progressPercent'),
  progressFill: document.getElementById('progressFill'),
  
  // 日志
  logContainer: document.getElementById('logContainer'),
  clearLogBtn: document.getElementById('clearLogBtn'),
  
  // 状态栏
  statusText: document.getElementById('statusText')
}

/**
 * 初始化应用
 */
function initApp() {
  loadConfig()
  renderSensorList()
  bindEvents()
  updateUI()
  
  addLog('info', '应用初始化完成')
}

/**
 * 加载配置
 */
function loadConfig() {
  const config = configManager.getConfig()
  
  elements.serverUrl.value = config.serverUrl
  elements.uploadInterval.value = config.uploadInterval
  elements.maxUploadCount.value = config.maxUploadCount
  elements.uploadMode.value = config.uploadMode
  elements.filePath.value = config.filePath || ''
  elements.fileUploadUrl.value = config.uploadUrl || ''
  
  // 更新上传模式显示
  toggleUploadMode(config.uploadMode)
}

/**
 * 保存配置
 */
function saveConfig() {
  const config = {
    serverUrl: elements.serverUrl.value,
    uploadInterval: parseInt(elements.uploadInterval.value),
    maxUploadCount: parseInt(elements.maxUploadCount.value),
    uploadMode: elements.uploadMode.value,
    filePath: elements.filePath.value,
    uploadUrl: elements.fileUploadUrl.value
  }
  
  configManager.saveConfig(config)
}

/**
 * 渲染传感器列表
 */
function renderSensorList() {
  const sensors = configManager.getConfig().sensors
  const selectedSensors = configManager.getConfig().selectedSensors
  
  elements.sensorGrid.innerHTML = sensors.map(sensor => `
    <div class="sensor-item ${selectedSensors.includes(sensor.id) ? 'selected' : ''}" data-id="${sensor.id}">
      <input type="checkbox" ${selectedSensors.includes(sensor.id) ? 'checked' : ''}>
      <div class="sensor-info">
        <div class="sensor-name">${sensor.name}</div>
        <div class="sensor-range">${sensor.min} - ${sensor.max} ${sensor.unit}</div>
      </div>
    </div>
  `).join('')
  
  // 绑定传感器选择事件
  elements.sensorGrid.querySelectorAll('.sensor-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        const checkbox = item.querySelector('input')
        checkbox.checked = !checkbox.checked
      }
      
      item.classList.toggle('selected')
      updateSelectedSensors()
    })
  })
}

/**
 * 更新选中的传感器
 */
function updateSelectedSensors() {
  const selected = []
  elements.sensorGrid.querySelectorAll('.sensor-item.selected').forEach(item => {
    selected.push(item.dataset.id)
  })
  
  configManager.setSelectedSensors(selected)
}

/**
 * 绑定事件
 */
function bindEvents() {
  // 上传模式切换
  elements.uploadMode.addEventListener('change', (e) => {
    toggleUploadMode(e.target.value)
    saveConfig()
  })
  
  // 配置变更
  elements.serverUrl.addEventListener('change', saveConfig)
  elements.uploadInterval.addEventListener('change', saveConfig)
  elements.maxUploadCount.addEventListener('change', saveConfig)
  elements.filePath.addEventListener('change', saveConfig)
  elements.fileUploadUrl.addEventListener('change', saveConfig)
  
  // 全选/取消全选
  elements.selectAllBtn.addEventListener('click', () => {
    elements.sensorGrid.querySelectorAll('.sensor-item').forEach(item => {
      item.classList.add('selected')
      item.querySelector('input').checked = true
    })
    updateSelectedSensors()
  })
  
  elements.deselectAllBtn.addEventListener('click', () => {
    elements.sensorGrid.querySelectorAll('.sensor-item').forEach(item => {
      item.classList.remove('selected')
      item.querySelector('input').checked = false
    })
    updateSelectedSensors()
  })
  
  // 选择文件
  elements.selectFileBtn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.selectFile()
    if (filePath) {
      elements.filePath.value = filePath
      saveConfig()
    }
  })
  
  // 开始上传
  elements.startBtn.addEventListener('click', startUpload)
  
  // 停止上传
  elements.stopBtn.addEventListener('click', stopUpload)
  
  // 重置统计
  elements.resetBtn.addEventListener('click', resetStats)
  
  // 清空日志
  elements.clearLogBtn.addEventListener('click', () => {
    elements.logContainer.innerHTML = ''
    addLog('info', '日志已清空')
  })
}

/**
 * 切换上传模式
 */
function toggleUploadMode(mode) {
  if (mode === 'sensor') {
    elements.sensorSection.classList.remove('hidden')
    elements.fileSection.classList.add('hidden')
  } else {
    elements.sensorSection.classList.add('hidden')
    elements.fileSection.classList.remove('hidden')
  }
}

/**
 * 开始上传
 */
function startUpload() {
  // 验证配置
  const validation = configManager.validateConfig()
  if (!validation.valid) {
    validation.errors.forEach(error => {
      addLog('error', error)
    })
    return
  }
  
  // 保存配置
  saveConfig()
  
  // 初始化上传服务
  const config = configManager.getConfig()
  uploadService = new UploadService(config.serverUrl)
  
  // 更新 UI
  elements.startBtn.disabled = true
  elements.stopBtn.disabled = false
  elements.statusText.textContent = '状态：上传中...'
  
  // 重置统计
  uploadService.resetStats()
  updateStats(0, 0, 0, 0, config.maxUploadCount)
  
  addLog('info', `开始上传 - 模式: ${config.uploadMode === 'sensor' ? '传感器数据' : '文件上传'}`)
  addLog('info', `服务器地址: ${config.serverUrl}`)
  addLog('info', `上传间隔: ${config.uploadInterval} 秒`)
  addLog('info', `上传次数: ${config.maxUploadCount}`)
  
  if (config.uploadMode === 'sensor') {
    // 传感器数据上传
    const selectedSensors = configManager.getSelectedSensors()
    addLog('info', `选中传感器: ${selectedSensors.map(s => s.name).join(', ')}`)
    
    uploadService.startScheduledUpload({
      sensors: selectedSensors,
      interval: config.uploadInterval,
      maxCount: config.maxUploadCount
    }, onProgress)
  } else {
    // 文件上传
    uploadFile(config.filePath, config.uploadUrl)
  }
}

/**
 * 停止上传
 */
function stopUpload() {
  if (uploadService) {
    uploadService.stopScheduledUpload()
  }
  
  elements.startBtn.disabled = false
  elements.stopBtn.disabled = true
  elements.statusText.textContent = '状态：已停止'
  
  addLog('warning', '上传已停止')
}

/**
 * 重置统计
 */
function resetStats() {
  if (uploadService) {
    uploadService.resetStats()
  }
  
  updateStats(0, 0, 0, 0, parseInt(elements.maxUploadCount.value))
  addLog('info', '统计已重置')
}

/**
 * 上传文件
 */
async function uploadFile(filePath, uploadUrl) {
  if (!uploadService) {
    uploadService = new UploadService(elements.serverUrl.value)
  }
  
  addLog('info', `开始上传文件: ${filePath}`)
  
  const result = await uploadService.uploadFile(filePath, uploadUrl)
  
  if (result.success) {
    addLog('success', '文件上传成功')
  } else {
    addLog('error', `文件上传失败: ${result.message}`)
  }
  
  elements.startBtn.disabled = false
  elements.stopBtn.disabled = true
  elements.statusText.textContent = '状态：就绪'
}

/**
 * 进度回调
 */
function onProgress(data) {
  if (data.status === 'uploading') {
    // 更新统计
    updateStats(
      data.currentCount,
      data.uploadCount,
      data.successCount,
      data.failCount,
      data.maxCount
    )
    
    // 记录日志
    data.results.forEach(result => {
      if (result.success) {
        addLog('success', `[${result.sensorId}] 数据上传成功: ${result.value}`)
      } else {
        addLog('error', `[${result.sensorId}] 数据上传失败: ${result.message}`)
      }
    })
  } else if (data.status === 'completed') {
    // 上传完成
    elements.startBtn.disabled = false
    elements.stopBtn.disabled = true
    elements.statusText.textContent = '状态：已完成'
    
    addLog('info', `上传完成 - 总计: ${data.uploadCount}, 成功: ${data.successCount}, 失败: ${data.failCount}`)
  }
}

/**
 * 更新统计信息
 */
function updateStats(current, total, success, fail, max) {
  elements.totalCount.textContent = total
  elements.successCount.textContent = success
  elements.failCount.textContent = fail
  elements.currentProgress.textContent = current
  elements.maxProgress.textContent = max
  
  const percent = max > 0 ? Math.round((current / max) * 100) : 0
  elements.progressPercent.textContent = `${percent}%`
  elements.progressFill.style.width = `${percent}%`
}

/**
 * 更新 UI
 */
function updateUI() {
  updateStats(0, 0, 0, 0, parseInt(elements.maxUploadCount.value))
}

/**
 * 添加日志
 */
function addLog(type, message) {
  const logItem = document.createElement('div')
  logItem.className = `log-item ${type}`
  
  const time = new Date().toLocaleTimeString('zh-CN')
  logItem.innerHTML = `
    <span class="log-time">[${time}]</span>
    <span class="log-message">${message}</span>
  `
  
  elements.logContainer.appendChild(logItem)
  
  // 自动滚动到底部
  elements.logContainer.scrollTop = elements.logContainer.scrollHeight
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp)
