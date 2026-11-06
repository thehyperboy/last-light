import { useState } from 'react'
import type { Inventory } from '../game/types'
import { CornerFlourish, ItemGlyph, MetallicDivider } from './FantasyIcons'

type Props = {
  inv: Inventory
  health: number
  onUseMeds: () => void
  onCraftKit: () => void
  onClose: () => void
  onPlaySound?: () => void
}

type ItemDetails = {
  id: keyof Inventory
  name: string
  category: 'RAW RESOURCE' | 'SURVIVAL CONSUMABLE' | 'MISSION OBJECTIVE'
  rarity: 'COMMON' | 'CRITICAL' | 'EXPEDITION'
  desc: string
  usage: string
  color: string
}

const ITEMS: ItemDetails[] = [
  {
    id: 'meds',
    name: 'NANO-STASIS SYRINGE',
    category: 'SURVIVAL CONSUMABLE',
    rarity: 'CRITICAL',
    desc: 'Stabilized triage compound that seals lacerations and halts trauma hemorrhage within seconds.',
    usage: 'Consumes 1 unit to immediately restore +35 Health.',
    color: '#853D3D',
  },
  {
    id: 'kits',
    name: 'REINFORCED REPAIR KIT',
    category: 'MISSION OBJECTIVE',
    rarity: 'EXPEDITION',
    desc: 'Custom composite calibration kit assembled from scrap metal and circuit components. Essential to overhaul the maintenance bunker generator.',
    usage: 'Deploy at the generator station in the maintenance bunker to restore power.',
    color: '#C59B61',
  },
  {
    id: 'metal',
    name: 'ALLOY SALVAGE',
    category: 'RAW RESOURCE',
    rarity: 'COMMON',
    desc: 'Heavy structural titanium and composite plate stripped from research facility bulkheads.',
    usage: 'Crafting component. Combine with 1 Repair Component at the bunker workshop to craft a Repair Kit.',
    color: '#AAA69B',
  },
  {
    id: 'repair',
    name: 'CIRCUIT HARNESS',
    category: 'RAW RESOURCE',
    rarity: 'COMMON',
    desc: 'High-voltage copper wiring and micro-fuse regulators harvested from severed electrical junction boxes.',
    usage: 'Crafting component. Combine with 1 Alloy Salvage at the bunker workshop to craft a Repair Kit.',
    color: '#AAA69B',
  },
  {
    id: 'batteries',
    name: 'HIGH-DENSITY BATTERY',
    category: 'RAW RESOURCE',
    rarity: 'CRITICAL',
    desc: 'Sealed lithium-ion cells charged with emergency power reserves. Required to energize the clifftop radio beacon.',
    usage: 'Deliver to the evacuation radio beacon tower on the eastern ridge.',
    color: '#C59B61',
  },
]

export function InventoryModal({
  inv,
  health,
  onUseMeds,
  onCraftKit,
  onClose,
  onPlaySound,
}: Props) {
  const [selectedKey, setSelectedKey] = useState<keyof Inventory>('meds')

  const activeItem = ITEMS.find((i) => i.id === selectedKey) || ITEMS[0]
  const count = inv[activeItem.id] || 0
  const canCraft = inv.metal >= 1 && inv.repair >= 1

  const handleSelect = (k: keyof Inventory) => {
    onPlaySound?.()
    setSelectedKey(k)
  }

  const handleUse = () => {
    onPlaySound?.()
    if (activeItem.id === 'meds' && inv.meds > 0 && health < 100) {
      onUseMeds()
    }
  }

  const handleCraft = () => {
    onPlaySound?.()
    if (canCraft) {
      onCraftKit()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="df-panel w-full max-w-3xl rounded-sm p-6 sm:p-8 relative max-h-[90vh] flex flex-col justify-between overflow-hidden">
        <CornerFlourish position="top-left" color="#C59B61" size={24} />
        <CornerFlourish position="top-right" color="#C59B61" size={24} />
        <CornerFlourish position="bottom-left" color="#C59B61" size={24} />
        <CornerFlourish position="bottom-right" color="#C59B61" size={24} />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#AAA69B]/20 pb-3">
          <div>
            <span className="font-cinzel text-sm sm:text-base font-bold tracking-[0.24em] text-[#E8E4DC]">
              SURVIVAL SATCHEL // GEAR & SUPPLIES
            </span>
            <span className="block font-cinzel text-[10px] tracking-[0.28em] text-[#C59B61] uppercase">
              OPERATIONAL INVENTORY · 5 STORAGE SLOTS
            </span>
          </div>

          <button
            onClick={() => {
              onPlaySound?.()
              onClose()
            }}
            className="df-btn-silver h-8 w-8 flex items-center justify-center text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body Grid */}
        <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-1">
          {/* Left Side: Item Slots Grid */}
          <div>
            <div className="font-cinzel text-[10px] uppercase tracking-[0.24em] text-[#AAA69B] mb-2">
              EQUIPMENT STORAGE
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
              {ITEMS.map((item) => {
                const qty = inv[item.id] || 0
                const isSelected = item.id === selectedKey
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`relative p-3 rounded-xs border text-center flex flex-col items-center justify-between transition cursor-pointer min-h-[96px] ${
                      isSelected
                        ? 'border-[#C59B61] bg-[#C59B61]/20 shadow-[0_0_15px_rgba(197,155,97,0.3)]'
                        : qty > 0
                        ? 'border-[#AAA69B]/25 bg-[#202223] hover:border-[#AAA69B]/50'
                        : 'border-white/10 bg-[#171819]/50 opacity-50'
                    }`}
                  >
                    <ItemGlyph kind={item.id} className="h-8 w-8 mt-1" />
                    <span className="font-cinzel text-[10px] font-bold text-[#E8E4DC] truncate max-w-full mt-1">
                      {item.id.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs text-[#C59B61] font-bold">
                      x{qty}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Quick Crafting Station Preview */}
            <MetallicDivider label="FIELD ASSEMBLY" className="my-3" />
            <div className="rounded border border-[#AAA69B]/20 bg-[#171819]/60 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ItemGlyph kind="kit" className="h-6 w-6" />
                <div>
                  <div className="font-cinzel text-[11px] font-bold text-[#E8E4DC]">
                    ASSEMBLE REPAIR KIT
                  </div>
                  <div className="font-mono text-[10px] text-[#A5A4A0]">
                    Cost: 1 Metal + 1 Repair Component
                  </div>
                </div>
              </div>

              <button
                onClick={handleCraft}
                disabled={!canCraft}
                className={`px-3 py-1.5 font-cinzel text-[10px] tracking-wider uppercase transition ${
                  canCraft ? 'df-btn-gold cursor-pointer' : 'opacity-40 border border-white/10 cursor-not-allowed text-white/50'
                }`}
              >
                Assemble
              </button>
            </div>
          </div>

          {/* Right Side: Detailed Item Dossier */}
          <div className="df-panel p-4 relative flex flex-col justify-between border border-[#AAA69B]/20 bg-[#171819]/90">
            <div>
              <div className="flex items-center justify-between border-b border-[#AAA69B]/15 pb-2">
                <span className="font-cinzel text-[9px] uppercase tracking-widest text-[#C59B61]">
                  {activeItem.category}
                </span>
                <span className="font-cinzel text-[9px] uppercase tracking-widest text-[#AAA69B]">
                  RARITY // {activeItem.rarity}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-14 w-14 rounded border border-[#C59B61]/40 bg-[#202223] flex items-center justify-center">
                  <ItemGlyph kind={activeItem.id} className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#E8E4DC]">
                    {activeItem.name}
                  </h3>
                  <div className="font-mono text-xs text-[#C59B61] mt-0.5">
                    Quantity In Satchel: {count}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-[#E8E4DC]/80 leading-relaxed font-sans">
                {activeItem.desc}
              </p>

              <div className="mt-4 p-2.5 rounded border border-[#AAA69B]/15 bg-[#202223]/70 font-mono text-[11px] text-[#A5A4A0]">
                <span className="text-[#C59B61] font-bold block mb-0.5 font-cinzel text-[10px]">
                  APPLICATION:
                </span>
                {activeItem.usage}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-[#AAA69B]/15">
              {activeItem.id === 'meds' ? (
                <button
                  onClick={handleUse}
                  disabled={count <= 0 || health >= 100}
                  className={`w-full py-2.5 font-cinzel text-xs font-bold uppercase tracking-[0.2em] transition ${
                    count > 0 && health < 100
                      ? 'df-btn-gold cursor-pointer'
                      : 'opacity-40 border border-white/10 cursor-not-allowed text-white/50'
                  }`}
                >
                  {health >= 100 ? 'Health Already Maximum' : count > 0 ? 'Administer Stasis Compound' : 'Depleted'}
                </button>
              ) : (
                <div className="text-center font-cinzel text-[10px] text-[#AAA69B]/60 uppercase tracking-widest py-2">
                  Automatic Context Interaction in Sector
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#AAA69B]/15 flex items-center justify-between text-[10px] font-cinzel text-[#AAA69B]/70 uppercase tracking-widest">
          <span>Current Health: {health}/100</span>
          <span>Press [ESC] or [I] to dismiss</span>
        </div>
      </div>
    </div>
  )
}
