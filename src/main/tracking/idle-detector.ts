import { powerMonitor } from 'electron'
import { EventEmitter } from 'events'
import { getDb } from '../database/db'

export class IdleDetector extends EventEmitter {
  private checkInterval: ReturnType<typeof setInterval> | null = null
  private _isIdle = false
  private idleStartTime: number | null = null
  private thresholdSeconds = 300 // 5 minutes default

  get isIdle(): boolean {
    return this._isIdle
  }

  start(): void {
    // Load threshold from settings
    this.loadThreshold()

    // Check idle state every 10 seconds
    this.checkInterval = setInterval(() => {
      this.checkIdleState()
    }, 10000)

    // Listen for lock/unlock screen events
    powerMonitor.on('lock-screen', () => {
      if (!this._isIdle) {
        this._isIdle = true
        this.idleStartTime = Date.now()
        this.emit('idle-start', this.idleStartTime)
      }
    })

    powerMonitor.on('unlock-screen', () => {
      if (this._isIdle) {
        this._isIdle = false
        const idleEnd = Date.now()
        this.emit('idle-end', {
          startTime: this.idleStartTime,
          endTime: idleEnd,
          durationSeconds: this.idleStartTime
            ? Math.round((idleEnd - this.idleStartTime) / 1000)
            : 0
        })
        this.idleStartTime = null
      }
    })
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  private checkIdleState(): void {
    const idleSeconds = powerMonitor.getSystemIdleTime()

    if (!this._isIdle && idleSeconds >= this.thresholdSeconds) {
      // Transition to idle
      this._isIdle = true
      this.idleStartTime = Date.now() - idleSeconds * 1000
      this.emit('idle-start', this.idleStartTime)
    } else if (this._isIdle && idleSeconds < this.thresholdSeconds) {
      // Transition to active
      this._isIdle = false
      const idleEnd = Date.now()
      this.emit('idle-end', {
        startTime: this.idleStartTime,
        endTime: idleEnd,
        durationSeconds: this.idleStartTime
          ? Math.round((idleEnd - this.idleStartTime) / 1000)
          : idleSeconds
      })
      this.idleStartTime = null
    }
  }

  private loadThreshold(): void {
    try {
      const db = getDb()
      const row = db
        .prepare("SELECT value FROM settings WHERE key = 'idle_threshold_minutes'")
        .get() as { value: string } | undefined
      if (row) {
        this.thresholdSeconds = parseInt(row.value) * 60
      }
    } catch {
      // Use default
    }
  }

  updateThreshold(minutes: number): void {
    this.thresholdSeconds = minutes * 60
    const db = getDb()
    db.prepare("UPDATE settings SET value = ? WHERE key = 'idle_threshold_minutes'").run(
      String(minutes)
    )
  }
}
