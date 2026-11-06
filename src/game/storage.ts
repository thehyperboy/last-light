import { DEFAULT_SETTINGS, type Settings } from './types'

const SETTINGS_KEY = 'last-light-settings-v1'
const SEEN_KEY = 'last-light-seen-tutorial-v1'
const PROFILE_KEY = 'last-light-profile-v1'

export type UserProfile = {
  callsign: string
  passcode?: string
  clearance: string
  remember: boolean
  lastLogin: number
}

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch {
    /* storage full or disabled */
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY)
  } catch {
    /* ignore */
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<Settings>
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadTutorialSeen(): boolean {
  return localStorage.getItem(SEEN_KEY) === '1'
}

export function saveTutorialSeen() {
  localStorage.setItem(SEEN_KEY, '1')
}

export function newId(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function newSessionId(): string {
  return `ll-${newId()}`
}
