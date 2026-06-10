import Phaser from 'phaser';
import {
  RUNE_WARS_RENDER_ORDER,
  RuneWarsAnimationState,
  RuneWarsCharacterId,
  RuneWarsCharacterLayer,
  runeWarsCharacterLayerKey,
} from '../assets/rune-wars-assets';

export type Race = RuneWarsCharacterId;
export type CharacterLayer = RuneWarsCharacterLayer;

export interface LayerConfig {
  depth: number;
  offsetX: number;
  offsetY: number;
  displayWidth: number;
  displayHeight: number;
}

const CHARACTER_W = 58;
const CHARACTER_H = 72;
const ITEM_W = 34;
const ITEM_H = 34;

const LAYER_CONFIGS: Record<CharacterLayer, LayerConfig> = {
  back:   { depth: 0, offsetX: -28, offsetY: 2, displayWidth: ITEM_W, displayHeight: ITEM_H },
  base:   { depth: 1, offsetX: 0, offsetY: 0, displayWidth: CHARACTER_W, displayHeight: CHARACTER_H },
  armor:  { depth: 2, offsetX: 0, offsetY: 0, displayWidth: CHARACTER_W, displayHeight: CHARACTER_H },
  face:   { depth: 3, offsetX: 0, offsetY: 0, displayWidth: CHARACTER_W, displayHeight: CHARACTER_H },
  hair:   { depth: 4, offsetX: 0, offsetY: 0, displayWidth: CHARACTER_W, displayHeight: CHARACTER_H },
  helmet: { depth: 5, offsetX: 0, offsetY: 0, displayWidth: CHARACTER_W, displayHeight: CHARACTER_H },
  weapon: { depth: 6, offsetX: 32, offsetY: 2, displayWidth: ITEM_W, displayHeight: ITEM_H },
  effect: { depth: 7, offsetX: 0, offsetY: 0, displayWidth: CHARACTER_W, displayHeight: CHARACTER_H },
};

const OPTIONAL_LAYER_ALPHA = 1;

export class CharacterSprite {
  readonly container: Phaser.GameObjects.Container;

  get base(): Phaser.GameObjects.Sprite | undefined {
    return this._layers.get('base');
  }

  private readonly _scene: Phaser.Scene;
  private readonly _race: Race;
  private readonly _layers = new Map<CharacterLayer, Phaser.GameObjects.Sprite>();
  private _state: RuneWarsAnimationState = 'battle';
  private _flipX = false;

  private constructor(scene: Phaser.Scene, race: Race, x: number, y: number) {
    this._scene = scene;
    this._race = race;
    this.container = scene.add.container(x, y);
  }

  static create(scene: Phaser.Scene, race: Race, x: number, y: number): CharacterSprite {
    const character = new CharacterSprite(scene, race, x, y);
    character.createCharacterLayers('battle');
    return character;
  }

  setState(state: RuneWarsAnimationState): void {
    this._state = state;
    for (const layer of RUNE_WARS_RENDER_ORDER) {
      const sprite = this._layers.get(layer);
      const nextKey = runeWarsCharacterLayerKey(this._race, layer, state);
      if (sprite && this._scene.textures.exists(nextKey)) {
        sprite.setTexture(nextKey);
      }
    }
  }

  equip(layer: CharacterLayer, textureKey: string): void {
    this.setLayerTexture(layer, textureKey, OPTIONAL_LAYER_ALPHA);
  }

  unequip(layer: CharacterLayer): void {
    if (layer === 'base') return;
    const fallback = runeWarsCharacterLayerKey(this._race, layer, this._state);
    this.setLayerTexture(layer, fallback, OPTIONAL_LAYER_ALPHA);
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  setAlpha(alpha: number): void {
    this.container.setAlpha(alpha);
  }

  setFlipX(flipX: boolean): void {
    this._flipX = flipX;
    this.container.setScale(flipX ? -1 : 1, 1);
  }

  destroy(): void {
    this.container.destroy(true);
    this._layers.clear();
  }

  private createCharacterLayers(state: RuneWarsAnimationState): void {
    this._state = state;
    for (const layer of RUNE_WARS_RENDER_ORDER) {
      const textureKey = runeWarsCharacterLayerKey(this._race, layer, state);
      this.createLayer(layer, textureKey);
    }
    this.setFlipX(this._flipX);
  }

  private createLayer(layer: CharacterLayer, textureKey: string): void {
    const cfg = LAYER_CONFIGS[layer];
    const sprite = this._scene.add.sprite(cfg.offsetX, cfg.offsetY, textureKey);
    sprite
      .setDisplaySize(cfg.displayWidth, cfg.displayHeight)
      .setDepth(cfg.depth)
      .setAlpha(layer === 'base' ? 1 : OPTIONAL_LAYER_ALPHA);

    this._layers.set(layer, sprite);
    this.container.add(sprite);
  }

  private setLayerTexture(layer: CharacterLayer, textureKey: string, alpha: number): void {
    if (!this._scene.textures.exists(textureKey)) {
      const sprite = this._layers.get(layer);
      if (sprite && layer !== 'base') sprite.setVisible(false);
      return;
    }

    let sprite = this._layers.get(layer);
    if (!sprite) {
      this.createLayer(layer, textureKey);
      sprite = this._layers.get(layer);
    } else {
      sprite.setTexture(textureKey).setVisible(true);
    }

    const cfg = LAYER_CONFIGS[layer];
    sprite
      ?.setPosition(cfg.offsetX, cfg.offsetY)
      .setDisplaySize(cfg.displayWidth, cfg.displayHeight)
      .setAlpha(alpha)
      .setDepth(cfg.depth);
  }
}
