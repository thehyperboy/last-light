import { DEFAULT_SETTINGS, type Settings } from './types'

const SETTINGS_KEY = 'last-light-settings-v1'
const SEEN_KEY = 'last-light-seen-tutorial-v1'
const ACTIVE_PROFILE_KEY = 'last-light-profile-v1'
const ACCOUNTS_REGISTRY_KEY = 'last-light-accounts-v1'

export type ClearanceLevel = 'OPERATOR-LVL3' | 'COMMANDER-LVL5' | 'GUEST-UNVERIFIED'

export type UserProfile = {
  callsign: string
  passcode?: string // stored locally for offline terminal auth
  clearance: ClearanceLevel
  remember: boolean
  lastLogin: number
  createdDate?: number
}

export type AuthResult =
  | { success: true; profile: UserProfile }
  | { success: false; error: string }

/**
 * Retrieve all registered accounts on this terminal
 */
export function getRegisteredProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_REGISTRY_KEY)
    if (!raw) {
      // Migrate legacy single profile if present
      const legacy = loadProfile()
      if (legacy && legacy.callsign) {
        const list = [legacy]
        saveRegisteredProfiles(list)
        return list
      }
      return []
    }
    const list = JSON.parse(raw) as UserProfile[]
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

/**
 * Save the entire accounts registry
 */
export function saveRegisteredProfiles(profiles: UserProfile[]) {
  try {
    localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(profiles))
  } catch {
    /* storage quota exceeded or disabled */
  }
}

/**
 * Find a registered profile by callsign (case-insensitive)
 */
export function findProfileByCallsign(callsign: string): UserProfile | null {
  const norm = callsign.trim().toLowerCase()
  if (!norm) return null
  const all = getRegisteredProfiles()
  return all.find((p) => p.callsign.trim().toLowerCase() === norm) ?? null
}

/**
 * Register a new operator profile
 */
export function registerOperator(callsign: string, passcode: string, remember: boolean): AuthResult {
  const trimmed = callsign.trim()
  if (trimmed.length < 3) {
    return { success: false, error: 'Callsign must be at least 3 characters long.' }
  }
  if (trimmed.length > 20) {
    return { success: false, error: 'Callsign cannot exceed 20 characters.' }
  }
  if (!/^[a-zA-Z0-9_\-]+$/.test(trimmed)) {
    return { success: false, error: 'Callsign can only contain letters, numbers, hyphens, and underscores.' }
  }

  const existing = findProfileByCallsign(trimmed)
  if (existing) {
    return {
      success: false,
      error: `Operator "${existing.callsign}" is already registered. Please sign in instead.`,
    }
  }

  if (!passcode || passcode.length < 4) {
    return { success: false, error: 'Clearance passcode must be at least 4 characters.' }
  }

  const profile: UserProfile = {
    callsign: trimmed,
    passcode,
    clearance: 'OPERATOR-LVL3',
    remember,
    lastLogin: Date.now(),
    createdDate: Date.now(),
  }

  const all = getRegisteredProfiles().filter((p) => p.callsign.toLowerCase() !== trimmed.toLowerCase())
  all.push(profile)
  saveRegisteredProfiles(all)

  if (remember) {
    saveProfile(profile)
  } else {
    // Save session in active profile, but don't persist passcode for auto-login
    saveProfile({ ...profile, remember: false })
  }

  return { success: true, profile }
}

/**
 * Authenticate an existing operator with callsign and passcode
 */
export function authenticateOperator(callsign: string, passcode: string, remember: boolean): AuthResult {
  const trimmed = callsign.trim()
  if (!trimmed) {
    return { success: false, error: 'Please enter a survivor callsign.' }
  }

  const existing = findProfileByCallsign(trimmed)
  if (!existing) {
    return {
      success: false,
      error: `Operator "${trimmed}" not found. Create a new account below.`,
    }
  }

  // If the account has a passcode set, verify it
  if (existing.passcode) {
    if (!passcode) {
      return { success: false, error: 'Enter your clearance passcode to unlock terminal.' }
    }
    if (existing.passcode !== passcode) {
      return { success: false, error: 'Invalid clearance passcode. Access denied.' }
    }
  }

  const updated: UserProfile = {
    ...existing,
    remember,
    lastLogin: Date.now(),
  }

  // Update in registry
  const all = getRegisteredProfiles().map((p) =>
    p.callsign.toLowerCase() === trimmed.toLowerCase() ? updated : p,
  )
  saveRegisteredProfiles(all)

  if (remember) {
    saveProfile(updated)
  } else {
    saveProfile({ ...updated, remember: false })
  }

  return { success: true, profile: updated }
}

/**
 * Quick authenticate as guest (no passcode needed)
 */
export function authenticateGuest(): UserProfile {
  const guestNumber = Math.floor(Math.random() * 900 + 100)
  const profile: UserProfile = {
    callsign: `Guest-${guestNumber}`,
    clearance: 'GUEST-UNVERIFIED',
    remember: false,
    lastLogin: Date.now(),
  }
  // We do not save guest to permanent registry unless needed, but set as active profile
  saveProfile(profile)
  return profile
}

/**
 * Delete a profile from the device registry
 */
export function removeRegisteredProfile(callsign: string) {
  const norm = callsign.trim().toLowerCase()
  const all = getRegisteredProfiles().filter((p) => p.callsign.trim().toLowerCase() !== norm)
  saveRegisteredProfiles(all)

  const active = loadProfile()
  if (active && active.callsign.trim().toLowerCase() === norm) {
    clearProfile()
  }
}

/**
 * Load the active profile (if remembered)
 */
export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(ACTIVE_PROFILE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

/**
 * Save active profile
 */
export function saveProfile(profile: UserProfile) {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile))
  } catch {
    /* storage full or disabled */
  }
}

/**
 * Clear the active profile on logout
 */
export function clearProfile() {
  try {
    localStorage.removeItem(ACTIVE_PROFILE_KEY)
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
