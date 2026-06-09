import Phaser from 'phaser';
import { MapModifier, MapModifierType, ProjectileState } from './map-modifier';

// World dimensions: 450 cols × 8px = 3600px wide, 160 rows × 8px = 1280px tall
const WORLD_WIDTH = 3600;
const WORLD_HEIGHT = 1280;
const ACTIVATION_RADIUS = 20;
const DEFAULT_ROUNDS_LEFT = 3;
const UPPER_HALF_Y = WORLD_HEIGHT / 2; // modificadores apenas acima da metade

/** Cores por tipo de modificador */
const TYPE_COLORS: Record<MapModifierType, number> = {
  damage_boost:     0xff6600,
  excavation_boost: 0x996633,
  freeze:           0x44aaff,
  poison:           0x44ff44,
  burn:             0xff3300,
  vulnerability:    0xaa00ff,
  critical:         0xffdd00,
};

const ALL_TYPES: MapModifierType[] = [
  'damage_boost',
  'excavation_boost',
  'freeze',
  'poison',
  'burn',
  'vulnerability',
  'critical',
];

let nextId = 0;

export class MapModifierManager {
  private modifiers: MapModifier[] = [];
  private tweens: Phaser.Tweens.Tween[] = [];

  /**
   * Tenta spawnar 1–2 novos modificadores em posições aleatórias na metade
   * superior do mapa que não estejam sobre terreno sólido.
   */
  trySpawn(scene: Phaser.Scene, terrainChecker: (x: number, y: number) => boolean): void {
    const count = Math.random() < 0.5 ? 1 : 2;

    for (let i = 0; i < count; i++) {
      const modifier = this.tryCreateModifier(scene, terrainChecker);
      if (modifier) {
        this.modifiers.push(modifier);
        this.addPulseTween(scene, modifier);
      }
    }
  }

  private tryCreateModifier(
    scene: Phaser.Scene,
    terrainChecker: (x: number, y: number) => boolean
  ): MapModifier | null {
    const MAX_ATTEMPTS = 20;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const x = ACTIVATION_RADIUS + Math.random() * (WORLD_WIDTH - ACTIVATION_RADIUS * 2);
      const y = ACTIVATION_RADIUS + Math.random() * (UPPER_HALF_Y - ACTIVATION_RADIUS * 2);

      let isSolid = false;
      try {
        isSolid = terrainChecker(x, y);
      } catch {
        // terrainChecker pode lançar se o ponto for inválido — ignorar e tentar novamente
        continue;
      }

      if (isSolid) continue;

      const type = ALL_TYPES[Math.floor(Math.random() * ALL_TYPES.length)];
      const sprite = this.createSprite(scene, x, y, type);

      return {
        id: `map_mod_${nextId++}`,
        type,
        worldX: x,
        worldY: y,
        radius: ACTIVATION_RADIUS,
        roundsLeft: DEFAULT_ROUNDS_LEFT,
        sprite,
      };
    }

    return null;
  }

  private createSprite(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: MapModifierType
  ): Phaser.GameObjects.Graphics {
    const color = TYPE_COLORS[type];
    const graphics = scene.add.graphics();
    graphics.setDepth(6);

    // Círculo preenchido com borda
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.fillStyle(color, 0.85);
    graphics.fillCircle(0, 0, ACTIVATION_RADIUS);
    graphics.strokeCircle(0, 0, ACTIVATION_RADIUS);

    // Símbolo central — pequeno círculo branco
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(0, 0, 4);

    graphics.setPosition(x, y);

    return graphics;
  }

  private addPulseTween(scene: Phaser.Scene, modifier: MapModifier): void {
    const tween = scene.tweens.add({
      targets: modifier.sprite,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.tweens.push(tween);
  }

  /**
   * Verifica se o projétil na posição (x, y) colide com algum modificador.
   * O projétil ATRAVESSA o modificador — a colisão não bloqueia o movimento.
   * Retorna o modificador ativado ou null.
   */
  checkProjectileCollision(x: number, y: number): MapModifier | null {
    for (const modifier of this.modifiers) {
      const dx = x - modifier.worldX;
      const dy = y - modifier.worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= modifier.radius) {
        return modifier;
      }
    }
    return null;
  }

  /**
   * Aplica o efeito do modificador ao estado do projétil.
   * Após ativação, remove o modificador da lista.
   */
  applyEffect(modifier: MapModifier, projectileState: ProjectileState): void {
    console.log(`[MAP_MOD] type=${modifier.type} activated at (${Math.round(modifier.worldX)},${Math.round(modifier.worldY)})`);

    switch (modifier.type) {
      case 'damage_boost':
        projectileState.baseDamage *= 1.5;
        break;

      case 'excavation_boost':
        projectileState.excavationRadius *= 1.5;
        break;

      case 'freeze':
        projectileState.applyStatus('frozen', 1);
        break;

      case 'poison':
        projectileState.applyStatus('poison', 2);
        break;

      case 'burn':
        projectileState.applyStatus('burn', 1);
        break;

      case 'vulnerability':
        projectileState.applyStatus('vulnerability', 1);
        break;

      case 'critical':
        projectileState.isCritical = true;
        break;
    }

    this.removeModifier(modifier);
  }

  /**
   * Chamado ao final de cada rodada geral.
   * Decrementa roundsLeft e remove modificadores expirados.
   */
  onRoundEnd(): void {
    const expired: MapModifier[] = [];

    for (const modifier of this.modifiers) {
      modifier.roundsLeft -= 1;
      if (modifier.roundsLeft <= 0) {
        expired.push(modifier);
      }
    }

    for (const modifier of expired) {
      this.removeModifier(modifier);
    }
  }

  private removeModifier(modifier: MapModifier): void {
    const index = this.modifiers.indexOf(modifier);
    if (index === -1) return;

    this.modifiers.splice(index, 1);

    try {
      modifier.sprite.destroy();
    } catch {
      // Sprite pode já ter sido destruído
    }
  }

  /**
   * Cleanup completo — destroi todos os modificadores e tweens.
   */
  destroy(): void {
    for (const tween of this.tweens) {
      try {
        tween.stop();
        tween.destroy();
      } catch {
        // Ignorar erros de cleanup
      }
    }
    this.tweens = [];

    for (const modifier of [...this.modifiers]) {
      this.removeModifier(modifier);
    }
    this.modifiers = [];
  }

  /** Retorna cópia da lista atual de modificadores (para debug/integração). */
  getAll(): readonly MapModifier[] {
    return this.modifiers;
  }
}
