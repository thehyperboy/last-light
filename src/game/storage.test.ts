import { describe, it, expect, beforeEach } from 'vitest'
import {
  registerOperator,
  authenticateOperator,
  authenticateGuest,
  findProfileByCallsign,
  getRegisteredProfiles,
  removeRegisteredProfile,
  loadProfile,
} from './storage'

// In-memory localStorage mock for node test environment
const memoryStore = new Map<string, string>()
const mockLocalStorage = {
  getItem: (k: string) => memoryStore.get(k) ?? null,
  setItem: (k: string, v: string) => memoryStore.set(k, v),
  removeItem: (k: string) => memoryStore.delete(k),
  clear: () => memoryStore.clear(),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('Operator Authentication and Storage', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  it('rejects short or invalid callsigns during registration', () => {
    const r1 = registerOperator('ab', '1234', true)
    expect(r1.success).toBe(false)
    if (!r1.success) expect(r1.error).toContain('at least 3 characters')

    const r2 = registerOperator('Nomad 123', '1234', true)
    expect(r2.success).toBe(false)
    if (!r2.success) expect(r2.error).toContain('only contain letters')
  })

  it('rejects short passcodes during registration', () => {
    const res = registerOperator('Specter-1', '12', true)
    expect(res.success).toBe(false)
    if (!res.success) expect(res.error).toContain('at least 4 characters')
  })

  it('successfully registers an operator and stores profile', () => {
    const res = registerOperator('Vanguard-9', 'alpha99', true)
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.profile.callsign).toBe('Vanguard-9')
      expect(res.profile.clearance).toBe('OPERATOR-LVL3')
    }

    const found = findProfileByCallsign('vanguard-9')
    expect(found).not.toBeNull()
    expect(found?.callsign).toBe('Vanguard-9')
  })

  it('prevents registering duplicate callsigns', () => {
    registerOperator('Echo-7', 'pass123', true)
    const dup = registerOperator('echo-7', 'different', true)
    expect(dup.success).toBe(false)
    if (!dup.success) expect(dup.error).toContain('already registered')
  })

  it('authenticates with correct passcode and rejects incorrect passcode', () => {
    registerOperator('Raven-01', 'secureCode', true)

    // Wrong passcode
    const fail = authenticateOperator('Raven-01', 'wrongCode', true)
    expect(fail.success).toBe(false)
    if (!fail.success) expect(fail.error).toContain('Invalid clearance passcode')

    // Empty passcode
    const emptyFail = authenticateOperator('Raven-01', '', true)
    expect(emptyFail.success).toBe(false)

    // Correct passcode
    const ok = authenticateOperator('Raven-01', 'secureCode', true)
    expect(ok.success).toBe(true)
    if (ok.success) {
      expect(ok.profile.callsign).toBe('Raven-01')
    }
  })

  it('authenticates guests with randomized callsigns', () => {
    const guest = authenticateGuest()
    expect(guest.callsign).toMatch(/^Guest-\d+$/)
    expect(guest.clearance).toBe('GUEST-UNVERIFIED')
    expect(loadProfile()?.callsign).toBe(guest.callsign)
  })

  it('can remove an operator from registry and clear active profile', () => {
    registerOperator('Nomad-99', 'pass123', true)
    expect(getRegisteredProfiles().length).toBe(1)

    removeRegisteredProfile('Nomad-99')
    expect(getRegisteredProfiles().length).toBe(0)
    expect(loadProfile()).toBeNull()
  })
})
