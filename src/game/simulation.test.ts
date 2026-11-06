import { describe, expect, it } from 'vitest'
import { createMatch, sanitizeInput, stepMatch, ZERO_INPUT, canCraft } from './simulation'
import { GENERATOR } from './world'

describe('match simulation', () => {
  it('creates a playable match with resources and enemies', () => {
    const state = createMatch('s1', 7, [{ id: 'aaaaaaaa', name: 'A' }])
    expect(state.players).toHaveLength(1)
    expect(state.pickups.length).toBeGreaterThan(4)
    expect(state.enemies).toHaveLength(2)
    expect(state.phase).toBe('drop')
  })

  it('moves the player from joystick input', () => {
    const state = createMatch('s1', 1, [{ id: 'aaaaaaaa', name: 'A' }])
    state.phase = 'play'
    const start = { x: state.players[0].x, z: state.players[0].z }
    for (let i = 0; i < 20; i++) {
      stepMatch(state, { aaaaaaaa: { ...ZERO_INPUT, az: -1 } })
    }
    const moved = Math.hypot(state.players[0].x - start.x, state.players[0].z - start.z)
    expect(moved).toBeGreaterThan(1)
    expect(state.players[0].stam).toBeGreaterThan(0)
  })

  it('sprints drain stamina and pickups stack with a cap', () => {
    const state = createMatch('s1', 3, [{ id: 'aaaaaaaa', name: 'A' }])
    state.phase = 'play'
    const p = state.players[0]
    const before = p.stam
    stepMatch(state, { aaaaaaaa: { ...ZERO_INPUT, az: -1, sprint: true } })
    expect(p.stam).toBeLessThan(before)
    const item = state.pickups[0]
    p.x = item.x
    p.z = item.z
    stepMatch(state, { aaaaaaaa: { ...ZERO_INPUT, interact: true } })
    expect(item.taken).toBe(true)
    expect(p.stats.collected).toBe(1)
  })

  it('repairs the generator with metal and repair parts then extracts', () => {
    const state = createMatch('s1', 4, [{ id: 'aaaaaaaa', name: 'A' }])
    state.phase = 'play'
    const p = state.players[0]
    p.inv.metal = 4
    p.inv.repair = 2
    p.inv.batteries = 1
    p.x = GENERATOR.x
    p.z = GENERATOR.z
    stepMatch(state, { aaaaaaaa: { ...ZERO_INPUT, interact: true } })
    stepMatch(state, { aaaaaaaa: { ...ZERO_INPUT, interact: true } })
    expect(state.generatorOn).toBe(true)
    p.x = 26
    p.z = 22
    stepMatch(state, { aaaaaaaa: { ...ZERO_INPUT, interact: true } })
    expect(state.beaconOn).toBe(true)
    for (let i = 0; i < 20 * 17; i++) {
      stepMatch(state, { aaaaaaaa: ZERO_INPUT })
    }
    expect(state.outcome).toBe('victory')
  })

  it('rejects invalid inventory via sanitization clamps', () => {
    const input = sanitizeInput({ ax: 8, az: -4, yaw: 1.2 }, 0)
    expect(input.ax).toBe(1)
    expect(input.az).toBe(-1)
  })

  it('requires ingredients before crafting', () => {
    const state = createMatch('s1', 4, [{ id: 'aaaaaaaa', name: 'A' }])
    expect(canCraft(state.players[0])).toBe(false)
    state.players[0].inv.metal = 1
    state.players[0].inv.repair = 1
    expect(canCraft(state.players[0])).toBe(true)
  })

  it('ends the match if the player is eliminated', () => {
    const state = createMatch('s1', 4, [{ id: 'aaaaaaaa', name: 'A' }])
    state.phase = 'play'
    state.players[0].hp = 0
    state.players[0].downed = true
    state.players[0].bleed = 0
    stepMatch(state, { aaaaaaaa: ZERO_INPUT })
    expect(state.outcome).toBe('defeat-wipe')
  })
})
