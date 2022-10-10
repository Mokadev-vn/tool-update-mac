const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    setTitle: (title) => ipcRenderer.send('set-title', title),
    getMAC: () => ipcRenderer.sendSync('get-mac'),
    // setWeb: (title) => ipcRenderer.send('load-web', title)
})