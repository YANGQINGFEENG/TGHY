/**
 * Electron 预加载脚本
 * 提供安全的 IPC 通信接口
 */

const { contextBridge, ipcRenderer } = require('electron')

/**
 * 暴露安全的 API 给渲染进程
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * 选择文件
   * @returns {Promise<string|null>} 文件路径
   */
  selectFile: () => ipcRenderer.invoke('select-file'),
  
  /**
   * 选择文件夹
   * @returns {Promise<string|null>} 文件夹路径
   */
  selectFolder: () => ipcRenderer.invoke('select-folder')
})
