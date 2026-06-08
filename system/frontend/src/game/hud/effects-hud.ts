import Phaser from 'phaser';
import { RunicEffect, RunicEffectType } from '../../app/shared/game-core/runic-effect-system';

/** Short display label for each effect type. */
const EFFECT_LABELS: Record<RunicEffectType, string> = {
  BLEED:            '💀 BLEED',
  FREEZE:           '❄ FREEZE',
  BLIND:            '🌫 BLIND',
  WEAK_SHOT:        '↓ WEAK',
  ITEM_BLOCK:       '🚫 IBLK',
  RANDOM_TELEPORT:  '⚡ TELE',
  VULNERABILITY:    '💢 VULN',
};

/** Text color (hex CSS) for each effect type. */
const EFFECT_COLORS: Record<RunicEffectType, string> = {
  BLEED:            '#ff4444',
  FREEZE:           '#44aaff',
  BLIND:            '#ffdd44',
  WEAK_SHOT:        '#ff8800',
  ITEM_BLOCK:       '#888888',
  RANDOM_TELEPORT:  '#cc44ff',
  VULNERABILITY:    '#ff88cc',
};

const DEPTH = 12;
const FONT_STYLE = { fontSize: '11px', fontFamily: 'monospace', stroke: '#000000', strokeThickness: 2 };

export class EffectsHud {
  private playerEffectTexts: Phaser.GameObjects.Text[] = [];
  private aiEffectTexts: Phaser.GameObjects.Text[] = [];

  private readonly playerX = 12;
  private readonly aiX: number;
  private readonly baseY = 80; // below the HP text line

  constructor(private scene: Phaser.Scene) {
    this.aiX = scene.scale.width - 12;
  }

  /**
   * Rebuilds the effects display for both sides.
   * Call this every frame (or whenever effects change) from BattleScene.update().
   */
  update(playerEffects: RunicEffect[], aiEffects: RunicEffect[]): void {
    this.renderSide(playerEffects, this.playerEffectTexts, this.playerX, 'left');
    this.renderSide(aiEffects, this.aiEffectTexts, this.aiX, 'right');
  }

  private renderSide(
    effects: RunicEffect[],
    pool: Phaser.GameObjects.Text[],
    baseX: number,
    side: 'left' | 'right'
  ): void {
    // Destroy old text objects and refill
    for (const t of pool) t.destroy();
    pool.length = 0;

    effects.forEach((effect, index) => {
      const label = EFFECT_LABELS[effect.type] ?? effect.type;
      const color = EFFECT_COLORS[effect.type] ?? '#ffffff';
      const displayText = effect.duration > 0
        ? `${label} ${effect.duration}`
        : label;

      const y = this.baseY + index * 16;
      const text = this.scene.add.text(baseX, y, displayText, {
        ...FONT_STYLE,
        color,
      })
        .setOrigin(side === 'right' ? 1 : 0, 0)
        .setDepth(DEPTH);

      pool.push(text);
    });
  }

  /** Clears all displayed effect texts from the scene. */
  destroy(): void {
    for (const t of this.playerEffectTexts) t.destroy();
    for (const t of this.aiEffectTexts) t.destroy();
    this.playerEffectTexts.length = 0;
    this.aiEffectTexts.length = 0;
  }
}
