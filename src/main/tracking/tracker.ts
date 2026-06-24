import { BrowserWindow } from 'electron'
import { insertSession } from '../database/sessions'
import { categorizeApp } from './categorizer'
import { IdleDetector } from './idle-detector'
import { aggregateAndSaveTodayStats } from '../database/daily-stats'

interface ActiveWindowInfo {
  appName: string
  windowTitle: string
}

interface CurrentSession {
  appName: string
  windowTitle: string
  category: string
  startTime: number
  isIdle: boolean
}

export class TrackingService {
  private pollInterval: ReturnType<typeof setInterval> | null = null
  private statsInterval: ReturnType<typeof setInterval> | null = null
  private currentSession: CurrentSession | null = null
  private idleDetector: IdleDetector
  private win: BrowserWindow
  private isPaused = false
  private pollingMs = 1000

  constructor(win: BrowserWindow) {
    this.win = win
    this.idleDetector = new IdleDetector()

    // Handle idle transitions
    this.idleDetector.on('idle-start', () => {
      // Finalize current active session
      if (this.currentSession && !this.currentSession.isIdle) {
        this.finalizeSession()
      }
      // Start an idle session
      this.currentSession = {
        appName: 'System Idle',
        windowTitle: 'Idle',
        category: 'Idle',
        startTime: Date.now(),
        isIdle: true
      }
      this.sendUpdate()
    })

    this.idleDetector.on('idle-end', () => {
      // Finalize idle session
      if (this.currentSession?.isIdle) {
        this.finalizeSession()
      }
      this.currentSession = null
      this.sendUpdate()
    })
  }

  start(): void {
    this.idleDetector.start()

    // Poll active window every second
    this.pollInterval = setInterval(() => {
      if (this.isPaused || this.idleDetector.isIdle) return
      this.pollActiveWindow()
    }, this.pollingMs)

    // Aggregate stats every 60 seconds
    this.statsInterval = setInterval(() => {
      try {
        aggregateAndSaveTodayStats()
      } catch {
        // Silently handle
      }
    }, 60000)
  }

  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
      this.statsInterval = null
    }
    this.idleDetector.stop()

    // Finalize any current session
    if (this.currentSession) {
      this.finalizeSession()
    }

    // Final aggregation
    try {
      aggregateAndSaveTodayStats()
    } catch {
      // Silently handle
    }
  }

  pause(): void {
    this.isPaused = true
    if (this.currentSession) {
      this.finalizeSession()
    }
    this.sendUpdate()
  }

  resume(): void {
    this.isPaused = false
    this.currentSession = null
    this.sendUpdate()
  }

  get paused(): boolean {
    return this.isPaused
  }

  // ── Windows system/background processes to ALWAYS exclude ──
  // These are core OS services, shell components, and infrastructure processes
  // that the user did NOT install and don't represent active app usage.
  private static EXCLUDED_PROCESSES = new Set([
    // Self / dev tools
    'electron', 'screenfocus', 'antigravity',
    // Shell & helpers
    'powershell', 'powershell_ise', 'pwsh', 'conhost', 'cmd',
    // Windows core system processes
    'csrss', 'dwm', 'lsass', 'smss', 'wininit', 'winlogon',
    'services', 'svchost', 'taskhostw', 'taskhost',
    'sihost', 'fontdrvhost', 'ctfmon',
    // Windows shell & UI infrastructure
    'explorer',  // Windows shell (desktop/taskbar) — not an "app"
    'shellexperiencehost', 'startmenuexperiencehost',
    'searchhost', 'searchui', 'searchapp',
    'lockapp', 'logonui', 'inputapp',
    'textinputhost', 'windowsinternal.composableshell.experiences.textinput.inputapp',
    'systemsettings', 'systemsettingsbroker',
    'securityhealthsystray', 'securityhealthservice',
    // Windows background services with UI
    'runtimebroker', 'backgroundtaskhost', 'dllhost', 'rundll32',
    'msiexec', 'wudfhost', 'dashost',
    'wmiprvse', 'wsmprovhost',
    'smartscreen', 'useroobebroker', 'gamebarpresencewriter',
    // System tray / notification area
    'shellhost', 'notificationcontroller',
    'windowspackagemanagerserver',
    // Misc Windows infra
    'msedgewebview2', 'widgets', 'widgetservice',
    'phoneexperiencehost', 'yourphone',
    'gamingservices', 'gamingservicesnet',
    'crashreporter', 'werfault', 'wermgr',
    'openssh', 'spoolsv', 'audiodg',
    // Windows Update & Defender
    'trustedinstaller', 'tiworker', 'musnotification',
    'msmpeng', 'nissrv', 'mpcmdrun',
    // Store infrastructure
    'wininit', 'wsreset', 'winstore.app',
  ])

  // UWP host processes — use window title as app name instead
  private static UWP_HOST_PROCESSES = new Set([
    'applicationframehost',
    'windowsinternal.composableshell.experiences.textinput.inputapp',
  ])

  private pollCount = 0

  private resolveAppName(processName: string, windowTitle: string): { appName: string; resolved: boolean } {
    const lower = processName.toLowerCase()

    // If it's a UWP host, extract the real app name from the window title
    if (TrackingService.UWP_HOST_PROCESSES.has(lower)) {
      // Window title for UWP apps is usually "AppName" or "AppName - Details"
      const title = windowTitle.trim()
      if (title && title.length > 0) {
        // Use the first meaningful part of the title
        const parts = title.split(' - ')
        return { appName: parts[0].trim() || processName, resolved: true }
      }
    }

    return { appName: processName, resolved: false }
  }

  private isSystemProcess(processName: string): boolean {
    const lower = processName.toLowerCase()

    // Check explicit exclusion list
    if (TrackingService.EXCLUDED_PROCESSES.has(lower)) return true

    // Heuristic: processes starting with "windows" are usually system
    if (lower.startsWith('windows') && lower !== 'windowsterminal') return true

    // Heuristic: Microsoft system processes
    if (lower.startsWith('microsoft.') && !lower.includes('teams')) return true

    return false
  }

  private async pollActiveWindow(): Promise<void> {
    try {
      const windowInfo = await this.getActiveWindowInfo()

      if (!windowInfo || !windowInfo.appName) return

      let { appName, windowTitle } = windowInfo

      // Log first few polls for debugging
      if (this.pollCount < 5) {
        console.log(`[Tracker] Poll #${this.pollCount}: ${appName} - ${windowTitle}`)
        this.pollCount++
      }

      // Skip Windows system/background processes
      if (this.isSystemProcess(appName)) return

      // Resolve UWP host processes to their actual app name
      const resolved = this.resolveAppName(appName, windowTitle)
      appName = resolved.appName

      // Skip if empty or very short process name (likely system noise)
      if (!appName || appName.length < 2) return

      // Check if this is the same app as current session
      if (this.currentSession && this.currentSession.appName === appName) {
        // Same app, update title if changed
        this.currentSession.windowTitle = windowTitle
        return
      }

      // Different app → finalize previous session, start new one
      if (this.currentSession) {
        this.finalizeSession()
      }

      const category = categorizeApp(appName, windowTitle)

      this.currentSession = {
        appName,
        windowTitle,
        category,
        startTime: Date.now(),
        isIdle: false
      }

      this.sendUpdate()
    } catch (err) {
      if (this.pollCount < 5) {
        console.error('[Tracker] Poll error:', err)
        this.pollCount++
      }
    }
  }

  private psScriptPath: string | null = null

  private async getActiveWindowInfo(): Promise<ActiveWindowInfo | null> {
    return this.getActiveWindowFallback()
  }

  private ensurePsScript(): string {
    if (this.psScriptPath) return this.psScriptPath

    const { join } = require('path')
    const { app } = require('electron')
    const { writeFileSync, existsSync } = require('fs')

    const scriptDir = join(app.getPath('userData'), 'scripts')
    if (!existsSync(scriptDir)) {
      require('fs').mkdirSync(scriptDir, { recursive: true })
    }

    this.psScriptPath = join(scriptDir, 'get-foreground.ps1')

    const script = `
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public class FgWin {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
}
'@
$h = [FgWin]::GetForegroundWindow()
if ($h -eq [IntPtr]::Zero) { Write-Output '{}'; exit }
$p = [uint32]0
[FgWin]::GetWindowThreadProcessId($h, [ref]$p) | Out-Null
$proc = Get-Process -Id $p -ErrorAction SilentlyContinue
$sb = New-Object System.Text.StringBuilder 256
[FgWin]::GetWindowText($h, $sb, 256) | Out-Null
$result = @{ ProcessName = $proc.ProcessName; MainWindowTitle = $sb.ToString() }
$result | ConvertTo-Json -Compress
`
    writeFileSync(this.psScriptPath, script, 'utf8')
    return this.psScriptPath
  }

  private getActiveWindowFallback(): Promise<ActiveWindowInfo | null> {
    return new Promise((resolve) => {
      const { execFile } = require('child_process')
      const scriptPath = this.ensurePsScript()

      execFile(
        'powershell.exe',
        ['-NoProfile', '-NoLogo', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
        { timeout: 3000 },
        (error: Error | null, stdout: string) => {
          if (error || !stdout.trim()) {
            resolve(null)
            return
          }
          try {
            const data = JSON.parse(stdout)
            if (!data.ProcessName) {
              resolve(null)
              return
            }
            resolve({
              appName: data.ProcessName,
              windowTitle: data.MainWindowTitle || ''
            })
          } catch {
            resolve(null)
          }
        }
      )
    })
  }

  private finalizeSession(): void {
    if (!this.currentSession) return

    const endTime = Date.now()
    const durationMs = endTime - this.currentSession.startTime
    const durationSeconds = Math.round(durationMs / 1000)

    // Only save sessions longer than 2 seconds
    if (durationSeconds < 2) return

    try {
      insertSession({
        app_name: this.currentSession.appName,
        window_title: this.currentSession.windowTitle,
        category: this.currentSession.category,
        start_time: this.currentSession.startTime,
        end_time: endTime,
        duration_seconds: durationSeconds,
        is_idle: this.currentSession.isIdle ? 1 : 0
      })
    } catch {
      // Handle DB write errors silently
    }

    this.currentSession = null
  }

  private sendUpdate(): void {
    try {
      if (this.win && !this.win.isDestroyed()) {
        this.win.webContents.send('tracking-update', {
          currentApp: this.currentSession?.appName || null,
          currentCategory: this.currentSession?.category || null,
          isIdle: this.idleDetector.isIdle,
          isPaused: this.isPaused,
          sessionStart: this.currentSession?.startTime || null
        })
      }
    } catch {
      // Window may be destroyed
    }
  }
}
