/**
 * Electron 主进程
 * 负责创建窗口、管理应用生命周期
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

let mainWindow

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: '智慧农业 - 数据上传测试工具'
  })

  mainWindow.loadFile('index.html')

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * 应用准备就绪
 */
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

/**
 * 所有窗口关闭时退出应用
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * IPC 处理：选择文件
 */
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: '所有文件', extensions: ['*'] },
      { name: 'JSON 文件', extensions: ['json'] },
      { name: 'CSV 文件', extensions: ['csv'] },
      { name: '文本文件', extensions: ['txt'] }
    ]
  })
  
  return result.filePaths[0] || null
})

/**
 * IPC 处理：选择文件夹
 */
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  
  return result.filePaths[0] || null
})
