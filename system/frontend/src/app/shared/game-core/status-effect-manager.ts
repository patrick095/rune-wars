import { RunicEffect, RunicEffectType } from './runic-effect-system';

export interface TickResult {
  newHp: number;
  removed: RunicEffectType[];
}

export class StatusEffectManager {
  private _effects = new Map<string, RunicEffect[]>();

  /**
   * Aplica um efeito a um jogador.
   * Se o jogador já tiver um efeito do mesmo tipo, ele é substituído.
   */
  apply(playerId: string, effect: RunicEffect): void {
    const playerEffects = this._effects.get(playerId) ?? [];
    const existingIndex = playerEffects.findIndex(e => e.type === effect.type);

    if (existingIndex !== -1) {
      playerEffects[existingIndex] = { ...effect };
    } else {
      playerEffects.push({ ...effect });
    }

    this._effects.set(playerId, playerEffects);
  }

  /**
   * Processa um turno para um jogador:
   * - Aplica dano de BLEED (Math.floor(maxHp * value))
   * - Decrementa duration de todos os efeitos com duration > 0
   * - Remove efeitos com duration === 0 (incluindo RANDOM_TELEPORT que já nasce com 0)
   * Retorna o novo HP e a lista de tipos removidos neste tick.
   */
  tick(playerId: string, currentHp: number, maxHp: number): TickResult {
    const playerEffects = this._effects.get(playerId);

    if (!playerEffects || playerEffects.length === 0) {
      return { newHp: currentHp, removed: [] };
    }

    let newHp = currentHp;
    const removed: RunicEffectType[] = [];

    // Aplica BLEED antes de decrementar/remover
    for (const effect of playerEffects) {
      if (effect.type === 'BLEED' && effect.value !== undefined) {
        const bleedDamage = Math.floor(maxHp * effect.value);
        newHp = Math.max(0, newHp - bleedDamage);
      }
    }

    // Decrementa duration dos efeitos com duration > 0
    for (const effect of playerEffects) {
      if (effect.duration > 0) {
        effect.duration -= 1;
      }
    }

    // Remove efeitos com duration === 0
    const remaining: RunicEffect[] = [];
    for (const effect of playerEffects) {
      if (effect.duration === 0) {
        removed.push(effect.type);
      } else {
        remaining.push(effect);
      }
    }

    if (remaining.length === 0) {
      this._effects.delete(playerId);
    } else {
      this._effects.set(playerId, remaining);
    }

    return { newHp, removed };
  }

  /**
   * Verifica se um jogador possui um efeito ativo de determinado tipo.
   */
  hasEffect(playerId: string, type: RunicEffectType): boolean {
    const playerEffects = this._effects.get(playerId);
    if (!playerEffects) return false;
    return playerEffects.some(e => e.type === type);
  }

  /**
   * Retorna cópia dos efeitos ativos de um jogador.
   */
  getEffects(playerId: string): RunicEffect[] {
    const playerEffects = this._effects.get(playerId);
    if (!playerEffects) return [];
    return playerEffects.map(e => ({ ...e }));
  }

  /**
   * Remove todos os efeitos de um jogador específico.
   */
  clear(playerId: string): void {
    this._effects.delete(playerId);
  }

  /**
   * Remove todos os efeitos de todos os jogadores.
   */
  clearAll(): void {
    this._effects.clear();
  }
}
