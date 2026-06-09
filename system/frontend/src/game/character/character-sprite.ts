import Phaser from 'phaser';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Race = 'human' | 'dwarf' | 'elf';

export type EquipmentSlot =
  | 'base'
  | 'boots'
  | 'armor'
  | 'offhand'
  | 'weapon'
  | 'helmet'
  | 'necklace'
  | 'earring'
  | 'ring';

export interface SlotConfig {
  depth: number;
  offsetX: number;
  offsetY: number;
}

// ─── Slot depth order ─────────────────────────────────────────────────────────
// base (0) → boots (1) → armor (2) → offhand (3) → weapon (4)
//   → helmet (5) → necklace (6) → earring (7) → ring (8)

const SLOT_DEPTH: Record<EquipmentSlot, number> = {
  base:     0,
  boots:    1,
  armor:    2,
  offhand:  3,
  weapon:   4,
  helmet:   5,
  necklace: 6,
  earring:  7,
  ring:     8,
};

// ─── SLOT_CONFIGS ─────────────────────────────────────────────────────────────
// Placeholder offsets per race per slot.
// Values are relative to the container origin (centre of character).

export const SLOT_CONFIGS: Record<Race, Record<EquipmentSlot, SlotConfig>> = {
  human: {
    base:     { depth: SLOT_DEPTH.base,     offsetX:   0, offsetY:   0 },
    boots:    { depth: SLOT_DEPTH.boots,    offsetX:   0, offsetY:  20 },
    armor:    { depth: SLOT_DEPTH.armor,    offsetX:   0, offsetY:   0 },
    offhand:  { depth: SLOT_DEPTH.offhand,  offsetX: -16, offsetY:   4 },
    weapon:   { depth: SLOT_DEPTH.weapon,   offsetX:  16, offsetY:   4 },
    helmet:   { depth: SLOT_DEPTH.helmet,   offsetX:   0, offsetY: -22 },
    necklace: { depth: SLOT_DEPTH.necklace, offsetX:   0, offsetY:  -6 },
    earring:  { depth: SLOT_DEPTH.earring,  offsetX:  10, offsetY: -14 },
    ring:     { depth: SLOT_DEPTH.ring,     offsetX:  14, offsetY:  10 },
  },
  dwarf: {
    base:     { depth: SLOT_DEPTH.base,     offsetX:   0, offsetY:   0 },
    boots:    { depth: SLOT_DEPTH.boots,    offsetX:   0, offsetY:  16 },
    armor:    { depth: SLOT_DEPTH.armor,    offsetX:   0, offsetY:   0 },
    offhand:  { depth: SLOT_DEPTH.offhand,  offsetX: -14, offsetY:   6 },
    weapon:   { depth: SLOT_DEPTH.weapon,   offsetX:  14, offsetY:   6 },
    helmet:   { depth: SLOT_DEPTH.helmet,   offsetX:   0, offsetY: -18 },
    necklace: { depth: SLOT_DEPTH.necklace, offsetX:   0, offsetY:  -4 },
    earring:  { depth: SLOT_DEPTH.earring,  offsetX:   8, offsetY: -12 },
    ring:     { depth: SLOT_DEPTH.ring,     offsetX:  12, offsetY:   8 },
  },
  elf: {
    base:     { depth: SLOT_DEPTH.base,     offsetX:   0, offsetY:   0 },
    boots:    { depth: SLOT_DEPTH.boots,    offsetX:   0, offsetY:  22 },
    armor:    { depth: SLOT_DEPTH.armor,    offsetX:   0, offsetY:   0 },
    offhand:  { depth: SLOT_DEPTH.offhand,  offsetX: -18, offsetY:   4 },
    weapon:   { depth: SLOT_DEPTH.weapon,   offsetX:  18, offsetY:   4 },
    helmet:   { depth: SLOT_DEPTH.helmet,   offsetX:   0, offsetY: -26 },
    necklace: { depth: SLOT_DEPTH.necklace, offsetX:   0, offsetY:  -8 },
    earring:  { depth: SLOT_DEPTH.earring,  offsetX:  12, offsetY: -16 },
    ring:     { depth: SLOT_DEPTH.ring,     offsetX:  16, offsetY:  12 },
  },
};

// ─── Placeholder dimensions ───────────────────────────────────────────────────

const PLACEHOLDER_W = 40;
const PLACEHOLDER_H = 60;
const PLACEHOLDER_COLOR = 0x4488ff;

// ─── CharacterSprite ──────────────────────────────────────────────────────────

/**
 * Manages a layered character made of one Phaser.GameObjects.Container with
 * one child per equipment slot.  Each child is either a Sprite (when the atlas
 * is available) or a Rectangle placeholder.
 */
export class CharacterSprite {
  /** The root container positioned in the scene. */
  readonly container: Phaser.GameObjects.Container;

  /** Reference to the base layer sprite/placeholder (used by CharacterAnimator). */
  get base(): Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle | undefined {
    return this._layers.get('base');
  }

  private readonly _scene: Phaser.Scene;
  private readonly _race: Race;
  private readonly _layers = new Map<
    EquipmentSlot,
    Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle
  >();

  // ── Constructor ────────────────────────────────────────────────────────────

  private constructor(scene: Phaser.Scene, race: Race, x: number, y: number) {
    this._scene = scene;
    this._race = race;
    this.container = scene.add.container(x, y);
  }

  // ── Static factory ─────────────────────────────────────────────────────────

  /**
   * Creates and initialises a CharacterSprite.  The `base` slot is
   * always rendered (using a placeholder Rectangle when the atlas is absent).
   */
  static create(scene: Phaser.Scene, race: Race, x: number, y: number): CharacterSprite {
    const cs = new CharacterSprite(scene, race, x, y);
    cs._initBase();
    return cs;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Equip a slot with the given texture key.
   * If the texture is not loaded, a Rectangle placeholder is used instead.
   */
  equip(slot: EquipmentSlot, textureKey: string): void {
    // Remove existing layer for this slot first
    this._removeLayer(slot);

    const cfg = SLOT_CONFIGS[this._race][slot];
    const layer = this._buildLayer(slot, textureKey, cfg);
    this._layers.set(slot, layer);
    this.container.add(layer);
  }

  /**
   * Unequip a slot – removes the layer from the container entirely.
   * The `base` slot is never removed.
   */
  unequip(slot: EquipmentSlot): void {
    if (slot === 'base') return; // base is always present
    this._removeLayer(slot);
  }

  /** Move the container (and all layers) to world coordinates. */
  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  /** Destroy the container and all its children. */
  destroy(): void {
    this.container.destroy(true);
    this._layers.clear();
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _initBase(): void {
    const cfg = SLOT_CONFIGS[this._race].base;
    const atlasKey = `characters_${this._race}`;
    const layer = this._buildLayer('base', atlasKey, cfg);
    this._layers.set('base', layer);
    this.container.add(layer);
  }

  private _buildLayer(
    slot: EquipmentSlot,
    textureKey: string,
    cfg: SlotConfig
  ): Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle {
    const textureExists = this._scene.textures.exists(textureKey);

    if (textureExists) {
      // Try to use first frame of the atlas; fall back to placeholder on error
      try {
        const sprite = this._scene.add.sprite(cfg.offsetX, cfg.offsetY, textureKey);
        sprite.setDepth(cfg.depth);
        return sprite;
      } catch {
        console.warn(`[CharacterSprite] Failed to create sprite for slot "${slot}" with key "${textureKey}". Using placeholder.`);
      }
    }

    // Fallback placeholder
    const rect = this._scene.add.rectangle(
      cfg.offsetX,
      cfg.offsetY,
      PLACEHOLDER_W,
      PLACEHOLDER_H,
      PLACEHOLDER_COLOR,
      slot === 'base' ? 1 : 0.5
    );
    rect.setDepth(cfg.depth);
    return rect;
  }

  private _removeLayer(slot: EquipmentSlot): void {
    const existing = this._layers.get(slot);
    if (existing) {
      this.container.remove(existing, true);
      this._layers.delete(slot);
    }
  }
}
