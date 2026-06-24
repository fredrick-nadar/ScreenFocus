import { app, nativeImage } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'
import { createHash } from 'crypto'

export async function resolveIcon(exePath: string): Promise<string | null> {
  const ICON_CACHE_PATH = join(app.getPath('userData'), 'icon-cache')
  
  try {
    await fs.mkdir(ICON_CACHE_PATH, { recursive: true })
  } catch (err) {
    // Ignore if exists
  }

  const fileName = require('path').basename(exePath)
  const cachePath = join(ICON_CACHE_PATH, `${fileName}.png`)
  
  try {
    // Regenerate if exe is newer than cached icon
    const exeStat = await fs.stat(exePath).catch(() => null)
    const cacheStat = await fs.stat(cachePath).catch(() => null)
    
    if (!cacheStat || (exeStat && exeStat.mtimeMs > cacheStat.mtimeMs)) {
      const { app: electronApp } = require('electron')
      const image = await electronApp.getFileIcon(exePath, { size: 'normal' })
      const buffer = image.toPNG()
      await fs.writeFile(cachePath, buffer)
    }
    
    return `file:///${cachePath.replace(/\\/g, '/')}`
  } catch (err) {
    console.error('Failed to resolve icon:', err)
    return null
  }
}
