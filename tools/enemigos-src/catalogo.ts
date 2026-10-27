// Catálogo de enemigos para el editor de mundos y el visor (sin Three): nombre, nivel, tipo y clave del arquetipo.
import { ARCHETYPE_PRESETS, RACE_CATEGORY_LABELS } from './types/enemy';

export const ENEMY_CATALOG = Object.entries(ARCHETYPE_PRESETS).map(([key, c]) => ({
  key,
  id: c.id,
  name: c.name,
  title: c.title,
  raceCategory: c.raceCategory,
  raceLabel: RACE_CATEGORY_LABELS[c.raceCategory],
  level: c.stats.level,
  tier: c.stats.tier,
  boss: c.stats.tier === 'Mini-Boss' || c.stats.tier === 'Raid Boss',
}));
