import { useEffect, useState } from 'react'
import { CornerFlourish, Insignia, MetallicDivider } from './FantasyIcons'

type Props = {
  callsign: string
  onContinue: () => void
  onSolo: () => void
  onMulti: () => void
  onCharacters: () => void
  onMaps: () => void
  onSettings: () => void
  onCredits: () => void
  onExit: () => void
  onPlaySound?: () => void
}

export function MainMenuScreen({
  callsign,
  onContinue,
  onSolo,
  onMulti,
  onCharacters,
  onMaps,
  onSettings,
  onCredits,
  onExit,
  onPlaySound,
}: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [lightning, setLightning] = useState(false)

  // Occasional subtle distant storm lightning flash
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() < 0.25) {
        setLightning(true)
        setTimeout(() => setLightning(false), 80)
        setTimeout(() => {
          if (Math.random() < 0.5) {
            setLightning(true)
            setTimeout(() => setLightning(false), 50)
          }
        }, 120)
      }
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const menuItems = [
    { label: 'CONTINUE EXPEDITION', action: onContinue, note: 'Resume Story Solo' },
    { label: 'SOLO SURVIVAL', action: onSolo, note: 'Singleplayer Island Campaign' },
    { label: 'LOCAL MULTIPLAYER', action: onMulti, note: 'Direct WebRTC LAN P2P' },
    { label: 'CHARACTER COLLECTION', action: onCharacters, note: 'Inspect 3D Survivor Roster' },
    { label: 'MAP SELECTION', action: onMaps, note: 'Expedition Sector Charts' },
    { label: 'SETTINGS', action: onSettings, note: 'Audio, Visuals & Controls' },
    { label: 'CREDITS & ARCHIVES', action: onCredits, note: 'Personnel Records' },
  ]

  const activeIdx = hoverIdx !== null ? hoverIdx : selectedIdx

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        onPlaySound?.()
        setSelectedIdx((p) => (p > 0 ? p - 1 : menuItems.length - 1))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        onPlaySound?.()
        setSelectedIdx((p) => (p < menuItems.length - 1 ? p + 1 : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onPlaySound?.()
        menuItems[activeIdx]?.action()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onExit()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeIdx, menuItems, onExit, onPlaySound])

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#171819] text-[#E8E4DC] select-none font-sans">
      {/* 4K Cinematic Remote Island Background with subtle pan drift */}
      <img
        src="/cinematic-bg.jpg"
        alt="Stormfall Isle"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center brightness-70 contrast-105 filter scale-105 transition-transform duration-1000 ease-out"
      />

      {/* Lightning Flash Overlay */}
      <div
        className={`pointer-events-none absolute inset-0 bg-[#E8E4DC]/15 mix-blend-screen transition-opacity duration-75 ${
          lightning ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Atmospheric Mist & Vignette Shading */}
      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_35%,rgba(23,24,25,0.75)_100%]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full sm:w-[58%] md:w-[48%] bg-gradient-to-r from-[#171819]/95 via-[#171819]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#171819]/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#171819]/90 to-transparent" />

      {/* Main Layout Container */}
      <div className="relative z-10 flex min-h-dvh flex-col justify-between px-6 sm:px-12 md:px-16 py-6 sm:py-8">
        {/* Top Header Status */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#C59B61] animate-ping" />
            <span className="font-cinzel text-[10px] sm:text-xs tracking-[0.28em] text-[#AAA69B] uppercase">
              SECTOR 04 // PROTOCOL BLACKOUT ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-2 font-cinzel text-[10px] sm:text-xs tracking-[0.25em] text-[#E8E4DC]/80">
            <span className="text-[#C59B61]">OPERATOR:</span>
            <span className="border border-[#C59B61]/40 bg-[#202223]/80 px-2.5 py-0.5">
              {callsign}
            </span>
          </div>
        </header>

        {/* Center-Left Brand & Vertical Nav */}
        <div className="my-auto max-w-xl py-6">
          {/* Animated Insignia & Majestic Editorial Heading */}
          <div className="flex items-center gap-4 mb-3">
            <Insignia className="h-14 w-14 sm:h-16 sm:w-16" spin />
            <div className="flex flex-col">
              <span className="font-cinzel text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-[#C59B61]">
                OFFLINE SURVIVAL ARCHITECTURE
              </span>
              <span className="font-cinzel text-[9px] tracking-[0.25em] text-[#AAA69B]/60 uppercase">
                RESEARCH ARCHIPELAGO // RESCUE DIRECTIVE
              </span>
            </div>
          </div>

          <h1 className="cinematic-title text-5xl sm:text-6xl md:text-7xl font-black">
            LAST LIGHT
          </h1>

          <p className="mt-1 font-editorial text-base sm:text-lg italic tracking-wider text-[#C59B61]">
            Survive Together. Escape Before Dark.
          </p>

          <MetallicDivider className="my-4 max-w-md" />

          {/* Vertical Menu Navigation List */}
          <nav className="flex flex-col items-start gap-1.5 sm:gap-2 max-w-md" aria-label="Main Navigation">
            {menuItems.map((item, idx) => {
              const isActive = activeIdx === idx
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    onPlaySound?.()
                    setSelectedIdx(idx)
                    item.action()
                  }}
                  onMouseEnter={() => {
                    onPlaySound?.()
                    setHoverIdx(idx)
                  }}
                  onMouseLeave={() => setHoverIdx(null)}
                  className={`group relative w-full text-left px-4 py-2.5 transition-all duration-200 cursor-pointer focus:outline-none border ${
                    isActive
                      ? 'df-card-active translate-x-2'
                      : 'border-transparent bg-transparent hover:bg-[#202223]/50'
                  }`}
                >
                  {isActive ? (
                    <>
                      <CornerFlourish position="top-left" color="#C59B61" size={12} />
                      <CornerFlourish position="bottom-right" color="#C59B61" size={12} />
                    </>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs transition-colors ${
                          isActive ? 'text-[#C59B61]' : 'text-transparent group-hover:text-[#AAA69B]'
                        }`}
                      >
                        ◆
                      </span>
                      <span
                        className={`font-cinzel text-xs sm:text-sm font-bold tracking-[0.24em] transition-colors ${
                          isActive ? 'text-[#FFFFFF]' : 'text-[#A5A4A0] group-hover:text-[#E8E4DC]'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>

                    <span
                      className={`hidden sm:inline font-mono text-[9px] uppercase tracking-widest transition-opacity ${
                        isActive ? 'text-[#C59B61] opacity-90' : 'text-[#AAA69B]/40 opacity-0 group-hover:opacity-70'
                      }`}
                    >
                      {item.note}
                    </span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Footer Hotkeys */}
        <footer className="flex items-center justify-between border-t border-[#AAA69B]/15 pt-3 font-cinzel text-[9px] sm:text-[10px] tracking-[0.25em] text-[#AAA69B]/60 uppercase">
          <div>
            <span>LAST LIGHT PROTOCOL // AAA DARK FANTASY EDITION</span> · <span className="text-[#C59B61]">100% OFFLINE</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                onPlaySound?.()
                onSettings()
              }}
              className="hover:text-[#C59B61] transition cursor-pointer"
            >
              [O] SETTINGS
            </button>
            <button
              onClick={() => {
                onPlaySound?.()
                onExit()
              }}
              className="hover:text-[#853D3D] transition cursor-pointer"
            >
              [ESC] EXIT TERMINAL
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

