export type RunicEffectType =
  | 'BLEED'
  | 'FREEZE'
  | 'BLIND'
  | 'WEAK_SHOT'
  | 'ITEM_BLOCK'
  | 'RANDOM_TELEPORT'
  | 'VULNERABILITY';

export interface RunicEffect {
  type: RunicEffectType;
  duration: number; // turnos restantes (0 para efeitos instantâneos como RANDOM_TELEPORT)
  value?: number;   // ex: 0.05 para BLEED (5% HP)
}

const WEAPON_RUNIC_EFFECTS: Record<string, RunicEffect> = {
  cannon:    { type: 'VULNERABILITY',     duration: 2 },
  longbow:   { type: 'BLIND',             duration: 1 },
  tnt:       { type: 'RANDOM_TELEPORT',   duration: 0 },
  boomerang: { type: 'VULNERABILITY',     duration: 1 },
  'ice-book':{ type: 'FREEZE',            duration: 2 },
  potion:    { type: 'BLEED',             duration: 2, value: 0.05 },
};

/**
 * Rola a chance de ativar um efeito rúnico com base no atributo luck do jogador.
 * Fórmula: Math.min(0.05 + luck * 0.003, 0.75)
 * luck=0 → 5%, luck=100 → 35%, luck=233+ → 75% (cap)
 */
export function rollRunicEffect(luck: number): boolean {
  const chance = Math.min(0.05 + luck * 0.003, 0.75);
  return Math.random() < chance;
}

/**
 * Retorna o RunicEffect associado a uma arma, ou null se a arma não tiver efeito rúnico.
 * Retorna uma cópia do efeito para evitar mutação do mapa interno.
 */
export function getWeaponRunicEffect(weaponId: string): RunicEffect | null {
  const effect = WEAPON_RUNIC_EFFECTS[weaponId];
  if (!effect) return null;
  return { ...effect };
}
