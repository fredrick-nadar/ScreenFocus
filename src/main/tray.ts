import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron'
import { join } from 'path'
import { TrackingService } from './tracking/tracker'

let tray: Tray | null = null

export function createTray(win: BrowserWindow, trackingService: TrackingService): void {
  // Create a simple 16x16 tray icon programmatically (circle with gradient)
  const iconSize = 16
  const canvas = nativeImage.createEmpty()

  // Use a simple colored icon — in production, replace with resources/icon.ico
  let iconPath: string
  try {
    iconPath = join(__dirname, '../../resources/icon.ico')
    tray = new Tray(iconPath)
  } catch {
    // Fallback: create a simple icon from raw pixel data
    const size = 16
    const buffer = Buffer.alloc(size * size * 4)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4
        const cx = x - size / 2
        const cy = y - size / 2
        const dist = Math.sqrt(cx * cx + cy * cy)
        if (dist < size / 2 - 1) {
          // Purple gradient
          buffer[idx] = 180 + Math.round(cx * 3)     // R
          buffer[idx + 1] = 140 + Math.round(cy * 3) // G
          buffer[idx + 2] = 248                       // B
          buffer[idx + 3] = 255                       // A
        } else {
          buffer[idx + 3] = 0 // Transparent
        }
      }
    }
    const fallbackIcon = nativeImage.createFromBuffer(buffer, { width: size, height: size })
    tray = new Tray(fallbackIcon)
  }

  tray.setToolTip('ScreenFocus — Digital Wellbeing Tracker')

  const updateContextMenu = (): void => {
    const isPaused = trackingService.paused
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open ScreenFocus',
        click: (): void => {
          win.show()
          win.focus()
        }
      },
      { type: 'separator' },
      {
        label: isPaused ? '▶ Resume Tracking' : '⏸ Pause Tracking',
        click: (): void => {
          if (isPaused) {
            trackingService.resume()
          } else {
            trackingService.pause()
          }
          updateContextMenu()
          win.webContents.send('tracking-status-changed', { isPaused: trackingService.paused })
        }
      },
      { type: 'separator' },
      {
        label: 'Quit ScreenFocus',
        click: (): void => {
          app.isQuitting = true
          app.quit()
        }
      }
    ])
    tray?.setContextMenu(contextMenu)
  }

  updateContextMenu()

  // Left-click toggles window visibility
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.focus()
    }
  })
}
