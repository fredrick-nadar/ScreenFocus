import React from 'react'

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'
export type AppCategory = 'editor' | 'browser' | 'ai' | 'os' | 'terminal' | 'design' | 'comms' | 'default'

export interface SceneProps {
  timeOfDay: TimeOfDay
  width: number
  height: number
}

import { EditorScene } from './EditorScene'
import { BrowserScene } from './BrowserScene'
import { AiScene } from './AiScene'
import { OsScene } from './OsScene'
import { TerminalScene } from './TerminalScene'
import { DesignScene } from './DesignScene'
import { CommsScene } from './CommsScene'
import { DefaultScene } from './DefaultScene'

export const SCENE_MAP: Record<AppCategory, React.FC<SceneProps>> = {
  editor: EditorScene,
  browser: BrowserScene,
  ai: AiScene,
  os: OsScene,
  terminal: TerminalScene,
  design: DesignScene,
  comms: CommsScene,
  default: DefaultScene,
}
