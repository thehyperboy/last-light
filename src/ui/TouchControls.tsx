import { useEffect, useRef } from 'react'
import type { PlayerInput } from '../game/types'

type Props = {
  leftHanded: boolean
  sensitivity: number
  look: { x: number; y: number }
  onLook: (x: number, y: number) => void
  onInput: (input: Omit<PlayerInput, 'yaw'>) => void
  prompt: string | null
  paused: boolean
}

export function TouchControls({ leftHanded, sensitivity, look, onLook, onInput, prompt, paused }: Props) {
  const move = useRef({ ax: 0, az: 0 })
  const buttons = useRef({ jump: false, sprint: false, crouch: false, interact: false, craft: false, useMed: false })
  const stick = useRef<HTMLDivElement>(null)
  const lookPtr = useRef<number | null>(null)
  const lastLook = useRef<{ x: number; y: number } | null>(null)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  const flush = () => {
    if (pausedRef.current) return
    onInput({ ...move.current, ...buttons.current })
  }

  useEffect(() => {
    const id = window.setInterval(flush, 50)
    return () => window.clearInterval(id)
  }, [onInput])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.code === 'KeyW' || e.code === 'ArrowUp') move.current.az = -1
      if (e.code === 'KeyS' || e.code === 'ArrowDown') move.current.az = 1
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') move.current.ax = -1
      if (e.code === 'KeyD' || e.code === 'ArrowRight') move.current.ax = 1
      if (e.code === 'Space') buttons.current.jump = true
      if (e.code === 'ShiftLeft') buttons.current.sprint = true
      if (e.code === 'KeyC') buttons.current.crouch = true
      if (e.code === 'KeyE') buttons.current.interact = true
      if (e.code === 'KeyF') buttons.current.craft = true
      if (e.code === 'KeyQ') buttons.current.useMed = true
      flush()
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'KeyS' || e.code === 'ArrowDown') move.current.az = 0
      if (e.code === 'KeyA' || e.code === 'ArrowLeft' || e.code === 'KeyD' || e.code === 'ArrowRight') move.current.ax = 0
      if (e.code === 'Space') buttons.current.jump = false
      if (e.code === 'ShiftLeft') buttons.current.sprint = false
      if (e.code === 'KeyC') buttons.current.crouch = false
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
  }, [onInput])

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
    <div className="pointer-events-none absolute inset-0 z-20 select-none">
      {/* Virtual Movement Joystick */}
      <div
        className={`pointer-events-auto absolute bottom-[max(1.2rem,env(safe-area-inset-bottom))] ${
          side === 'left' ? 'left-4' : 'right-4'
        } h-36 w-36 rounded-full border border-[#AAA69B]/35 bg-[#171819]/65 backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.6)]`}
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
        {/* Cardinal Axis Markers */}
        <div className="absolute inset-x-0 top-2 text-center font-cinzel text-[8px] text-[#AAA69B]/40">N</div>
        <div className="absolute inset-x-0 bottom-2 text-center font-cinzel text-[8px] text-[#AAA69B]/40">S</div>
        <div className="absolute inset-y-0 left-2 flex items-center font-cinzel text-[8px] text-[#AAA69B]/40">W</div>
        <div className="absolute inset-y-0 right-2 flex items-center font-cinzel text-[8px] text-[#AAA69B]/40">E</div>

        {/* Joystick Control Knob */}
        <div
          className="absolute h-14 w-14 rounded-full border border-[#C59B61] bg-gradient-to-br from-[#C59B61]/80 to-[#8E6B39]/90 shadow-[0_0_15px_rgba(197,155,97,0.4)]"
          style={{
            left: `calc(50% + ${move.current.ax * 40}px - 28px)`,
            top: `calc(50% + ${move.current.az * 40}px - 28px)`,
          }}
        />
      </div>

      {/* Camera Aim / Touch Drag Zone */}
      <div
        className={`pointer-events-auto absolute inset-y-0 ${
          actions === 'right' ? 'right-0 w-[58%]' : 'left-0 w-[58%]'
        }`}
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

      {/* Virtual Action Button Pad */}
      <div
        className={`pointer-events-auto absolute bottom-[max(1.2rem,env(safe-area-inset-bottom))] ${
          actions === 'right' ? 'right-4' : 'left-4'
        } flex flex-col gap-2`}
      >
        <div className="flex gap-2">
          <Action label="JUMP" on={(v) => { buttons.current.jump = v; flush() }} />
          <Action label="SPRINT" on={(v) => { buttons.current.sprint = v; flush() }} />
        </div>
        <div className="flex gap-2">
          <Action
            label={prompt ?? 'USE'}
            accent={!!prompt}
            on={(v) => { buttons.current.interact = v; flush() }}
          />
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

function Action({
  label,
  on,
  accent,
}: {
  label: string
  on: (v: boolean) => void
  accent?: boolean
}) {
  return (
    <button
      className={`h-12 min-w-16 rounded-xs border px-3 font-cinzel text-[10px] sm:text-xs font-bold tracking-wider transition ${
        accent
          ? 'border-[#C59B61] bg-gradient-to-b from-[#C59B61]/80 to-[#8E6B39]/90 text-white shadow-[0_0_18px_rgba(197,155,97,0.6)] animate-pulse'
          : 'border-[#AAA69B]/30 bg-[#202223]/80 text-[#E8E4DC] active:bg-[#C59B61]/30 active:border-[#C59B61]'
      }`}
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
