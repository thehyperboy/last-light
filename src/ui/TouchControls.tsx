import { useEffect, useRef, useCallback } from 'react'
import type { PlayerInput } from '../game/types'

type Props = {
  leftHanded: boolean
  sensitivity: number
  look: { x: number; y: number }
  onLook: (x: number, y: number) => void
  onInput: (input: Omit<PlayerInput, 'yaw'>) => void
  prompt: string | null
  paused: boolean
  onPause?: () => void
}

/**
 * Minecraft-style keyboard & mouse controls
 *
 * Movement:
 *   W / ↑          – Walk forward
 *   S / ↓          – Walk backward
 *   A / ←          – Strafe left
 *   D / →          – Strafe right
 *   Space          – Jump
 *   Left Shift     – Sneak / Crouch  (Minecraft default)
 *   Left Ctrl      – Sprint          (Minecraft default)
 *
 * Actions:
 *   E              – Interact / Use
 *   F              – Craft
 *   Q              – Use Med / Drop item
 *   Right Click    – Interact / Use (alt)
 *
 * Camera:
 *   Mouse Move     – Look around (pointer-lock, click canvas to lock)
 *   Escape         – Pause / release pointer lock
 */
export function TouchControls({ leftHanded, sensitivity, look, onLook, onInput, prompt, paused, onPause }: Props) {
  const move = useRef({ ax: 0, az: 0 })
  const buttons = useRef({ jump: false, sprint: false, crouch: false, interact: false, craft: false, useMed: false })
  const stick = useRef<HTMLDivElement>(null)
  const lookPtr = useRef<number | null>(null)
  const lastLook = useRef<{ x: number; y: number } | null>(null)
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const onPauseRef = useRef(onPause)
  onPauseRef.current = onPause

  // Keep look values in a ref so the mousemove handler doesn't need to
  // re-register on every frame (avoids stale closure + perf churn).
  const lookRef = useRef(look)
  lookRef.current = look
  const sensitivityRef = useRef(sensitivity)
  sensitivityRef.current = sensitivity
  const onLookRef = useRef(onLook)
  onLookRef.current = onLook

  // Track individual key states for proper opposing-key handling
  const keys = useRef({
    w: false, s: false, a: false, d: false,
    up: false, down: false, left: false, right: false,
  })

  const flush = useCallback(() => {
    if (pausedRef.current) return
    onInput({ ...move.current, ...buttons.current })
  }, [onInput])

  // Recompute movement axis from tracked key states
  const recomputeAxes = useCallback(() => {
    const k = keys.current
    const fwd = k.w || k.up ? -1 : 0
    const bwd = k.s || k.down ? 1 : 0
    const lft = k.a || k.left ? -1 : 0
    const rgt = k.d || k.right ? 1 : 0
    move.current.az = fwd + bwd
    move.current.ax = lft + rgt
  }, [])

  useEffect(() => {
    const id = window.setInterval(flush, 50)
    return () => window.clearInterval(id)
  }, [flush])

  // ── Pointer Lock for mouse look (Minecraft-style) ──
  // Registered once; reads from refs so the handler is always current.
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return
      if (pausedRef.current) return
      const dx = e.movementX
      const dy = e.movementY
      const s = sensitivityRef.current
      onLookRef.current(
        lookRef.current.x - dx * 0.003 * s,
        Math.max(-1.2, Math.min(1.2, lookRef.current.y + dy * 0.003 * s)),
      )
    }
    document.addEventListener('mousemove', onMouseMove)
    return () => document.removeEventListener('mousemove', onMouseMove)
  }, [])  // stable – no deps needed, reads from refs

  // Request pointer lock on canvas click & handle lock release
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (pausedRef.current) return
      if (document.pointerLockElement) return
      // Only lock if clicking on the game area (not UI buttons)
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('[data-ui]')) return
      document.body.requestPointerLock()
    }
    const onLockChange = () => {
      if (!document.pointerLockElement && !pausedRef.current) {
        // Pointer lock was released externally (browser Esc hold, tab switch, etc.)
        // The Escape key handler already calls onPause, so we guard against double-fire
        // by checking pausedRef (Escape handler sets pause first, then exitPointerLock
        // triggers this — but by then pausedRef is already true).
        onPauseRef.current?.()
      }
    }
    document.addEventListener('click', onClick)
    document.addEventListener('pointerlockchange', onLockChange)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('pointerlockchange', onLockChange)
    }
  }, [])

  // ── Right-click for Interact (Minecraft right-click = use) ──
  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      e.preventDefault()
      if (!document.pointerLockElement) return
      buttons.current.interact = true
      flush()
      // Release on next frame
      requestAnimationFrame(() => {
        buttons.current.interact = false
        flush()
      })
    }
    document.addEventListener('contextmenu', onContext)
    return () => document.removeEventListener('contextmenu', onContext)
  }, [flush])

  // ── Keyboard controls (Minecraft layout) ──
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return

      // Escape – release pointer lock (pointerlockchange handler will pause)
      // If no pointer lock is active, directly pause.
      if (e.code === 'Escape') {
        if (document.pointerLockElement) {
          document.exitPointerLock()
          // pointerlockchange will fire and call onPause
        } else {
          onPauseRef.current?.()
        }
        return
      }

      // Movement keys – track individually
      if (e.code === 'KeyW') keys.current.w = true
      if (e.code === 'KeyS') keys.current.s = true
      if (e.code === 'KeyA') keys.current.a = true
      if (e.code === 'KeyD') keys.current.d = true
      if (e.code === 'ArrowUp') keys.current.up = true
      if (e.code === 'ArrowDown') keys.current.down = true
      if (e.code === 'ArrowLeft') keys.current.left = true
      if (e.code === 'ArrowRight') keys.current.right = true
      recomputeAxes()

      // Jump – Space
      if (e.code === 'Space') {
        e.preventDefault()
        buttons.current.jump = true
      }
      // Sneak / Crouch – Left Shift (Minecraft default)
      if (e.code === 'ShiftLeft') buttons.current.crouch = true
      // Sprint – Left Ctrl (Minecraft default)
      if (e.code === 'ControlLeft') {
        e.preventDefault()
        buttons.current.sprint = true
      }
      // Interact / Use – E
      if (e.code === 'KeyE') buttons.current.interact = true
      // Craft – F
      if (e.code === 'KeyF') buttons.current.craft = true
      // Use Med / Drop – Q
      if (e.code === 'KeyQ') buttons.current.useMed = true
      flush()
    }
    const up = (e: KeyboardEvent) => {
      // Movement keys – track individually
      if (e.code === 'KeyW') keys.current.w = false
      if (e.code === 'KeyS') keys.current.s = false
      if (e.code === 'KeyA') keys.current.a = false
      if (e.code === 'KeyD') keys.current.d = false
      if (e.code === 'ArrowUp') keys.current.up = false
      if (e.code === 'ArrowDown') keys.current.down = false
      if (e.code === 'ArrowLeft') keys.current.left = false
      if (e.code === 'ArrowRight') keys.current.right = false
      recomputeAxes()

      // Action keys
      if (e.code === 'Space') buttons.current.jump = false
      if (e.code === 'ShiftLeft') buttons.current.crouch = false
      if (e.code === 'ControlLeft') buttons.current.sprint = false
      if (e.code === 'KeyE') buttons.current.interact = false
      if (e.code === 'KeyF') buttons.current.craft = false
      if (e.code === 'KeyQ') buttons.current.useMed = false
      flush()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [flush, recomputeAxes])

  const onStick = (clientX: number, clientY: number) => {
    const el = stick.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = (clientX - (r.left + r.width / 2)) / (r.width / 2)
    const dy = (clientY - (r.top + r.height / 2)) / (r.height / 2)
    move.current.ax = Math.max(-1, Math.min(1, dx))
    move.current.az = Math.max(-1, Math.min(1, dy))
  }

  const side = leftHanded ? 'right' : 'left'
  const actions = leftHanded ? 'left' : 'right'

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div
        className={`pointer-events-auto absolute bottom-[max(1.2rem,env(safe-area-inset-bottom))] ${side === 'left' ? 'left-4' : 'right-4'} h-36 w-36 rounded-full border border-[#ff6a00]/25 bg-black/30`}
        ref={stick}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          onStick(e.clientX, e.clientY)
          flush()
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            onStick(e.clientX, e.clientY)
            flush()
          }
        }}
        onPointerUp={() => {
          move.current.ax = 0
          move.current.az = 0
          flush()
        }}
      >
        <div
          className="absolute h-14 w-14 rounded-full bg-[#e85d04]/80"
          style={{
            left: `calc(50% + ${move.current.ax * 40}px - 28px)`,
            top: `calc(50% + ${move.current.az * 40}px - 28px)`,
          }}
        />
      </div>
      <div
        className={`pointer-events-auto absolute inset-y-0 ${actions === 'right' ? 'right-0 w-[58%]' : 'left-0 w-[58%]'}`}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return
          lookPtr.current = e.pointerId
          lastLook.current = { x: e.clientX, y: e.clientY }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (lookPtr.current !== e.pointerId || !lastLook.current) return
          const dx = e.clientX - lastLook.current.x
          const dy = e.clientY - lastLook.current.y
          lastLook.current = { x: e.clientX, y: e.clientY }
          onLook(look.x - dx * 0.005 * sensitivity, look.y + dy * 0.004 * sensitivity)
        }}
        onPointerUp={() => {
          lookPtr.current = null
          lastLook.current = null
        }}
      />
      <div className={`pointer-events-auto absolute bottom-[max(1.2rem,env(safe-area-inset-bottom))] ${actions === 'right' ? 'right-4' : 'left-4'} flex flex-col gap-2`}>
        <div className="flex gap-2">
          <Action label="JUMP" on={(v) => { buttons.current.jump = v; flush() }} />
          <Action label="SPRINT" on={(v) => { buttons.current.sprint = v; flush() }} />
        </div>
        <div className="flex gap-2">
          <Action label={prompt ?? 'USE'} accent on={(v) => { buttons.current.interact = v; flush() }} />
          <Action label="CRAFT" on={(v) => { buttons.current.craft = v; flush() }} />
        </div>
        <div className="flex gap-2">
          <Action label="CROUCH" on={(v) => { buttons.current.crouch = v; flush() }} />
          <Action label="MED" on={(v) => { buttons.current.useMed = v; flush() }} />
        </div>
      </div>
    </div>
  )
}

function Action({ label, on, accent }: { label: string; on: (v: boolean) => void; accent?: boolean }) {
  return (
    <button
      className={`h-14 min-w-16 rounded-2xl border px-3 text-[11px] font-semibold tracking-wide ${accent ? 'border-[#e85d04] bg-gradient-to-r from-[#c41e1e] to-[#e85d04] text-white' : 'border-[#ff6a00]/20 bg-black/50 text-ivory'}`}
      onPointerDown={(e) => {
        e.stopPropagation()
        on(true)
      }}
      onPointerUp={(e) => {
        e.stopPropagation()
        on(false)
      }}
      onPointerCancel={() => on(false)}
    >
      {label}
    </button>
  )
}
