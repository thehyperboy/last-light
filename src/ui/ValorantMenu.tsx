import { useEffect, useState } from 'react'
import { ValorantPortalFx } from './ValorantPortalFx'

type Tab = 'home' | 'collection' | 'play' | 'career' | 'store'
type GameMode = 'solo' | 'multi' | 'pass'
type CategoryHub = 'modes' | 'rewards' | 'missions' | 'ops'

type Props = {
  callsign: string
  onPlaySolo: () => void
  onPlayMulti: () => void
  onPlayPass: () => void
  onOpenSettings: () => void
  onOpenGuide: () => void
  onExit: () => void
  onPlaySound?: () => void
}

export function ValorantMenu({
  callsign,
  onPlaySolo,
  onPlayMulti,
  onPlayPass,
  onOpenSettings,
  onOpenGuide,
  onExit,
  onPlaySound,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('play')
  const [selectedMode, setSelectedMode] = useState<GameMode>('solo')
  const [openCategory, setOpenCategory] = useState<CategoryHub | null>(null)
  const [socialOpen, setSocialOpen] = useState(false)

  const handleTab = (t: Tab) => {
    onPlaySound?.()
    setActiveTab(t)
  }

  const openLittleWindow = (cat: CategoryHub) => {
    onPlaySound?.()
    setOpenCategory(cat)
  }

  const closeLittleWindow = () => {
    onPlaySound?.()
    setOpenCategory(null)
  }

  const handleStartSelected = () => {
    onPlaySound?.()
    if (selectedMode === 'solo') onPlaySolo()
    else if (selectedMode === 'multi') onPlayMulti()
    else onPlayPass()
  }

  // Close little window on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openCategory) {
        e.preventDefault()
        closeLittleWindow()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openCategory])

  const categoryConfigs: {
    id: CategoryHub
    icon: string
    title: string
    shortDesc: string
    badge: string
    subCount: number
  }[] = [
    {
      id: 'modes',
      icon: '🎮',
      title: 'GAME MODES',
      shortDesc: 'Campaign, LAN Co-op, Pass & Play',
      badge: selectedMode.toUpperCase(),
      subCount: 3,
    },
    {
      id: 'rewards',
      icon: '🎖️',
      title: 'REWARDS & TIERS',
      shortDesc: 'Unlockable agent gear & rigs',
      badge: '500 XP',
      subCount: 5,
    },
    {
      id: 'missions',
      icon: '📋',
      title: 'DAILY MISSIONS',
      shortDesc: 'Active XP bounties & objectives',
      badge: '3 ACTIVE',
      subCount: 3,
    },
    {
      id: 'ops',
      icon: '⚙️',
      title: 'SYSTEM & COMMS',
      shortDesc: 'Squad, settings, guide & exit',
      badge: 'READY',
      subCount: 4,
    },
  ]

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#070707] text-[#f0e6d8] select-none font-sans">
      {/* 4K Background Scenery */}
      <img
        src="/valorant-bg.jpg"
        alt="Floating Island"
        className="absolute inset-0 h-full w-full object-cover object-center contrast-110 brightness-[0.70] saturate-75"
      />

      {/* Real-time Dynamic Canvas Portal Effect & Floating Embers */}
      <ValorantPortalFx />

      {/* Atmospheric Vignette & Contrast Gradients — black + ember edges */}
      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_40%,rgba(7,7,7,0.78)_100%]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#070707]/95 via-[#070707]/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#070707]/95 via-[#070707]/60 to-transparent" />

      {/* ======================= TOP NAVIGATION BAR ======================= */}
      <header className="relative z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-[#ff6a00]/20 bg-[#090807]/90 px-3 sm:px-6 backdrop-blur-md">
        {/* Left Side: Logo & Level Badges */}
        <div className="flex items-center gap-2 sm:gap-5">
          <button
            onClick={() => handleTab('home')}
            className="group flex items-center gap-2 cursor-pointer focus:outline-none"
            title="Last Light Home"
          >
            <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center bg-gradient-to-br from-[#c41e1e] to-[#e85d04] val-cut-btn transition-transform group-hover:scale-105 shadow-md shadow-[#ff6a00]/40">
              <span className="font-mono text-xs sm:text-sm font-black text-white">LL</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-[#f0e6d8]/50">
                PROTOCOL 01
              </span>
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-widest text-white">
                SURVIVOR
              </span>
            </div>
          </button>

          {/* Level Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-sm border border-[#ff6a00]/20 bg-[#120f0d]/80 px-2 py-0.5 text-xs font-mono text-[#f0e6d8]/80">
              <span className="inline-block h-2 w-2 rounded-full bg-[#ff6a00]" />
              <span>0 / 2</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-sm border border-[#c41e1e]/30 bg-[#120f0d]/80 px-2 py-0.5 text-xs font-mono text-[#f0e6d8]/80">
              <span className="inline-block h-2 w-2 rounded-full bg-[#c41e1e]" />
              <span>0 / 3</span>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-4 md:gap-6 overflow-x-auto no-scrollbar py-1">
          {(
            [
              { id: 'home', label: 'HOME' },
              { id: 'play', label: 'PLAY' },
              { id: 'collection', label: 'COLLECTION' },
              { id: 'career', label: 'CAREER' },
              { id: 'store', label: 'STORE' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTab(tab.id)}
                className={`relative px-2 sm:px-3 py-2 sm:py-3.5 text-[11px] sm:text-xs md:text-sm font-black tracking-[0.18em] transition-all cursor-pointer shrink-0 focus:outline-none ${
                  isActive ? 'text-white' : 'text-[#f0e6d8]/60 hover:text-white'
                }`}
              >
                {isActive ? (
                  <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#c41e1e] via-[#e85d04] to-[#ff6a00] shadow-[0_0_10px_#ff6a00]" />
                ) : null}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right Side: Operator Badge, Currencies, Social, Settings, Exit */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Operator Badge */}
          <div className="flex items-center gap-1.5 rounded-sm border border-[#ff6a00]/30 bg-gradient-to-r from-[#170f0a] to-[#25130b] px-2 sm:px-2.5 py-1 text-xs font-mono text-white shadow-[0_0_10px_rgba(255,106,0,0.2)]">
            <span className="inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#ff6a00] animate-pulse" />
            <span className="font-bold text-[10px] sm:text-xs tracking-wider truncate max-w-[100px] sm:max-w-[140px]">{callsign}</span>
          </div>

          {/* Radianite & Points Counters (Hidden on mobile) */}
          <div className="hidden xl:flex items-center gap-2 font-mono text-xs text-[#f0e6d8]">
            <div className="flex items-center gap-1 rounded bg-[#120f0d]/80 px-2 py-1 border border-[#ff6a00]/25">
              <span className="text-[#ff6a00] font-bold">R</span>
              <span>120</span>
            </div>
            <div className="flex items-center gap-1 rounded bg-[#120f0d]/80 px-2 py-1 border border-[#c41e1e]/30">
              <span className="text-[#c41e1e] font-bold">V</span>
              <span>1,450</span>
            </div>
          </div>

          {/* Social Panel Toggle */}
          <button
            onClick={() => {
              onPlaySound?.()
              setSocialOpen((s) => !s)
            }}
            className={`flex items-center gap-1.5 rounded border px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
              socialOpen
                ? 'border-[#ff6a00] bg-[#ff6a00]/25 text-white shadow-[0_0_12px_rgba(255,106,0,0.4)]'
                : 'border-white/15 bg-[#120f0d]/80 text-[#f0e6d8]/80 hover:text-white hover:border-[#ff6a00]/40'
            }`}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[#ff6a00]" />
            <span className="hidden sm:inline">SOCIAL</span>
            <span className="sm:hidden">👥</span>
          </button>

          {/* Settings Gear */}
          <button
            onClick={() => {
              onPlaySound?.()
              onOpenSettings()
            }}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded border border-white/15 bg-[#120f0d]/80 text-[#f0e6d8]/70 hover:border-[#ff6a00]/40 hover:text-white transition cursor-pointer"
            title="Settings"
          >
            ⚙
          </button>

          {/* Exit / Logout */}
          <button
            onClick={() => {
              onPlaySound?.()
              onExit()
            }}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded border border-[#c41e1e]/40 bg-[#c41e1e]/15 text-[#c41e1e] hover:border-[#c41e1e] hover:text-white hover:bg-[#c41e1e]/30 transition cursor-pointer"
            title="Exit / Logout"
          >
            ✕
          </button>
        </div>
      </header>

      {/* ======================= MAIN CONTENT WORKSPACE ======================= */}
      <div className="relative z-10 flex h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] w-full overflow-hidden">
        {/* ================= PLAY TAB (SORTED FRONT PAGE) ================= */}
        {activeTab === 'play' ? (
          <div className="relative flex h-full w-full justify-between p-3 sm:p-6 overflow-hidden">
            {/* ================= LEFT COMMAND DOCK: UNIFIED CATEGORY ICONS ================= */}
            <div className="z-20 flex flex-col gap-3 pb-8 pointer-events-auto">
              <div className="flex flex-col gap-2.5">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ff6a00] font-black pl-1 hidden sm:block">
                  TACTICAL DOCK //
                </div>

                {/* 4 Clean Category Buttons */}
                <div className="flex flex-row lg:flex-col gap-2">
                  {categoryConfigs.map((cat) => {
                    const isOpen = openCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => openLittleWindow(cat.id)}
                        className={`group relative flex items-center gap-3 p-2.5 sm:px-3 sm:py-2.5 rounded border transition-all cursor-pointer val-cut-btn ${
                          isOpen
                            ? 'border-[#ff6a00] bg-gradient-to-r from-[#c41e1e]/30 via-[#e85d04]/25 to-[#ff6a00]/20 text-white shadow-[0_0_20px_rgba(255,106,0,0.4)]'
                            : 'border-[#ff6a00]/20 bg-[#0f0d0b]/85 text-[#f0e6d8]/75 hover:border-[#ff6a00]/50 hover:bg-[#1a140f] hover:text-white'
                        }`}
                        title={`Click to open ${cat.title} window`}
                      >
                        {/* Glowing Active Pip */}
                        {isOpen ? (
                          <span className="absolute -left-1 top-1/2 -translate-y-1/2 h-4 w-1 bg-[#ff6a00] rounded-r shadow-[0_0_8px_#ff6a00] hidden lg:block" />
                        ) : null}

                        {/* Main Category Icon */}
                        <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded text-lg sm:text-xl transition-transform group-hover:scale-110 ${
                          isOpen
                            ? 'bg-gradient-to-br from-[#c41e1e] to-[#ff6a00] text-white shadow-[0_0_12px_rgba(255,106,0,0.5)]'
                            : 'bg-[#1a140f] border border-white/10 text-white/90'
                        }`}>
                          {cat.icon}
                        </div>

                        {/* Label & Badge (Desktop) */}
                        <div className="hidden lg:flex flex-col text-left pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black tracking-wider uppercase text-white">
                              {cat.title}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#ff6a00]/20 text-[#ff8800] border border-[#ff6a00]/30 font-bold">
                              {cat.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/50 truncate max-w-[160px]">
                            {cat.shortDesc}
                          </span>
                        </div>

                        {/* Open Window Hint */}
                        <span className="hidden lg:inline text-xs font-mono text-[#ff6a00] ml-auto opacity-70 group-hover:opacity-100">
                          {isOpen ? '●' : '↗'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ================= CENTER HERO STAGE: TITLE & ACTION ================= */}
            <div className="relative flex flex-1 flex-col items-center justify-between py-4 sm:py-8 text-center z-10">
              {/* Massive Crisp Hero Title */}
              <div className="animate-fade-in flex flex-col items-center mt-2 sm:mt-6">
                <h1 className="val-logo text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[0.2em] sm:tracking-[0.24em] drop-shadow-2xl text-white">
                  LAST LIGHT
                </h1>

                {/* Ember Act Pill */}
                <div className="mt-2 inline-flex items-center rounded-sm bg-gradient-to-r from-[#c41e1e] via-[#e85d04] to-[#ff6a00] px-4 sm:px-6 py-0.5 sm:py-1 text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-[#ff6a00]/40 val-cut-btn">
                  IGNITION : ACT 1
                </div>

                {/* Subtitle Lore Callout */}
                <p className="mt-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-[#ff8800] drop-shadow">
                  SURVIVE TOGETHER · ESCAPE BEFORE DARK
                </p>
              </div>

              {/* Central Active Mode Display Indicator */}
              <div className="flex flex-col items-center my-auto p-4 rounded-xl border border-[#ff6a00]/20 bg-[#090807]/75 backdrop-blur-md max-w-sm w-full mx-4 shadow-[0_0_25px_rgba(0,0,0,0.6)]">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ff6a00]">
                  READY PROTOCOL //
                </div>
                <div className="mt-1 text-lg sm:text-xl font-black tracking-wider uppercase text-white flex items-center gap-2">
                  <span>
                    {selectedMode === 'solo' ? '🛡️ SOLO SURVIVAL' : selectedMode === 'multi' ? '📡 LOCAL MULTIPLAYER' : '👥 PASS-AND-PLAY'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[#f0e6d8]/60 font-mono">
                  {selectedMode === 'solo'
                    ? 'Offline Story Campaign · Generator & Beacon Escape'
                    : selectedMode === 'multi'
                    ? '2-Device WebRTC P2P LAN Co-op'
                    : '1-Device Turn-Based Party Mode'}
                </div>
                <button
                  type="button"
                  onClick={() => openLittleWindow('modes')}
                  className="mt-2 text-[11px] font-mono text-[#ff8800] hover:text-white underline cursor-pointer"
                >
                  Change Mode in Window ↗
                </button>
              </div>

              {/* Bottom Deploy CTA Button */}
              <div className="flex flex-col items-center pb-8 sm:pb-4 w-full max-w-md px-4">
                <button
                  onClick={handleStartSelected}
                  className="val-cut-btn group relative flex w-full sm:w-auto items-center justify-center overflow-hidden bg-gradient-to-r from-[#c41e1e] via-[#e85d04] to-[#ff6a00] px-8 sm:px-14 py-3.5 sm:py-4 font-black uppercase tracking-[0.24em] text-white shadow-[0_0_30px_rgba(255,106,0,0.6)] transition-all duration-150 hover:shadow-[0_0_50px_rgba(255,106,0,0.9)] hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-3 text-sm sm:text-base">
                    <span>DEPLOY TO ISLE</span>
                    <span className="transition-transform group-hover:translate-x-1.5 font-mono">→</span>
                  </span>
                  {/* Glowing shiny beam animation */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                </button>

                <p className="mt-2 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/70">
                  {selectedMode === 'solo'
                    ? 'Mode: Solo Survival (Story Campaign)'
                    : selectedMode === 'multi'
                    ? 'Mode: Local Multiplayer (WebRTC P2P)'
                    : 'Mode: Turn-Based Party (Pass-and-Play)'}
                </p>
              </div>
            </div>

            {/* ================= DEDICATED LITTLE WINDOW POPUP ================= */}
            {openCategory ? (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-fade-in"
                onClick={closeLittleWindow}
              >
                {/* Window Container Box (Angled Cuts + Ember Glow) */}
                <div
                  className="val-panel w-full max-w-lg max-h-[85vh] flex flex-col rounded-sm border-2 border-[#ff6a00]/40 shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_30px_rgba(255,106,0,0.3)] bg-[#0c0a08]/95 val-cut-tr val-cut-bl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Window Title Bar */}
                  <div className="flex items-center justify-between border-b border-[#ff6a00]/25 bg-[#14100c] px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded bg-gradient-to-br from-[#c41e1e] to-[#ff6a00] text-sm text-white shadow-[0_0_10px_rgba(255,106,0,0.4)]">
                        {categoryConfigs.find((c) => c.id === openCategory)?.icon}
                      </span>
                      <div>
                        <div className="text-xs font-black tracking-[0.18em] uppercase text-white">
                          {categoryConfigs.find((c) => c.id === openCategory)?.title}
                        </div>
                        <div className="text-[9px] font-mono text-[#ff8800] uppercase tracking-wider">
                          TACTICAL WINDOW // {categoryConfigs.find((c) => c.id === openCategory)?.badge}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={closeLittleWindow}
                      className="flex h-7 w-7 items-center justify-center rounded border border-[#ff6a00]/30 bg-[#1e150f] text-sm text-[#f0e6d8] hover:border-[#c41e1e] hover:bg-[#c41e1e]/25 hover:text-white transition font-mono cursor-pointer"
                      title="Close window (Esc)"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Window Body (Scrollable Sub-Icons) */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    {/* ================= WINDOW: GAME MODES SUB-ICONS ================= */}
                    {openCategory === 'modes' ? (
                      <div className="space-y-3">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-[#f0e6d8]/60 mb-2">
                          Select a deployment mode sub-icon:
                        </p>

                        {[
                          {
                            id: 'solo' as const,
                            icon: '🛡️',
                            title: 'SOLO SURVIVAL',
                            subtitle: 'Story Campaign · Offline Escape',
                            duration: '10-15 MINS',
                            desc: 'Scavenge parts, repair the maintenance bunker generator, evade biological stalkers, and extract alone.',
                          },
                          {
                            id: 'multi' as const,
                            icon: '📡',
                            title: 'LOCAL MULTIPLAYER',
                            subtitle: 'WebRTC P2P LAN · 2 Devices',
                            duration: '15-20 MINS',
                            desc: 'Zero-cloud Wi-Fi co-op. Share generator repair tasks, signal beacon, and revive downed teammates.',
                          },
                          {
                            id: 'pass' as const,
                            icon: '👥',
                            title: 'PASS-AND-PLAY',
                            subtitle: 'Turn-Based Party · 1 Device',
                            duration: '5-10 MINS',
                            desc: 'Pass the device between friends. Make hidden route choices before the squall storm reveals all.',
                          },
                        ].map((sub) => {
                          const isSelected = selectedMode === sub.id
                          return (
                            <div
                              key={sub.id}
                              onClick={() => {
                                onPlaySound?.()
                                setSelectedMode(sub.id)
                              }}
                              className={`p-3.5 border rounded transition cursor-pointer val-cut-btn ${
                                isSelected
                                  ? 'border-[#ff6a00] bg-gradient-to-r from-[#c41e1e]/30 via-[#e85d04]/25 to-[#ff6a00]/20 shadow-[0_0_20px_rgba(255,106,0,0.35)]'
                                  : 'border-white/10 bg-[#120f0d]/90 hover:border-[#ff6a00]/40 hover:bg-[#1a140f]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`flex h-9 w-9 items-center justify-center rounded text-lg ${
                                    isSelected ? 'bg-gradient-to-br from-[#c41e1e] to-[#ff6a00] text-white shadow-[0_0_10px_#ff6a00]' : 'bg-black/50 text-white/80'
                                  }`}>
                                    {sub.icon}
                                  </span>
                                  <div>
                                    <div className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-2">
                                      <span>{sub.title}</span>
                                      {isSelected ? (
                                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#ff6a00] text-black font-bold">
                                          ✓ SELECTED
                                        </span>
                                      ) : null}
                                    </div>
                                    <div className="text-[10px] text-white/50 font-mono">{sub.subtitle}</div>
                                  </div>
                                </div>
                                <span className="font-mono text-[9px] text-[#ff8800] border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-2 py-0.5 rounded">
                                  {sub.duration}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-[#f0e6d8]/75 leading-relaxed font-sans">
                                {sub.desc}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    ) : null}

                    {/* ================= WINDOW: REWARDS & CONTRACT TIERS SUB-ICONS ================= */}
                    {openCategory === 'rewards' ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs border-b border-[#ff6a00]/20 pb-2">
                          <span className="font-mono text-[#ff8800] uppercase text-[10px]">CURRENT CONTRACT PROGRESS</span>
                          <span className="font-mono text-white text-[10px] font-bold">500 XP TO NEXT TIER</span>
                        </div>

                        <div className="space-y-2">
                          {[
                            { tier: 6, icon: '🛡️', title: 'Vanguard Composite Shield', bonus: '+20% Damage Dampening', status: 'UNLOCKED' },
                            { tier: 7, icon: '⚡', title: 'Overcharge Beacon Core', bonus: '+35% Repair Speed', status: 'IN PROGRESS' },
                            { tier: 8, icon: '🔥', title: 'Thermite Distress Flare', bonus: 'Blinds Stalkers in 15m radius', status: 'LOCKED' },
                            { tier: 9, icon: '🎯', title: 'Tactical Recon Scope', bonus: 'Long-range Bio-Scanner', status: 'LOCKED' },
                            { tier: 10, icon: '👑', title: 'Apex Survivor Crown Rig', bonus: 'Legendary Extraction Finisher', status: 'LOCKED' },
                          ].map((t) => (
                            <div
                              key={t.tier}
                              className={`flex items-center justify-between p-3 rounded border ${
                                t.status === 'UNLOCKED'
                                  ? 'border-[#ff6a00]/50 bg-[#ff6a00]/15 text-white'
                                  : t.status === 'IN PROGRESS'
                                  ? 'border-[#e85d04]/40 bg-[#1c140e] text-white'
                                  : 'border-white/10 bg-[#120f0d] text-white/40'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded bg-black/60 text-base">
                                  {t.icon}
                                </span>
                                <div>
                                  <div className="text-xs font-bold tracking-wide text-white">
                                    Tier {t.tier} · {t.title}
                                  </div>
                                  <div className="text-[10px] text-[#ff8800] font-mono">{t.bonus}</div>
                                </div>
                              </div>
                              <span className="font-mono text-[9px] uppercase tracking-wider text-white/70 px-2 py-0.5 rounded bg-black/50">
                                {t.status}
                              </span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            closeLittleWindow()
                            onOpenGuide()
                          }}
                          className="mt-2 text-left font-mono text-[11px] tracking-wider text-[#ff8800] hover:text-white transition cursor-pointer underline block"
                        >
                          Inspect Full Contract Dossier ↗
                        </button>
                      </div>
                    ) : null}

                    {/* ================= WINDOW: DAILY MISSIONS SUB-ICONS ================= */}
                    {openCategory === 'missions' ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono border-b border-[#ff6a00]/20 pb-2">
                          <span className="text-[#ff8800] text-[10px]">ACTIVE DAILY BOUNTIES</span>
                          <span className="text-white/50 text-[10px]">RESET IN 18:09:29</span>
                        </div>

                        <div className="space-y-3">
                          {[
                            {
                              icon: '⚡',
                              title: 'Use Survival Abilities',
                              reward: '+8,250 XP',
                              progress: '44 / 200',
                              percent: '22%',
                              barColor: 'from-[#e85d04] to-[#ff6a00]',
                            },
                            {
                              icon: '🎯',
                              title: 'Deal Damage to Stalkers',
                              reward: '+8,100 XP',
                              progress: '4.6k / 25k',
                              percent: '18%',
                              barColor: 'from-[#e85d04] to-[#ff6a00]',
                            },
                            {
                              icon: '🔧',
                              title: 'Repair Facility Generator',
                              reward: '+12,000 XP',
                              progress: '1 / 2',
                              percent: '50%',
                              barColor: 'from-[#c41e1e] to-[#e85d04]',
                            },
                          ].map((m) => (
                            <div key={m.title} className="p-3 rounded border border-[#ff6a00]/20 bg-[#120f0d]">
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-2 text-white/90 font-bold text-xs">
                                  <span className="text-base">{m.icon}</span>
                                  <span>{m.title}</span>
                                </span>
                                <span className="font-mono text-xs text-[#ff8800] font-bold">{m.reward}</span>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="h-2 w-full bg-black/70 rounded-full overflow-hidden">
                                  <div className={`h-full bg-gradient-to-r ${m.barColor}`} style={{ width: m.percent }} />
                                </div>
                                <span className="font-mono text-[10px] text-white/60 whitespace-nowrap">{m.progress}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* ================= WINDOW: SYSTEM & COMMS SUB-ICONS ================= */}
                    {openCategory === 'ops' ? (
                      <div className="space-y-3">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-[#f0e6d8]/60 mb-2">
                          Terminal operations and network options:
                        </p>

                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              closeLittleWindow()
                              setSocialOpen(true)
                            }}
                            className="flex flex-col items-center justify-center p-3.5 rounded border border-white/10 bg-[#120f0d] hover:border-[#ff6a00] hover:bg-[#1a140f] transition text-center cursor-pointer val-cut-btn"
                          >
                            <span className="text-2xl">👥</span>
                            <span className="mt-1.5 text-xs font-bold text-white uppercase">Squad Social</span>
                            <span className="text-[9px] font-mono text-[#ff8800]">LAN Network</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              closeLittleWindow()
                              onOpenSettings()
                            }}
                            className="flex flex-col items-center justify-center p-3.5 rounded border border-white/10 bg-[#120f0d] hover:border-[#ff6a00] hover:bg-[#1a140f] transition text-center cursor-pointer val-cut-btn"
                          >
                            <span className="text-2xl">⚙️</span>
                            <span className="mt-1.5 text-xs font-bold text-white uppercase">Settings</span>
                            <span className="text-[9px] font-mono text-[#ff8800]">Audio / Controls</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              closeLittleWindow()
                              onOpenGuide()
                            }}
                            className="flex flex-col items-center justify-center p-3.5 rounded border border-white/10 bg-[#120f0d] hover:border-[#ff6a00] hover:bg-[#1a140f] transition text-center cursor-pointer val-cut-btn"
                          >
                            <span className="text-2xl">📖</span>
                            <span className="mt-1.5 text-xs font-bold text-white uppercase">Field Guide</span>
                            <span className="text-[9px] font-mono text-[#ff8800]">How to Play</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              closeLittleWindow()
                              onExit()
                            }}
                            className="flex flex-col items-center justify-center p-3.5 rounded border border-[#c41e1e]/40 bg-[#c41e1e]/15 hover:border-[#c41e1e] hover:bg-[#c41e1e]/30 transition text-center cursor-pointer val-cut-btn"
                          >
                            <span className="text-2xl">🚪</span>
                            <span className="mt-1.5 text-xs font-bold text-[#ff8080] uppercase">Logout</span>
                            <span className="text-[9px] font-mono text-white/50">End Session</span>
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Window Bottom Footer Bar */}
                  <div className="flex items-center justify-between border-t border-[#ff6a00]/20 bg-[#14100c] px-4 py-2.5">
                    <span className="text-[10px] font-mono text-white/40">
                      [ESC] OR CLICK OUTSIDE TO CLOSE
                    </span>
                    <button
                      type="button"
                      onClick={closeLittleWindow}
                      className="rounded bg-gradient-to-r from-[#c41e1e] to-[#e85d04] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-[#ff6a00]/30 hover:brightness-110 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* ================= DESKTOP RIGHT COLUMN: SOCIAL SIDEBAR ================= */}
            {socialOpen ? (
              <aside className="val-panel z-20 hidden lg:flex w-72 flex-col justify-between rounded-sm border-l border-[#ff6a00]/20 p-4 val-cut-bl bg-[#090807]/95 backdrop-blur-xl animate-fade-in">
                <div>
                  <div className="flex items-center justify-between border-b border-[#ff6a00]/20 pb-2.5">
                    <span className="text-[11px] font-black tracking-widest uppercase text-white">
                      SOCIAL & SQUAD
                    </span>
                    <button
                      onClick={() => setSocialOpen(false)}
                      className="text-white/40 hover:text-white text-xs px-1 font-mono cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      CURRENT SQUAD
                    </div>

                    <div className="flex items-center gap-2.5 rounded bg-[#120f0d] p-2 border border-[#ff6a00]/15">
                      <div className="relative h-8 w-8 rounded bg-gradient-to-br from-[#c41e1e] to-[#e85d04] flex items-center justify-center font-bold text-xs text-white">
                        {callsign.slice(0, 2).toUpperCase()}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#ff6a00] border border-[#0a0a0a]" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="truncate text-xs font-bold text-white">
                          {callsign}
                        </div>
                        <div className="text-[9px] text-[#ff8800] font-mono">
                          In Lobby · Ready
                        </div>
                      </div>
                    </div>

                    <div className="rounded border border-dashed border-[#ff6a00]/20 p-2 text-center text-[10px] font-mono text-white/40">
                      <span>OPEN SLOT (LAN PEER)</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/40">
                      <span>FRIENDS (0)</span>
                      <span>▾</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/40">
                      <span>OFFLINE SURVIVORS (16)</span>
                      <span>▾</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#ff6a00]/15 pt-3 flex items-center justify-between text-xs text-white/60">
                  <button
                    onClick={onPlayMulti}
                    className="flex items-center gap-1.5 hover:text-[#ff6a00] transition cursor-pointer"
                  >
                    <span>📡</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider">
                      Pair LAN
                    </span>
                  </button>
                  <button
                    onClick={onOpenSettings}
                    className="hover:text-white transition cursor-pointer"
                    title="Party Settings"
                  >
                    ⚙
                  </button>
                </div>
              </aside>
            ) : null}

            {/* ================= MOBILE SOCIAL SLIDE-OVER DRAWER ================= */}
            {socialOpen ? (
              <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="val-panel h-full w-72 max-w-[85vw] p-4 flex flex-col justify-between border-l border-[#ff6a00]/20 bg-[#090807]/95">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#ff6a00]/15 pb-3">
                      <span className="text-xs font-black tracking-widest uppercase text-white">
                        SQUAD & SOCIAL
                      </span>
                      <button
                        onClick={() => setSocialOpen(false)}
                        className="text-white/60 hover:text-white text-base px-2 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                        CURRENT OPERATOR
                      </div>
                      <div className="flex items-center gap-2.5 rounded bg-[#120f0d] p-2.5 border border-[#ff6a00]/15">
                        <div className="relative h-8 w-8 rounded bg-gradient-to-br from-[#c41e1e] to-[#e85d04] flex items-center justify-center font-bold text-xs text-white">
                          {callsign.slice(0, 2).toUpperCase()}
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#ff6a00] border border-[#0a0a0a]" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="truncate text-xs font-bold text-white">
                            {callsign}
                          </div>
                          <div className="text-[9px] text-[#ff8800] font-mono">
                            In Lobby · Ready
                          </div>
                        </div>
                      </div>

                      <div className="rounded border border-dashed border-[#ff6a00]/20 p-2 text-center text-[10px] font-mono text-white/40">
                        <span>OPEN SLOT (LAN PEER)</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#ff6a00]/15 pt-4 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setSocialOpen(false)
                        onPlayMulti()
                      }}
                      className="val-cut-btn w-full bg-gradient-to-r from-[#c41e1e] to-[#e85d04] py-2.5 text-center text-xs font-black uppercase tracking-wider text-white"
                    >
                      📡 Connect LAN Peer
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* ================= COLLECTION TAB ================= */}
        {activeTab === 'collection' ? (
          <div className="relative z-10 flex h-full w-full flex-col p-4 sm:p-8 overflow-y-auto">
            <h2 className="val-logo text-2xl sm:text-3xl font-black tracking-widest text-white mb-1">
              SURVIVOR ARSENAL & LOADOUT
            </h2>
            <p className="text-[10px] sm:text-xs text-white/60 font-mono uppercase tracking-widest mb-4 sm:mb-6">
              EQUIPMENT // BLUEPRINTS // SURVIVAL RIG
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl pb-12">
              {[
                { name: 'TACTICAL MACHETE', type: 'MELEE', stat: 'Damage: 45 · Cleave: 1.8m', skin: 'PRIME CARBON', icon: '🗡️' },
                { name: 'SIGNAL FLARE LAUNCHER', type: 'SECONDARY', stat: 'Beacon Range: 45m', skin: 'HAZMAT AMBER', icon: '🔦' },
                { name: 'FIELD GENERATOR RIG', type: 'UTILITY', stat: 'Efficiency: +35%', skin: 'PROTOTYPE V1', icon: '⚡' },
                { name: 'NANO-MEDICINE PACK', type: 'CONSUMABLE', stat: 'Heal: 40 HP over 2s', skin: 'STANDARD SPEC', icon: '💉' },
                { name: 'HARDENED COMPOSITE SUIT', type: 'ARMOR', stat: 'Damage Reduction: 20%', skin: 'STORMFALL RECON', icon: '🦺' },
                { name: 'EMERGENCY BEACON CORE', type: 'OBJECTIVE', stat: 'Extraction Hold: 16s', skin: 'QUANTUM MK-II', icon: '📡' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="val-panel val-cut-btn p-4 sm:p-5 transition hover:border-[#ff6a00] hover:shadow-[0_0_12px_rgba(255,106,0,0.2)] cursor-pointer bg-[#0f0d0b]/85"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-[#ff6a00]">
                    <span>{item.type}</span>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="mt-2 text-sm sm:text-base font-black tracking-wide text-white">
                    {item.name}
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-[#e85d04]">
                    SKIN: {item.skin}
                  </div>
                  <div className="mt-2.5 text-xs text-white/60 border-t border-[#ff6a00]/15 pt-2 font-mono">
                    {item.stat}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ================= CAREER TAB ================= */}
        {activeTab === 'career' ? (
          <div className="relative z-10 flex h-full w-full flex-col p-4 sm:p-8 overflow-y-auto">
            <h2 className="val-logo text-2xl sm:text-3xl font-black tracking-widest text-white mb-1">
              CAREER & OPERATIONAL DOSSIER
            </h2>
            <p className="text-[10px] sm:text-xs text-white/60 font-mono uppercase tracking-widest mb-4 sm:mb-6">
              RECORD OF EVACUATIONS // STORMFALL ISLE CAMPAIGN
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mb-6">
              <div className="val-panel p-3 sm:p-4 text-center bg-[#0f0d0b]/85">
                <div className="text-[9px] sm:text-[10px] font-mono text-white/50 uppercase">
                  EVACUATION RATE
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black text-[#ff6a00]">
                  78.4%
                </div>
              </div>
              <div className="val-panel p-3 sm:p-4 text-center bg-[#0f0d0b]/85">
                <div className="text-[9px] sm:text-[10px] font-mono text-white/50 uppercase">
                  MATCHES PLAYED
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black text-white">
                  34
                </div>
              </div>
              <div className="val-panel p-3 sm:p-4 text-center bg-[#0f0d0b]/85">
                <div className="text-[9px] sm:text-[10px] font-mono text-white/50 uppercase">
                  GENERATORS FIXED
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black text-[#e85d04]">
                  28
                </div>
              </div>
              <div className="val-panel p-3 sm:p-4 text-center bg-[#0f0d0b]/85">
                <div className="text-[9px] sm:text-[10px] font-mono text-white/50 uppercase">
                  STALKERS EVADED
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black text-[#c41e1e]">
                  112
                </div>
              </div>
            </div>

            <div className="max-w-4xl space-y-2 pb-12">
              <div className="text-xs font-mono uppercase tracking-widest text-white/50 mb-2">
                RECENT MATCHES
              </div>
              {[
                { outcome: 'EVACUATED', map: 'Stormfall Isle', time: '5m 12s', date: 'TODAY', win: true },
                { outcome: 'OVERRUN', map: 'Research Facility', time: '4m 38s', date: 'YESTERDAY', win: false },
                { outcome: 'EVACUATED', map: 'Stormfall Isle', time: '6m 02s', date: '2 DAYS AGO', win: true },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 sm:p-3.5 border rounded-sm ${
                    m.win
                      ? 'border-[#ff6a00]/30 bg-[#ff6a00]/10 text-white'
                      : 'border-[#c41e1e]/30 bg-[#c41e1e]/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{m.win ? '🚁' : '💀'}</span>
                    <div>
                      <div className="text-xs font-bold tracking-wider">{m.outcome}</div>
                      <div className="text-[10px] text-white/50 font-mono">
                        {m.map} · {m.time}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-white/60">{m.date}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ================= HOME TAB ================= */}
        {activeTab === 'home' ? (
          <div className="relative z-10 flex h-full w-full flex-col p-4 sm:p-8 overflow-y-auto">
            <h2 className="val-logo text-2xl sm:text-3xl font-black tracking-widest text-white mb-1">
              STORMFALL INTEL & FIELD BRIEFING
            </h2>
            <p className="text-[10px] sm:text-xs text-white/60 font-mono uppercase tracking-widest mb-4 sm:mb-6">
              RESEARCH FACILITY 04 // EMERGENCY LOGS
            </p>

            <div className="max-w-3xl space-y-4 pb-12">
              <div className="val-panel p-4 sm:p-5 border-l-4 border-[#c41e1e] bg-[#0f0d0b]/85">
                <div className="text-xs font-bold text-[#c41e1e] uppercase tracking-wider font-mono">
                  PRIORITY ALERT // SQUALL INBOUND
                </div>
                <div className="mt-1 text-base sm:text-lg font-black text-white">
                  BLACKOUT PROTOCOL ACTIVATED ACROSS ALL SECTORS
                </div>
                <p className="mt-2 text-xs text-[#f0e6d8]/80 leading-relaxed">
                  Power was severed at 0300 hours. Emergency backups failed. Survivors must scavenge components across the island, restart the auxiliary generator in the maintenance bunker, and restore the ridge evacuation beacon before nightfall.
                </p>
              </div>

              <div className="val-panel p-4 sm:p-5 border-l-4 border-[#ff6a00] bg-[#0f0d0b]/85">
                <div className="text-xs font-bold text-[#ff6a00] uppercase tracking-wider font-mono">
                  THREAT WARNING // BIOLOGICAL STALKERS
                </div>
                <p className="mt-2 text-xs text-[#f0e6d8]/80 leading-relaxed">
                  Stalkers patrol the forest clearing and facility perimeter. They use optical line-of-sight and respond to sprint footfalls. Use buildings to break line of sight. They cannot penetrate reinforced walls.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* ================= STORE TAB ================= */}
        {activeTab === 'store' ? (
          <div className="relative z-10 flex h-full w-full flex-col p-4 sm:p-8 overflow-y-auto">
            <h2 className="val-logo text-2xl sm:text-3xl font-black tracking-widest text-white mb-1">
              BLACK MARKET RESEARCH DEPOT
            </h2>
            <p className="text-[10px] sm:text-xs text-white/60 font-mono uppercase tracking-widest mb-4 sm:mb-6">
              FEATURED TACTICAL BUNDLES & RADIANITE BLUEPRINTS
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl pb-12">
              <div className="val-panel p-5 sm:p-6 border border-[#c41e1e]/40 val-cut-tr bg-[#0f0d0b]/85">
                <div className="inline-block bg-gradient-to-r from-[#c41e1e] to-[#e85d04] px-2 py-0.5 text-[9px] font-black uppercase text-white mb-2">
                  FEATURED BUNDLE
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">PRIME EXCAVATOR BUNDLE</h3>
                <p className="mt-1 text-xs text-white/60">
                  Includes Prime Combat Knife, Heavy Rig, and Radiant Flame Beacon FX.
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-[#ff6a00]/15 pt-3">
                  <span className="font-mono text-sm font-bold text-[#ff6a00]">2,175 VP</span>
                  <button className="val-cut-btn bg-gradient-to-r from-[#c41e1e] to-[#e85d04] px-4 py-2 text-xs font-black text-white uppercase hover:brightness-110 cursor-pointer">
                    PURCHASE
                  </button>
                </div>
              </div>

              <div className="val-panel p-5 sm:p-6 border border-[#ff6a00]/15 val-cut-bl bg-[#0f0d0b]/85">
                <div className="inline-block bg-[#ff6a00]/20 text-[#ff6a00] px-2 py-0.5 text-[9px] font-black uppercase mb-2">
                  RADIANITE UPGRADE
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">CUSTOM FINISHER FX</h3>
                <p className="mt-1 text-xs text-white/60">
                  Custom helicopter extraction cinematics and victory beam flares.
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-[#ff6a00]/15 pt-3">
                  <span className="font-mono text-sm font-bold text-[#ff6a00]">30 RP</span>
                  <button className="val-cut-btn border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-4 py-2 text-xs font-black text-white uppercase hover:bg-[#ff6a00]/20 cursor-pointer">
                    UPGRADE
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ======================= BOTTOM BAR HOTKEY FOOTER ======================= */}
      <footer className="pointer-events-none absolute bottom-0 inset-x-0 z-20 flex h-7 sm:h-8 items-center justify-between px-3 sm:px-6 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-white/40 bg-gradient-to-t from-black/80 to-transparent">
        <div>
          <span>LAST LIGHT // EMBER ENGINE UI 4.0</span> · <span className="text-[#ff6a00]">READY</span>
        </div>
        <div className="pointer-events-auto hidden sm:flex items-center gap-4">
          <button onClick={onOpenSettings} className="hover:text-white transition cursor-pointer">
            [O] SETTINGS
          </button>
          <button onClick={onExit} className="hover:text-[#c41e1e] transition cursor-pointer">
            [ESC] LOGOUT
          </button>
        </div>
      </footer>
    </div>
  )
}
