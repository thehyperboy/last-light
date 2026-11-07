import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createAudio } from './game/audio'
import { areaName, currentObjective } from './game/simulation'
import { clearProfile, loadProfile, loadSettings, loadTutorialSeen, newId, newSessionId, saveSettings, saveTutorialSeen } from './game/storage'
import type { GameState, PlayerInput, Settings } from './game/types'
import { BEACON, CRAFTING, GENERATOR, dist2 } from './game/world'
import { MatchSession, type SessionInfo } from './net/session'
import type { SignalBundle } from './net/signaling'
import { GameView } from './scene/GameView'
import { HUD, DropOverlay } from './ui/HUD'
import { Login } from './ui/Login'
import { Pairing } from './ui/Pairing'
import { PassAndPlay } from './ui/PassAndPlay'
import { Credits, HostLost, HowToPlay, Lobby, ModeSelect, Results, SettingsScreen } from './ui/screens'
import { TouchControls } from './ui/TouchControls'
import { ValorantMenu } from './ui/ValorantMenu'
import { isOnline } from './pwa'

type Screen =
  | 'login'
  | 'menu'
  | 'mode'
  | 'how'
  | 'settings'
  | 'credits'
  | 'pass'
  | 'pairing'
  | 'lobby'
  | 'play'
  | 'results'
  | 'hostlost'

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [online, setOnline] = useState(isOnline())
  const [webgl, setWebgl] = useState(true)
  const [state, setState] = useState<GameState | null>(null)
  const [info, setInfo] = useState<SessionInfo | null>(null)
  const [look, setLook] = useState({ x: 0, y: 0.18 })
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [tutorial, setTutorial] = useState(() => !loadTutorialSeen())
  const [fps, setFps] = useState(0)
  const [name, setName] = useState(() => loadProfile()?.callsign || `Survivor-${Math.floor(Math.random() * 90 + 10)}`)
  const [localId] = useState(() => newId())
  const [pairRole, setPairRole] = useState<'host' | 'guest'>('host')
  const [sessionId, setSessionId] = useState('')
  const sessionRef = useRef<MatchSession | null>(null)
  const audioRef = useRef(createAudio())
  const lookRef = useRef(look)
  lookRef.current = look

  const bumpInfo = useCallback(() => {
    const s = sessionRef.current
    if (s) setInfo(s.info())
  }, [])

  const ensureSession = useCallback(() => {
    if (!sessionRef.current) {
      sessionRef.current = new MatchSession(localId, name, settings.useStun, {
        onLobby: () => {
          bumpInfo()
          setScreen((cur) => {
            if (cur !== 'pairing') return cur
            return sessionRef.current?.match ? 'play' : 'lobby'
          })
        },
        onState: (next) => {
          setState({ ...next, players: next.players.map((p) => ({ ...p, inv: { ...p.inv } })) })
          if (next.phase === 'results') setScreen('results')
          else if (next.phase === 'drop' || next.phase === 'play' || next.phase === 'extract') {
            setScreen((cur) => (cur === 'lobby' || cur === 'pairing' || cur === 'results' || cur === 'hostlost' ? 'play' : cur))
          }
        },
        onInfo: bumpInfo,
        onHostLost: () => setScreen('hostlost'),
      })
    }
    return sessionRef.current
  }, [bumpInfo, localId, name, settings.useStun])

  useEffect(() => {
    saveSettings(settings)
    audioRef.current.setSfx(settings.sfx)
    audioRef.current.setAmbience(settings.ambience)
  }, [settings])

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    try {
      const c = document.createElement('canvas')
      setWebgl(!!(c.getContext('webgl2') || c.getContext('webgl')))
    } catch {
      setWebgl(false)
    }
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
      audioRef.current.dispose()
      sessionRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let id = 0
    const loop = (t: number) => {
      frames += 1
      if (t - last > 500) {
        setFps((frames * 1000) / (t - last))
        frames = 0
        last = t
      }
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])

  const startSolo = () => {
    audioRef.current.unlock()
    const s = ensureSession()
    s.startSolo((Math.random() * 1e9) | 0)
    setScreen('play')
    setPaused(false)
  }

  const restartMatch = useCallback(() => {
    audioRef.current.unlock()
    const s = sessionRef.current
    if (s?.role === 'host') {
      s.rematch((Math.random() * 1e9) | 0)
    } else {
      sessionRef.current?.dispose()
      sessionRef.current = null
      const fresh = ensureSession()
      fresh.startSolo((Math.random() * 1e9) | 0)
    }
    setPaused(false)
    setScreen('play')
  }, [ensureSession])

  const startHostPairing = () => {
    audioRef.current.unlock()
    sessionRef.current?.dispose()
    sessionRef.current = null
    const id = newSessionId()
    setSessionId(id)
    setPairRole('host')
    const s = ensureSession()
    s.setUseStun(settings.useStun)
    s.prepareHost(id)
    bumpInfo()
    setScreen('pairing')
  }

  const startJoinPairing = () => {
    audioRef.current.unlock()
    sessionRef.current?.dispose()
    sessionRef.current = null
    setPairRole('guest')
    const s = ensureSession()
    s.setUseStun(settings.useStun)
    s.prepareGuest()
    bumpInfo()
    setScreen('pairing')
  }

  const onInput = useCallback((partial: Omit<PlayerInput, 'yaw'>) => {
    const s = sessionRef.current
    if (!s || paused) return
    s.setLocalInput({ ...partial, yaw: lookRef.current.x })
  }, [paused])

  const me = state?.players.find((p) => p.id === sessionRef.current?.localId) ?? state?.players[0]
  const prompt = useMemo(() => {
    if (!me || !state) return null
    if (state.pickups.some((p) => !p.taken && dist2(me.x, me.z, p.x, p.z) < 5.5)) return 'PICK UP'
    if (dist2(me.x, me.z, GENERATOR.x, GENERATOR.z) < 6) return 'REPAIR'
    if (dist2(me.x, me.z, CRAFTING.x, CRAFTING.z) < 6) return 'CRAFT'
    if (dist2(me.x, me.z, BEACON.x, BEACON.z) < 8) return 'BEACON'
    if (state.players.some((p) => p.downed && p.id !== me.id && dist2(me.x, me.z, p.x, p.z) < 6)) return 'REVIVE'
    return 'USE'
  }, [me, state])

  useEffect(() => {
    if (!state) return
    audioRef.current.setStorm(state.storm)
  }, [state])

  if (!webgl) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-charcoal p-6 text-ivory">
        WebGL is unavailable in this browser, so the 3D island cannot run.
      </div>
    )
  }

  if (screen === 'login') {
    return (
      <Login
        onLogin={(callsign) => {
          audioRef.current.unlock()
          audioRef.current.play('ui')
          setName(callsign)
          if (sessionRef.current) {
            sessionRef.current.localName = callsign
          }
          setScreen('menu')
        }}
        onPlayMulti={() => {
          audioRef.current.unlock()
          audioRef.current.play('ui')
          setScreen('mode')
        }}
        onOpenSettings={() => {
          audioRef.current.unlock()
          audioRef.current.play('ui')
          setScreen('settings')
        }}
        onOpenGuide={() => {
          audioRef.current.unlock()
          audioRef.current.play('ui')
          setScreen('how')
        }}
        onExit={() => {
          audioRef.current.play('ui')
        }}
        onPlaySound={() => {
          audioRef.current.unlock()
          audioRef.current.play('ui')
        }}
      />
    )
  }

  if (screen === 'menu') {
    return (
      <ValorantMenu
        callsign={name}
        onPlaySolo={startSolo}
        onPlayMulti={() => setScreen('mode')}
        onPlayPass={() => setScreen('pass')}
        onOpenSettings={() => setScreen('settings')}
        onOpenGuide={() => setScreen('how')}
        onExit={() => {
          audioRef.current.play('ui')
          clearProfile()
          setScreen('login')
        }}
        onPlaySound={() => {
          audioRef.current.unlock()
          audioRef.current.play('ui')
        }}
      />
    )
  }
  if (screen === 'how') return <HowToPlay onBack={() => setScreen('menu')} />
  if (screen === 'credits') return <Credits onBack={() => setScreen('menu')} />
  if (screen === 'settings') {
    return <SettingsScreen settings={settings} setSettings={setSettings} onBack={() => setScreen('menu')} />
  }
  if (screen === 'mode') {
    return (
      <ModeSelect
        onBack={() => setScreen('menu')}
        onSolo={startSolo}
        onHost={startHostPairing}
        onJoin={startJoinPairing}
        onPass={() => setScreen('pass')}
      />
    )
  }
  if (screen === 'pass') return <PassAndPlay onBack={() => setScreen('menu')} />
  if (screen === 'hostlost') {
    return (
      <HostLost
        onMenu={() => {
          sessionRef.current?.dispose()
          sessionRef.current = null
          setScreen('menu')
        }}
        onReconnect={() => {
          const s = sessionRef.current
          if (!s) return
          s.beginReconnectHandshake()
          setPairRole('guest')
          bumpInfo()
          setScreen('pairing')
        }}
      />
    )
  }
  if (screen === 'results' && state) {
    return (
      <Results
        state={state}
        onRestart={restartMatch}
        onRematch={restartMatch}
        onMenu={() => {
          sessionRef.current?.dispose()
          sessionRef.current = null
          setScreen('menu')
        }}
      />
    )
  }

  const playing = (screen === 'play' || screen === 'lobby') && state
  const pairing = screen === 'pairing'
  const s = pairing ? ensureSession() : sessionRef.current

  return (
    <div className="relative h-dvh overflow-hidden bg-charcoal">
      {state && me ? (
        <GameView state={state} localId={me.id} lookX={look.x} lookY={look.y} settings={settings} />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2b1106,transparent)]" />
      )}
      {pairing && s ? (
        <div className="absolute inset-0 z-40 overflow-auto bg-[#070707]/95">
          <Pairing
            role={pairRole}
            sessionId={sessionId || s.sessionId}
            localName={name}
            status={info?.status ?? 'idle'}
            detail={info?.detail ?? ''}
            onCreateOffer={async () => {
              if (!s.peer) throw new Error('Host peer missing')
              return s.peer.createHostOffer(s.sessionId, name)
            }}
            onAcceptOffer={async (bundle: SignalBundle) => {
              if (!s.peer) throw new Error('Guest peer missing')
              setSessionId(bundle.sessionId)
              return s.peer.acceptOfferMakeAnswer(bundle, name)
            }}
            onAcceptAnswer={async (bundle: SignalBundle) => {
              if (!s.peer) throw new Error('Host peer missing')
              await s.peer.acceptAnswer(bundle)
            }}
            onCancel={() => {
              if (state && pairRole === 'host') {
                setScreen('play')
                return
              }
              s.leave()
              sessionRef.current = null
              setScreen('menu')
            }}
          />
        </div>
      ) : null}
      {screen === 'lobby' && info ? (
        <Lobby
          info={info}
          ready={ready}
          canStart={sessionRef.current?.canStart() ?? false}
          onReady={() => {
            const next = !ready
            setReady(next)
            sessionRef.current?.setLocalReady(next)
            if ((info.status === 'connected' || info.status === 'loopback') && screen === 'lobby') audioRef.current.play('ui')
          }}
          onStart={() => {
            sessionRef.current?.startMatch((Math.random() * 1e9) | 0)
            setScreen('play')
          }}
          onLeave={() => {
            sessionRef.current?.leave()
            sessionRef.current = null
            setScreen('menu')
          }}
        />
      ) : null}
      {screen === 'play' && info?.role === 'host' && info.reconnectUntil ? (
        <div className="absolute inset-x-3 top-20 z-30 rounded-2xl border border-[#ff6a00]/40 bg-black/85 p-3 text-sm shadow-[0_0_20px_rgba(255,106,0,0.2)]">
          <p className="text-[#ff6a00] font-bold">Guest disconnected</p>
          <p className="mt-1 text-ivory/70">Match is still hosted here. Share a new offer before {new Date(info.reconnectUntil).toLocaleTimeString()}.</p>
          <button
            className="mt-2 rounded-xl bg-gradient-to-r from-[#c41e1e] to-[#e85d04] px-3 py-2 text-white font-bold text-xs"
            onClick={() => {
              sessionRef.current?.beginReconnectHandshake()
              setPairRole('host')
              bumpInfo()
              setScreen('pairing')
            }}
          >
            Generate reconnect offer
          </button>
        </div>
      ) : null}
      {playing && me && state ? (
        <>
          <HUD
            state={state}
            me={me}
            fps={fps}
            showFps={settings.showFps}
            net={sessionRef.current?.role === 'solo' ? 'solo' : `${sessionRef.current?.role ?? ''} · ${info?.status ?? ''}`}
            onPause={() => setPaused((p) => !p)}
          />
          {state.phase === 'drop' ? <DropOverlay onSkip={() => sessionRef.current?.skipDrop()} /> : null}
          <TouchControls
            leftHanded={settings.leftHanded}
            sensitivity={settings.sensitivity}
            look={look}
            onLook={(x, y) => setLook({ x, y })}
            onInput={onInput}
            prompt={prompt}
            paused={paused || state.phase === 'drop'}
            onPause={() => setPaused((p) => !p)}
          />
          {tutorial ? (
            <div className="absolute inset-x-4 top-24 z-40 rounded-2xl border border-[#ff6a00]/30 bg-black/85 p-4 text-sm shadow-[0_0_25px_rgba(255,106,0,0.25)]">
              <p className="text-[#ff6a00] font-black uppercase tracking-wider">Field brief</p>
              <p className="mt-1 text-ivory/80">Left stick moves. Drag the right side to look. Repair the generator at the bunker, then light the beacon on the ridge.</p>
              <p className="mt-1 text-xs text-ivory/50">{currentObjective(state)} · {areaName(me.x, me.z)}</p>
              <button
                className="mt-3 rounded-xl bg-gradient-to-r from-[#c41e1e] to-[#e85d04] px-4 py-2 text-white font-bold"
                onClick={() => {
                  saveTutorialSeen()
                  setTutorial(false)
                }}
              >
                Understood
              </button>
            </div>
          ) : null}
        </>
      ) : null}
      {paused ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="val-panel val-cut-tr max-w-sm w-full p-6 sm:p-8 text-center rounded border border-[#ff6a00]/30 shadow-[0_0_50px_rgba(0,0,0,0.95)] bg-[#0b0a08]/95">
            <p className="font-display text-4xl text-white tracking-[0.2em] font-black">PAUSED</p>
            <p className="mt-1 text-xs font-mono text-[#ff8800] uppercase tracking-widest">Tactical Freeze // Sector-04</p>
            
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                className="w-full rounded-xl bg-gradient-to-r from-[#c41e1e] via-[#e85d04] to-[#ff6a00] py-3 text-white font-black tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(255,106,0,0.4)] hover:brightness-110 active:scale-[0.99] transition cursor-pointer val-cut-btn"
                data-ui
                onClick={() => { setPaused(false); document.body.requestPointerLock() }}
              >
                Resume Mission
              </button>
              
              <button
                className="w-full rounded-xl border border-[#ff6a00]/40 bg-[#ff6a00]/15 py-3 text-[#ff8800] font-black tracking-wider uppercase text-xs hover:bg-[#ff6a00]/25 hover:text-white transition cursor-pointer flex items-center justify-center gap-2 val-cut-btn"
                data-ui
                onClick={restartMatch}
              >
                <span>🔄</span>
                <span>Restart Match</span>
              </button>

              <button
                className="w-full rounded-xl border border-white/15 bg-black/40 py-2.5 text-xs font-mono uppercase text-ivory/60 hover:text-white hover:border-white/30 transition cursor-pointer"
                data-ui
                onClick={() => { sessionRef.current?.leave(); sessionRef.current = null; setScreen('menu') }}
              >
                Quit to Menu
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {!online ? <div className="absolute left-3 top-[max(0.4rem,env(safe-area-inset-top))] z-40 text-[10px] uppercase tracking-widest text-[#ff6a00] font-mono">Offline</div> : null}
    </div>
  )
}
