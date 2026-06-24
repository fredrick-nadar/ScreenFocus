import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { createTray } from './tray'
import { registerIpcHandlers } from './ipc-handlers'
import { initDatabase, getDb } from './database/db'
import { TrackingService } from './tracking/tracker'

let mainWindow: BrowserWindow | null = null
let trackingService: TrackingService | null = null
let pinScriptPath: string | null = null

function ensurePinScript(): string {
  if (pinScriptPath) return pinScriptPath

  const { writeFileSync, existsSync, mkdirSync } = require('fs')

  const scriptDir = join(app.getPath('userData'), 'scripts')
  if (!existsSync(scriptDir)) {
    mkdirSync(scriptDir, { recursive: true })
  }

  pinScriptPath = join(scriptDir, 'pin-desktop.ps1')

  const script = `param(
    [string]$HwndHex,
    [string]$Action
)

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

public class DesktopWidget {
    [DllImport("user32.dll")]
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

    [DllImport("user32.dll")]
    public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam, uint fuFlags, uint uTimeout, out IntPtr lpdwResult);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll")]
    public static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);

    [DllImport("user32.dll")]
    public static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);

    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    public static void PinToDesktop(IntPtr childHwnd) {
        IntPtr progman = FindWindow("Progman", null);
        IntPtr result = IntPtr.Zero;
        
        SendMessageTimeout(progman, 0x052C, IntPtr.Zero, IntPtr.Zero, 0, 1000, out result);
        
        IntPtr workerw = IntPtr.Zero;
        EnumWindows(new EnumWindowsProc((hwnd, lParam) => {
            IntPtr p = FindWindowEx(hwnd, IntPtr.Zero, "SHELLDLL_DefView", null);
            if (p != IntPtr.Zero) {
                workerw = FindWindowEx(IntPtr.Zero, hwnd, "WorkerW", null);
            }
            return true;
        }), IntPtr.Zero);
        
        if (workerw == IntPtr.Zero) {
            workerw = progman;
        }
        
        SetParent(childHwnd, workerw);
    }

    public static void UnpinFromDesktop(IntPtr childHwnd) {
        SetParent(childHwnd, IntPtr.Zero);
    }
}
'@

$childHwnd = [IntPtr][Convert]::ToInt64($HwndHex, 16)
if ($Action -eq "pin") {
    [DesktopWidget]::PinToDesktop($childHwnd)
} else {
    [DesktopWidget]::UnpinFromDesktop($childHwnd)
}
`
  writeFileSync(pinScriptPath, script, 'utf8')
  return pinScriptPath
}

function runPinScript(win: BrowserWindow, action: 'pin' | 'unpin'): void {
  if (process.platform !== 'win32') return

  const { execFile } = require('child_process')
  const scriptPath = ensurePinScript()
  const hwndHex = '0x' + Buffer.from(win.getNativeWindowHandle()).reverse().toString('hex')

  execFile(
    'powershell.exe',
    ['-NoProfile', '-NoLogo', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, hwndHex, action],
    (error: Error | null) => {
      if (error) {
        console.error(`[index] Failed to ${action} window:`, error)
      } else {
        console.log(`[index] Successfully ${action}ed window to desktop`)
      }
    }
  )
}

function setDesktopWidgetMode(win: BrowserWindow): void {
  // On Windows, position window behind others so it sits on the desktop
  // The window will be visible when desktop is shown (Win+D)
  win.setAlwaysOnTop(false)
  runPinScript(win, 'pin')
}

function createWindow(): BrowserWindow {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: 340,
    height: 720,
    x: screenWidth - 360,
    y: screenHeight - 740,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    resizable: false,
    minimizable: true,
    maximizable: false,
    hasShadow: false,
    show: false,
    type: 'toolbar',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // mainWindow.setMinimumSize(300, 200) removed since resizable is false

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    try {
      const db = getDb()
      const alwaysOnTopRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('always_on_top') as { value: string } | undefined
      const alwaysOnTop = alwaysOnTopRow ? alwaysOnTopRow.value === 'true' : false
      if (alwaysOnTop) {
        mainWindow?.setAlwaysOnTop(true)
      } else {
        setDesktopWidgetMode(mainWindow!)
      }

      const opacityRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('widget_opacity') as { value: string } | undefined
      if (opacityRow && mainWindow) {
        mainWindow.setOpacity(parseFloat(opacityRow.value))
      }

      const startWithWindowsRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('start_with_windows') as { value: string } | undefined
      if (startWithWindowsRow && startWithWindowsRow.value === 'true') {
        app.setLoginItemSettings({ openAtLogin: true })
      } else {
        app.setLoginItemSettings({ openAtLogin: false })
      }
    } catch (err) {
      console.error('[index] Failed to load startup settings from database:', err)
      setDesktopWidgetMode(mainWindow!)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Prevent the window from being "closed" — hide it instead
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// Extend app with custom property
declare module 'electron' {
  interface App {
    isQuitting: boolean
  }
}
app.isQuitting = false

app.whenReady().then(() => {
  // Initialize database
  initDatabase()

  // Create the overlay window
  const win = createWindow()

  // Start tracking service
  trackingService = new TrackingService(win)
  trackingService.start()

  // Register IPC handlers
  registerIpcHandlers(trackingService)

  // Create system tray
  createTray(win, trackingService)

  // Handle window drag via IPC
  ipcMain.on('window-drag', (_event, { deltaX, deltaY }) => {
    if (mainWindow) {
      const [x, y] = mainWindow.getPosition()
      mainWindow.setPosition(x + deltaX, y + deltaY)
    }
  })

  ipcMain.on('window-toggle-expand', (_event, expanded: boolean) => {
    if (mainWindow) {
      if (expanded) {
        mainWindow.setSize(340, 720, true)
      } else {
        mainWindow.setSize(340, 110, true)
      }
    }
  })

  ipcMain.handle('get-window-size', () => {
    if (mainWindow) {
      return mainWindow.getSize()
    }
    return [360, 280]
  })

  ipcMain.on('set-always-on-top', (_event, value: boolean) => {
    if (mainWindow) {
      if (value) {
        runPinScript(mainWindow, 'unpin')
        mainWindow.setAlwaysOnTop(true)
      } else {
        setDesktopWidgetMode(mainWindow)
      }
    }
  })

  ipcMain.on('set-opacity', (_event, value: number) => {
    mainWindow?.setOpacity(value)
  })

  // Bring to front temporarily when clicked, then send back on blur
  ipcMain.on('bring-to-front', () => {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(true)
      mainWindow.show()
      mainWindow.focus()
      setTimeout(() => {
        mainWindow?.setAlwaysOnTop(false)
      }, 200)
    }
  })
})

app.on('before-quit', () => {
  app.isQuitting = true
  trackingService?.stop()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
