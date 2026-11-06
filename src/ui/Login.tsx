import { useEffect, useRef, useState } from 'react'
import { loadProfile, saveProfile, type UserProfile } from '../game/storage'

type Props = {
  onLogin: (callsign: string) => void
  onPlaySolo?: () => void
  onPlayMulti?: () => void
  onOpenSettings?: () => void
  onOpenGuide?: () => void
  onExit?: () => void
  onPlaySound?: () => void
}

const DEFAULT_CALLSIGNS = [
  'Nomad-7',
  'Specter-4',
  'Echo-9',
  'Vanguard-2',
  'Raven-11',
  'Ghost-05',
  'Zero-Six',
  'Apex-3',
  'Phoenix-12',
  'Cipher-8',
]

export function Login({
  onLogin,
  onPlaySolo,
  onPlayMulti,
  onOpenSettings,
  onOpenGuide,
  onExit,
  onPlaySound,
}: Props) {
  const saved = loadProfile()
  const [callsign, setCallsign] = useState(() => saved?.callsign || `Survivor-${Math.floor(Math.random() * 90 + 10)}`)
  const [remember] = useState(() => saved?.remember ?? true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleRollCallsign = () => {
    onPlaySound?.()
    const next = DEFAULT_CALLSIGNS[Math.floor(Math.random() * DEFAULT_CALLSIGNS.length)]
    setCallsign(`${next.split('-')[0]}-${Math.floor(Math.random() * 90 + 10)}`)
  }

  const handleStart = (action: 'story' | 'multi' | 'enter') => {
    onPlaySound?.()
    setError(null)
    const name = callsign.trim()
    if (!name) {
      setError('Please enter a survivor callsign')
      return
    }

    const profile: UserProfile = {
      callsign: name,
      passcode: '',
      clearance: 'CITADEL-SURVIVOR',
      remember,
      lastLogin: Date.now(),
    }

    if (remember) {
      saveProfile(profile)
    }

    if (action === 'story') {
      if (onPlaySolo) {
        onLogin(name)
        onPlaySolo()
      } else {
        onLogin(name)
      }
    } else if (action === 'multi') {
      if (onPlayMulti) {
        onLogin(name)
        onPlayMulti()
      } else {
        onLogin(name)
      }
    } else {
      onLogin(name)
    }
  }

  // Handle ESC key to exit / reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onPlaySound?.()
        if (onExit) onExit()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onExit, onPlaySound])

  // Canvas atmospheric particle dust & drifting smoke
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', handleResize)

    // Floating subtle dust motes in room
    const motes = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.4 + 0.1),
      size: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.4 + 0.1,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      for (const m of motes) {
        m.x += m.vx
        m.y += m.vy
        if (m.y < 0) {
          m.y = height + 10
          m.x = Math.random() * width
        }
        if (m.x < 0) m.x = width
        if (m.x > width) m.x = 0

        ctx.beginPath()
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`
        ctx.fill()
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#111214] text-white select-none">
      {/* 4K Photorealistic Studio Room Background (Reference Image 1) */}
      <img
        src="/room-menu-bg.jpg"
        alt="Studio Room Background"
        className="absolute inset-0 h-full w-full object-cover object-center brightness-90 contrast-105"
      />

      {/* Atmospheric Smoke Vignette Mask - Heavy billowing organic darkness on left 40% */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0d0e10] via-[#0d0e10]/95 via-35% to-transparent to-65%" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full sm:w-[45vw] bg-radial-[circle_at_left_center,rgba(13,14,16,0.98)_0%,rgba(13,14,16,0.85)_60%,transparent_100%]" />
      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_top_right,rgba(255,60,90,0.1)_0%,transparent_50%]" />

      {/* Subtle Dust & Ambient Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      />

      {/* ======================= LEFT MENU CONTAINER ======================= */}
      <div className="relative z-20 flex h-full w-full sm:w-[50vw] md:w-[42vw] flex-col justify-center px-8 sm:px-14 md:px-20 py-12">
        <div className="max-w-md">
          {/* LOGO: Weathered Distressed Stencil Heading */}
          <div className="mb-8 sm:mb-12">
            <h1 className="grunge-title text-5xl sm:text-6xl md:text-7xl font-black tracking-[0.14em] drop-shadow-2xl">
              LAST LIGHT
            </h1>
            <p className="mt-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-white/50">
              OFFLINE SURVIVAL PROTOCOL // 4-12 PLAYERS
            </p>
          </div>

          {/* SURVIVOR CALLSIGN PROFILE CHIP (Quick name changer) */}
          <div className="mb-6 rounded-sm border border-white/10 bg-black/40 p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/50 mb-1">
              <span>OPERATOR CALLSIGN</span>
              <button
                type="button"
                onClick={handleRollCallsign}
                className="text-[#00f0ff] hover:underline cursor-pointer"
              >
                🎲 Random
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                maxLength={20}
                placeholder="Enter survivor name..."
                className="w-full bg-transparent font-bold tracking-wider text-sm sm:text-base text-white placeholder-white/30 focus:outline-none"
              />
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>

            {error ? (
              <div className="mt-1 text-[11px] text-red-400 font-mono">{error}</div>
            ) : null}
          </div>

          {/* VERTICAL MENU OPTIONS (Exact layout from Reference Image 1) */}
          <nav className="flex flex-col items-start gap-4 sm:gap-5">
            {/* 1. PLAY STORY (Iconic Distressed White Chalk / Brush-Stroke Pill) */}
            <button
              type="button"
              onClick={() => handleStart('story')}
              className="chalk-pill text-xs sm:text-sm md:text-base tracking-[0.22em] cursor-pointer group"
              title="Start Solo Story Campaign"
            >
              <span className="relative z-10 font-black">PLAY STORY</span>
            </button>

            {/* 2. MULTIPLAYER */}
            <button
              type="button"
              onClick={() => handleStart('multi')}
              className="room-menu-item text-xs sm:text-sm md:text-base tracking-[0.24em] cursor-pointer"
              title="Local Network / Offline WebRTC Multiplayer"
            >
              MULTIPLAYER
            </button>

            {/* 3. HELP & GUIDE */}
            <button
              type="button"
              onClick={() => {
                onPlaySound?.()
                if (onOpenGuide) onOpenGuide()
                else onLogin(callsign)
              }}
              className="room-menu-item text-xs sm:text-sm md:text-base tracking-[0.24em] cursor-pointer"
              title="Survival Guide and Controls"
            >
              HELP & GUIDE
            </button>

            {/* 4. SETTINGS */}
            <button
              type="button"
              onClick={() => {
                onPlaySound?.()
                if (onOpenSettings) onOpenSettings()
                else onLogin(callsign)
              }}
              className="room-menu-item text-xs sm:text-sm md:text-base tracking-[0.24em] cursor-pointer"
              title="Audio, Graphics, and Display Settings"
            >
              SETTINGS
            </button>

            {/* 5. EXIT */}
            <button
              type="button"
              onClick={() => {
                onPlaySound?.()
                if (onExit) onExit()
              }}
              className="room-menu-item text-xs sm:text-sm md:text-base tracking-[0.24em] cursor-pointer text-white/50 hover:text-red-400"
              title="Exit / Reset Session"
            >
              EXIT
            </button>
          </nav>
        </div>
      </div>

      {/* ================= BOTTOM RIGHT KEYBOARD PROMPT ================= */}
      <div className="absolute bottom-6 right-8 z-20 hidden sm:flex items-center gap-2 font-mono text-xs tracking-widest text-white/40">
        <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/70 shadow-sm">
          ESC
        </kbd>
        <span>EXIT</span>
      </div>
    </div>
  )
}
