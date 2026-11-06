import { Canvas } from '@react-three/fiber'
import { Island } from './Island'
import { EnemyMesh, SurvivorMesh } from './Actors'
import { FollowCam } from './FollowCam'
import type { GameState, Settings } from '../game/types'

export function GameView({
  state,
  localId,
  lookX,
  lookY,
  settings,
}: {
  state: GameState
  localId: string
  lookX: number
  lookY: number
  settings: Settings
}) {
  const me = state.players.find((p) => p.id === localId) ?? state.players[0]
  const dpr = settings.quality === 'low' ? 1 : settings.quality === 'medium' ? 1.25 : 1.6
  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: settings.fov, near: 0.1, far: 90, position: [0, 5, 8] }}
      gl={{ antialias: settings.quality === 'high', powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Island state={state} quality={settings.quality} />
      {state.players.map((p, i) => (
        <SurvivorMesh key={p.id} player={p} local={p.id === me.id} slot={i} />
      ))}
      {state.enemies.map((e) => (
        <EnemyMesh key={e.id} enemy={e} />
      ))}
      {me ? <FollowCam player={me} lookX={lookX} lookY={lookY} fov={settings.fov} /> : null}
    </Canvas>
  )
}
