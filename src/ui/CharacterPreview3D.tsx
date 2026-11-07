import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group } from 'three'

export type SurvivorArchetype = {
  id: string
  name: string
  title: string
  spec: string
  role: 'vanguard' | 'medic' | 'engineer' | 'recon'
  lore: string
  perk: string
  equipment: string[]
  unlocked: boolean
  accentColor: string
}

export const SURVIVORS: SurvivorArchetype[] = [
  {
    id: 'valerius',
    name: 'VALERIUS VANE',
    title: 'THE VANGUARD',
    spec: 'Frontline Hazard Absorption & Kinetic Barrier',
    role: 'vanguard',
    lore: 'Former security chief of Research Sector 04. Equipped with a reinforced titanium exoskeleton, Valerius absorbs heavy blunt impacts from Stalker ambushes and anchors the extraction perimeter.',
    perk: '+30% Damage resistance · Sprint momentum persists longer',
    equipment: ['Titanium Exosuit', 'Kinetic Heavy Shield', 'Composite Rig'],
    unlocked: true,
    accentColor: '#C59B61',
  },
  {
    id: 'seraphina',
    name: 'SERAPHINA CROSS',
    title: 'THE FIELD MEDIC',
    spec: 'Nano-Stasis Revival & Rapid Biochemical Triage',
    role: 'medic',
    lore: 'Senior biological researcher who synthesized the facility’s stasis compounds. Seraphina can stabilize downed teammates in half the standard time and extend survivability during squalls.',
    perk: 'Downed teammate revive speed doubled · +40% Medkit yield',
    equipment: ['Nano-Stasis Injector', 'Field Triage Rig', 'Sterile Visor'],
    unlocked: true,
    accentColor: '#853D3D',
  },
  {
    id: 'korath',
    name: 'KORATH STEIN',
    title: 'THE CHIEF ENGINEER',
    spec: 'Auxiliary Power Routing & Rapid Overdrive',
    role: 'engineer',
    lore: 'The architect of the Stormfall Isle power grid. Stein understands the maintenance bunker’s generator relays intimately, cutting system restart times and scavenging duplicate scrap.',
    perk: 'Generator repair requires 25% less time · +1 Scrap on pickup',
    equipment: ['Overdrive Spark Rig', 'Voltaic Coil Backpack', 'Insulated Gauntlets'],
    unlocked: true,
    accentColor: '#AAA69B',
  },
  {
    id: 'lyra',
    name: 'LYRA NIGHTSHADE',
    title: 'THE RECON SCOUT',
    spec: 'Acoustic Camouflage & Evacuation Beacon Telemetry',
    role: 'recon',
    lore: 'A wilderness survival operative trained in island reconnaissance. Lyra maneuvers silently past patrolling biological stalkers, detecting resource clusters through dense coastal mist.',
    perk: 'Stalkers detect distance reduced by 35% · Increased sprinting speed',
    equipment: ['Acoustic Dampener Cloak', 'Dual Tactical Blades', 'Long-Range Beacon Rig'],
    unlocked: true,
    accentColor: '#788CA0',
  },
]

function CharacterMesh({ archetype }: { archetype: SurvivorArchetype }) {
  const groupRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!groupRef.current) return
    // Natural idle breathing & micro-sway
    groupRef.current.position.y = Math.sin(t * 1.8) * 0.02
    groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.03
  })

  const { role, accentColor } = archetype

  return (
    <group ref={groupRef} position={[0, -0.9, 0]}>
      {/* Ground Pedestal / Rune Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.9, 36]} />
        <meshStandardMaterial color="#202223" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.82, 0.88, 36]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.6} />
      </mesh>

      {/* Legs & Heavy Boots */}
      <mesh position={[-0.18, 0.45, 0]}>
        <cylinderGeometry args={[0.08, 0.11, 0.85, 8]} />
        <meshStandardMaterial color="#1a1c1d" roughness={0.7} />
      </mesh>
      <mesh position={[0.18, 0.45, 0]}>
        <cylinderGeometry args={[0.08, 0.11, 0.85, 8]} />
        <meshStandardMaterial color="#1a1c1d" roughness={0.7} />
      </mesh>
      {/* Boots */}
      <mesh position={[-0.18, 0.08, 0.06]}>
        <boxGeometry args={[0.16, 0.16, 0.28]} />
        <meshStandardMaterial color="#111213" roughness={0.6} />
      </mesh>
      <mesh position={[0.18, 0.08, 0.06]}>
        <boxGeometry args={[0.16, 0.16, 0.28]} />
        <meshStandardMaterial color="#111213" roughness={0.6} />
      </mesh>

      {/* Torso & Armored Cuirass */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.26, 0.22, 0.65, 8]} />
        <meshStandardMaterial color="#292A2B" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Chest Armor Plate with Accent trim */}
      <mesh position={[0, 1.25, 0.12]}>
        <boxGeometry args={[0.36, 0.38, 0.12]} />
        <meshStandardMaterial color="#202223" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.25, 0.18]}>
        <boxGeometry args={[0.18, 0.18, 0.02]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.4} />
      </mesh>

      {/* Head & Tactical Helmet / Cowl */}
      <mesh position={[0, 1.68, 0.02]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#e2d2c0" roughness={0.8} />
      </mesh>
      {/* Visor / Mask */}
      <mesh position={[0, 1.67, 0.12]}>
        <boxGeometry args={[0.22, 0.08, 0.12]} />
        <meshStandardMaterial color="#171819" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Shoulders / Pauldrons */}
      <mesh position={[-0.34, 1.38, 0]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshStandardMaterial color={role === 'vanguard' ? '#C59B61' : '#292A2B'} metalness={0.5} />
      </mesh>
      <mesh position={[0.34, 1.38, 0]}>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshStandardMaterial color={role === 'vanguard' ? '#C59B61' : '#292A2B'} metalness={0.5} />
      </mesh>

      {/* Arms & Tactical Bracers */}
      <mesh position={[-0.32, 1.05, 0.04]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.07, 0.08, 0.55, 8]} />
        <meshStandardMaterial color="#202223" roughness={0.6} />
      </mesh>
      <mesh position={[0.32, 1.05, 0.04]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.07, 0.08, 0.55, 8]} />
        <meshStandardMaterial color="#202223" roughness={0.6} />
      </mesh>

      {/* Backpack & Class Rig */}
      <mesh position={[0, 1.25, -0.22]}>
        <boxGeometry args={[0.42, 0.52, 0.22]} />
        <meshStandardMaterial color="#171819" roughness={0.7} />
      </mesh>

      {/* Role-Specific Equipment Gadgets */}
      {role === 'medic' && (
        <group position={[0.16, 1.3, -0.32]}>
          <cylinderGeometry args={[0.05, 0.05, 0.35, 8]} />
          <meshStandardMaterial color="#853D3D" emissive="#853D3D" emissiveIntensity={0.8} />
        </group>
      )}

      {role === 'engineer' && (
        <group position={[-0.14, 1.45, -0.3]}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshStandardMaterial color="#C59B61" emissive="#C59B61" emissiveIntensity={0.6} />
        </group>
      )}

      {role === 'recon' && (
        <group position={[0, 1.6, -0.26]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
          <meshStandardMaterial color="#AAA69B" metalness={0.8} />
        </group>
      )}
    </group>
  )
}

export function CharacterPreview3D({
  archetype,
  className = 'h-full w-full',
}: {
  archetype: SurvivorArchetype
  className?: string
}) {
  const [rotation, setRotation] = useState(0.2)
  const isDragging = useRef(false)
  const lastX = useRef(0)

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    lastX.current = e.clientX
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const delta = e.clientX - lastX.current
    lastX.current = e.clientX
    setRotation((r) => r + delta * 0.012)
  }

  const handlePointerUp = () => {
    isDragging.current = false
  }

  return (
    <div
      className={`relative select-none cursor-grab active:cursor-grabbing ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        camera={{ position: [0, 0.3, 2.8], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} color="#E8E4DC" />
        {/* Key Light: Warm Antique Gold */}
        <directionalLight position={[3, 4, 3]} intensity={1.5} color="#F5ECD9" />
        {/* Rim Light: Cool Silver Moonlight */}
        <directionalLight position={[-3, 2, -3]} intensity={2.2} color="#AAA69B" />
        {/* Fill from bottom */}
        <pointLight position={[0, -0.5, 1]} intensity={0.5} color="#C59B61" />

        <group rotation={[0, rotation, 0]}>
          <CharacterMesh archetype={archetype} />
        </group>
      </Canvas>

      {/* Touch / Mouse drag rotation hint */}
      <div className="pointer-events-none absolute bottom-3 inset-x-0 text-center font-cinzel text-[10px] tracking-[0.25em] text-[#AAA69B]/60 uppercase">
        Drag to Inspect 3D Rig
      </div>
    </div>
  )
}

