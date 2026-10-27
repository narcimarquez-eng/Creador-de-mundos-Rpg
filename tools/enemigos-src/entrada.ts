// API pública del módulo de enemigos (editor «Enemigo-rpg»). Lo usa el juego a través de js/enemigos.js.
export { buildProceduralEnemy, updateEnemyAnimation, updateEnemyMaterialsInPlace } from './three/enemyBuilder';
export type { BuiltEnemyRig } from './three/enemyBuilder';
export { createProceduralTextureSet } from './three/proceduralTextures';
export {
  ARCHETYPE_PRESETS,
  MATERIAL_PRESETS,
  RACE_CATEGORY_LABELS,
  calculateThreatScore,
  getEffectiveMeshDensity,
  getEffectiveTexturePattern,
} from './types/enemy';
export type { EnemyConfig, ArchetypeId, AnimationState } from './types/enemy';
