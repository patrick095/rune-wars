/**
 * Map Modifier — tipos e interface base
 *
 * Modificadores de mapa são objetos visuais que afetam projéteis ao colidirem.
 * O projétil ATRAVESSA o modificador (não é bloqueado), mas recebe o efeito.
 */

export type MapModifierType =
  | 'damage_boost'
  | 'excavation_boost'
  | 'freeze'
  | 'poison'
  | 'burn'
  | 'vulnerability'
  | 'critical';

export interface MapModifier {
  id: string;
  type: MapModifierType;
  worldX: number;
  worldY: number;
  radius: number;
  roundsLeft: number;
  sprite: Phaser.GameObjects.Graphics;
}

/**
 * Estado mínimo do projétil que os modificadores podem alterar.
 */
export interface ProjectileState {
  baseDamage: number;
  excavationRadius: number;
  isCritical: boolean;
  applyStatus: (status: string, duration: number) => void;
}
