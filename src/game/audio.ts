export type AudioBus = {
  unlocked: boolean
  setSfx: (v: number) => void
  setAmbience: (v: number) => void
  unlock: () => void
  play: (name: Sfx) => void
  setStorm: (v: number) => void
  dispose: () => void
}

export type Sfx =
  | 'pickup'
  | 'craft'
  | 'hit'
  | 'jump'
  | 'foot'
  | 'gen'
  | 'beacon'
  | 'detect'
  | 'attack'
  | 'win'
  | 'lose'
  | 'ui'
  | 'revive'

export function createAudio(): AudioBus {
  let ctx: AudioContext | null = null
  let sfx = 0.7
  let amb = 0.45
  let storm = 0
  let wind: OscillatorNode | null = null
  let windGain: GainNode | null = null
  let unlocked = false

  const ensure = () => {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    if (!wind && ctx) {
      wind = ctx.createOscillator()
      wind.type = 'sawtooth'
      wind.frequency.value = 48
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 240
      windGain = ctx.createGain()
      windGain.gain.value = 0
      wind.connect(filter)
      filter.connect(windGain)
      windGain.connect(ctx.destination)
      wind.start()
    }
    return ctx
  }

  const beep = (freq: number, dur: number, type: OscillatorType, gain: number, noise = false) => {
    if (sfx <= 0.01) return
    const ac = ensure()
    const g = ac.createGain()
    g.gain.value = 0.0001
    g.connect(ac.destination)
    const now = ac.currentTime
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain * sfx), now + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
    if (noise) {
      const buffer = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      const src = ac.createBufferSource()
      src.buffer = buffer
      const f = ac.createBiquadFilter()
      f.type = 'bandpass'
      f.frequency.value = freq
      src.connect(f)
      f.connect(g)
      src.start()
      src.stop(now + dur)
      return
    }
    const o = ac.createOscillator()
    o.type = type
    o.frequency.value = freq
    o.connect(g)
    o.start()
    o.stop(now + dur)
  }

  return {
    get unlocked() {
      return unlocked
    },
    setSfx(v) {
      sfx = v
    },
    setAmbience(v) {
      amb = v
      if (windGain) windGain.gain.value = amb * (0.03 + storm * 0.08)
    },
    unlock() {
      unlocked = true
      ensure()
    },
    play(name) {
      if (!unlocked) return
      switch (name) {
        case 'pickup':
          beep(720, 0.12, 'triangle', 0.08)
          break
        case 'craft':
          beep(240, 0.18, 'square', 0.05)
          break
        case 'hit':
          beep(90, 0.16, 'sawtooth', 0.09, true)
          break
        case 'jump':
          beep(180, 0.1, 'sine', 0.05)
          break
        case 'foot':
          beep(70, 0.05, 'sine', 0.03, true)
          break
        case 'gen':
          beep(110, 0.5, 'sawtooth', 0.07)
          break
        case 'beacon':
          beep(520, 0.4, 'triangle', 0.08)
          break
        case 'detect':
          beep(880, 0.22, 'square', 0.05)
          break
        case 'attack':
          beep(60, 0.2, 'sawtooth', 0.1, true)
          break
        case 'win':
          beep(440, 0.35, 'triangle', 0.08)
          beep(660, 0.4, 'triangle', 0.06)
          break
        case 'lose':
          beep(90, 0.7, 'sine', 0.08)
          break
        case 'ui':
          beep(300, 0.08, 'sine', 0.04)
          break
        case 'revive':
          beep(400, 0.25, 'triangle', 0.06)
          break
      }
    },
    setStorm(v) {
      storm = v
      if (windGain) windGain.gain.value = amb * (0.03 + storm * 0.08)
      if (wind) wind.frequency.value = 48 + v * 40
    },
    dispose() {
      wind?.stop()
      void ctx?.close()
      ctx = null
      wind = null
      windGain = null
    },
  }
}
