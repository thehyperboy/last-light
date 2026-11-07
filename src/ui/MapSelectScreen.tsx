import { useState } from 'react'
import { CornerFlourish, Insignia, MetallicDivider } from './FantasyIcons'

type Props = {
  onSelectMap: (mapId: string) => void
  onBack: () => void
  onPlaySound?: () => void
}

type MapSector = {
  id: string
  name: string
  sectorCode: string
  status: 'active' | 'classified'
  difficulty: 'STANDARD' | 'EXTREME' | 'DEADLY'
  threat: string
  environment: string
  description: string
  objectives: string[]
  backdrop: string
}

const MAP_SECTORS: MapSector[] = [
  {
    id: 'stormfall',
    name: 'STORMFALL ISLE',
    sectorCode: 'SECTOR-04 // RESEARCH OUTPOST',
    status: 'active',
    difficulty: 'EXTREME',
    threat: 'Class-4 Atmospheric Squall & Biological Stalkers',
    environment: 'Coastal Granite Cliffs, Ancient Pines, Decommissioned Facilities',
    description:
      'The primary research archipelago where all primary grid power went dark at 0300 hours. Survivors must navigate rugged coastal paths, restore the auxiliary generator in the maintenance bunker, and ignite the radio beacon on the high ridge before the squall cuts off all air extraction.',
    objectives: [
      'Scavenge tech components & survival supplies',
      'Restart the auxiliary power generator at Bunker-02',
      'Ignite the evacuation radio beacon on Ridgecrest',
      'Defend extraction zone until rescue extraction arrives',
    ],
    backdrop: '/cinematic-bg.jpg',
  },
  {
    id: 'drowned_depths',
    name: 'THE DROWNED DEPTHS',
    sectorCode: 'SECTOR-09 // SUB-AQUIFER LAB',
    status: 'classified',
    difficulty: 'DEADLY',
    threat: 'Submerged Corridors & Apex Stalkers',
    environment: 'Flooded Subterranean Turbines & Hydro-Labs',
    description:
      'Deep subterranean research facility beneath the coastal shelf. Breached bulkheads have inundated all lower transit corridors. Currently sealed by high-level biometric locks.',
    objectives: ['Drain turbine chamber', 'Acquire quantum core', 'Breach blast gate'],
    backdrop: '/bunker-bg.jpg',
  },
]

export function MapSelectScreen({ onSelectMap, onBack, onPlaySound }: Props) {
  const [activeMap, setActiveMap] = useState<MapSector>(MAP_SECTORS[0])

  const handleSelect = (m: MapSector) => {
    onPlaySound?.()
    setActiveMap(m)
  }

  const handleDeploy = () => {
    if (activeMap.status !== 'active') return
    onPlaySound?.()
    onSelectMap(activeMap.id)
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#171819] text-[#E8E4DC] select-none font-sans">
      {/* Background Graphic with Subtle Ken-Burns Drift */}
      <img
        src={activeMap.backdrop}
        alt={activeMap.name}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center brightness-45 contrast-110 filter transition-all duration-700"
      />
      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_30%,rgba(23,24,25,0.85)_100%]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171819] via-[#171819]/60 to-[#171819]/80" />

      {/* Top Header */}
      <header className="relative z-20 flex h-16 w-full items-center justify-between border-b border-[#AAA69B]/20 bg-[#202223]/80 px-4 sm:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Insignia className="h-9 w-9" />
          <div className="flex flex-col">
            <span className="font-cinzel text-xs sm:text-sm font-bold tracking-[0.24em] text-[#E8E4DC]">
              EXPEDITION CHART
            </span>
            <span className="font-cinzel text-[9px] uppercase tracking-[0.3em] text-[#AAA69B]/70">
              SECTOR RECONNAISSANCE // EXTRACTION ZONES
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            onPlaySound?.()
            onBack()
          }}
          className="df-btn-silver px-4 py-1.5 text-xs tracking-[0.2em] cursor-pointer"
        >
          ← Return to Citadel
        </button>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col lg:flex-row h-[calc(100dvh-4rem)] w-full p-4 sm:p-8 gap-6 justify-between overflow-y-auto">
        {/* Left Column: Sector List */}
        <div className="w-full lg:w-80 flex flex-col gap-3 shrink-0">
          <div className="font-cinzel text-[11px] font-bold uppercase tracking-[0.25em] text-[#AAA69B] mb-1">
            TARGET SECTORS
          </div>

          {MAP_SECTORS.map((m) => {
            const isSelected = activeMap.id === m.id
            const isActive = m.status === 'active'
            return (
              <button
                key={m.id}
                onClick={() => handleSelect(m)}
                className={`relative p-4 text-left border transition-all cursor-pointer ${
                  isSelected ? 'df-card-active' : 'df-panel df-panel-hover'
                }`}
              >
                <CornerFlourish position="top-left" color={isSelected ? '#C59B61' : '#AAA69B'} size={14} />
                <CornerFlourish position="bottom-right" color={isSelected ? '#C59B61' : '#AAA69B'} size={14} />

                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-xs font-bold tracking-wider text-[#E8E4DC]">
                    {m.name}
                  </span>
                  <span
                    className={`font-cinzel text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-xs border ${
                      isActive
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400'
                        : 'border-[#AAA69B]/20 bg-black/40 text-[#AAA69B]/60'
                    }`}
                  >
                    {isActive ? 'DEPLOYABLE' : 'CLASSIFIED'}
                  </span>
                </div>
                <div className="mt-1 font-cinzel text-[10px] text-[#C59B61] tracking-widest">
                  {m.sectorCode}
                </div>
                <div className="mt-2 text-[11px] text-[#A5A4A0] line-clamp-2">
                  {m.environment}
                </div>
              </button>
            )
          })}
        </div>

        {/* Center / Right Column: Mission Briefing Dossier */}
        <div className="flex-1 max-w-2xl df-panel p-6 sm:p-8 relative flex flex-col justify-between">
          <CornerFlourish position="top-left" color="#C59B61" size={24} />
          <CornerFlourish position="top-right" color="#C59B61" size={24} />
          <CornerFlourish position="bottom-left" color="#C59B61" size={24} />
          <CornerFlourish position="bottom-right" color="#C59B61" size={24} />

          <div>
            <div className="flex items-center justify-between border-b border-[#AAA69B]/20 pb-3">
              <span className="font-cinzel text-xs uppercase tracking-[0.28em] text-[#C59B61]">
                SECTOR DOSSIER
              </span>
              <span className="font-cinzel text-xs uppercase tracking-widest text-[#853D3D] flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-[#853D3D] animate-ping" />
                THREAT LEVEL // {activeMap.difficulty}
              </span>
            </div>

            <h2 className="font-cinzel text-3xl sm:text-4xl font-black tracking-widest text-[#E8E4DC] mt-4">
              {activeMap.name}
            </h2>
            <p className="font-cinzel text-xs tracking-[0.25em] text-[#C59B61] mt-1 uppercase">
              {activeMap.sectorCode}
            </p>

            <MetallicDivider label="ENVIRONMENT & CONDITIONS" className="my-4" />

            <p className="text-xs sm:text-sm text-[#E8E4DC]/90 leading-relaxed font-sans">
              {activeMap.description}
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 border border-[#AAA69B]/15 bg-[#171819]/70 rounded-xs">
                <span className="text-[#AAA69B]/60 uppercase tracking-wider block text-[10px]">
                  Atmospheric Hazard
                </span>
                <span className="text-[#E8E4DC] mt-0.5 block">{activeMap.threat}</span>
              </div>
              <div className="p-3 border border-[#AAA69B]/15 bg-[#171819]/70 rounded-xs">
                <span className="text-[#AAA69B]/60 uppercase tracking-wider block text-[10px]">
                  Extraction Window
                </span>
                <span className="text-[#C59B61] mt-0.5 block">06:00 Minutes</span>
              </div>
            </div>

            <MetallicDivider label="CRITICAL DIRECTIVES" className="my-4" />

            <div className="space-y-2">
              {activeMap.objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-[#E8E4DC]/90">
                  <span className="font-cinzel text-[10px] text-[#C59B61] font-bold">
                    0{i + 1}.
                  </span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#AAA69B]/20">
            {activeMap.status === 'active' ? (
              <button
                onClick={handleDeploy}
                className="df-btn-gold w-full py-4 text-center text-sm font-bold tracking-[0.28em] cursor-pointer"
              >
                DEPLOY TO SECTOR 04 →
              </button>
            ) : (
              <div className="text-center font-cinzel text-xs text-[#AAA69B]/60 uppercase tracking-[0.24em] py-3 border border-white/10 bg-black/40">
                🔒 SECTOR DATA RESTRICTED // CLEARANCE REQUIRED
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

