import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { UpgradeAttempt } from './upgrade-attempt.entity';
import { ItemInstance } from '../inventory/item-instance.entity';
import { CharacterService } from '../character/character.service';
import { Character } from '../character/character.entity';

// Legacy table (kept for backwards-compat with existing `attempt` method)
const UPGRADE_CHANCES = [0, 0.80, 0.75, 0.70, 0.60, 0.50, 0.40, 0.30, 0.20, 0.15, 0.10];

export type UpgradeTarget = 'item' | 'stone';

export interface UpgradeBonusHooks {
  race?: number;
  event?: number;
  guild?: number;
}

interface UpgradeRule {
  targetLevel: number;
  baseChance: number;
  goldCost: number;
  requiredStoneLevel: number;
}

// §10.2.4 — Stone upgrade rules keyed by current upgrade_level.
export const STONE_UPGRADE_RULES: Record<number, UpgradeRule> = {
  0: { targetLevel: 1, baseChance: 0.80, goldCost: 1000, requiredStoneLevel: 0 },
  1: { targetLevel: 2, baseChance: 0.65, goldCost: 2000, requiredStoneLevel: 1 },
  2: { targetLevel: 3, baseChance: 0.50, goldCost: 4000, requiredStoneLevel: 2 },
  3: { targetLevel: 4, baseChance: 0.35, goldCost: 8000, requiredStoneLevel: 3 },
  4: { targetLevel: 5, baseChance: 0.20, goldCost: 10000, requiredStoneLevel: 4 },
};

// §10.2.4 — Item upgrade rules keyed by current upgrade_level.
export const ITEM_UPGRADE_RULES: Record<number, UpgradeRule> = {
  0: { targetLevel: 1, baseChance: 0.80, goldCost: 1000, requiredStoneLevel: 0 },
  1: { targetLevel: 2, baseChance: 0.70, goldCost: 2000, requiredStoneLevel: 1 },
  2: { targetLevel: 3, baseChance: 0.60, goldCost: 4000, requiredStoneLevel: 2 },
  3: { targetLevel: 4, baseChance: 0.50, goldCost: 8000, requiredStoneLevel: 3 },
  4: { targetLevel: 5, baseChance: 0.40, goldCost: 16000, requiredStoneLevel: 4 },
  5: { targetLevel: 6, baseChance: 0.30, goldCost: 32000, requiredStoneLevel: 5 },
  6: { targetLevel: 7, baseChance: 0.25, goldCost: 65000, requiredStoneLevel: 5 },
  7: { targetLevel: 8, baseChance: 0.20, goldCost: 130000, requiredStoneLevel: 5 },
  8: { targetLevel: 9, baseChance: 0.15, goldCost: 250000, requiredStoneLevel: 5 },
  9: { targetLevel: 10, baseChance: 0.10, goldCost: 500000, requiredStoneLevel: 5 },
};

export function luckToUpgradeBonus(luck = 0): number {
  return Math.max(0, luck) * 0.005;
}

/** §5.1 — chance with luck bonus + additive hooks, clamped to 100%.
 *  Returns 0 when base is 0 — luck amplifies stone chance, it does not create it. */
export function computeChance(base: number, luck = 0, bonuses: UpgradeBonusHooks = {}): number {
  if (base <= 0) return 0;
  const hookBonus = (bonuses.race ?? 0) + (bonuses.event ?? 0) + (bonuses.guild ?? 0);
  const chance = base + luckToUpgradeBonus(luck) + hookBonus;
  return Math.round(Math.min(1, Math.max(0, chance)) * 10000) / 10000;
}

/** Stone power grows exponentially: +0=1, +1=2, +2=4, +3=8, +4=16, +5=32. */
export function stonePower(level: number): number {
  return Math.pow(2, Math.max(0, level));
}

/**
 * §10.2.5 — Computes stone-adjusted base chance.
 * 3 stones at requiredStoneLevel → exactly baseChance (the table maximum).
 * Fewer/weaker stones → proportionally less.
 * Better/more stones → can exceed baseChance up to 1.0 (100%).
 */
export function computeChanceFromStones(
  baseChance: number,
  requiredStoneLevel: number,
  stoneLevels: number[],
): number {
  if (stoneLevels.length === 0) return 0;
  const refPower = 3 * stonePower(requiredStoneLevel);
  const totalPower = stoneLevels.reduce((sum, lvl) => sum + stonePower(lvl), 0);
  return Math.min(1, baseChance * (totalPower / refPower));
}

@Injectable()
export class UpgradeService {
  constructor(
    @InjectRepository(UpgradeAttempt) private repo: Repository<UpgradeAttempt>,
    @InjectRepository(ItemInstance) private itemRepo: Repository<ItemInstance>,
    private charService: CharacterService,
    private dataSource: DataSource,
  ) {}

  // ─── Legacy API (kept for backwards compatibility) ───────────────────────

  getChance(currentLevel: number, luckStat = 0): number {
    const base = UPGRADE_CHANCES[currentLevel] ?? 0.05;
    return Math.min(0.95, base + luckStat * 0.001);
  }

  async attempt(characterId: string, itemInstanceId: string, currentLevel: number, luckStat = 0): Promise<UpgradeAttempt> {
    if (currentLevel >= 10) {
      return this.repo.save(this.repo.create({
        character_id: characterId,
        item_instance_id: itemInstanceId,
        from_level: currentLevel,
        success: false,
        to_level: currentLevel,
      }));
    }

    const chance = this.getChance(currentLevel, luckStat);
    const success = Math.random() < chance;

    return this.repo.save(this.repo.create({
      character_id: characterId,
      item_instance_id: itemInstanceId,
      from_level: currentLevel,
      success,
      to_level: success ? currentLevel + 1 : currentLevel,
    }));
  }

  async getHistory(characterId: string): Promise<UpgradeAttempt[]> {
    return this.repo.find({ where: { character_id: characterId }, order: { created_at: 'DESC' }, take: 50 });
  }

  // ─── New API ─────────────────────────────────────────────────────────────

  /** §5.5 — Return chance info for UI display */
  getChanceInfo(
    target: UpgradeTarget,
    level: number,
    luck = 0,
    bonuses: UpgradeBonusHooks = {},
    stoneLevels: number[] = [],
  ): {
    target: UpgradeTarget;
    level: number;
    targetLevel: number;
    chanceFinal: number;
    baseChance: number;
    luckBonus: number;
    bonuses: UpgradeBonusHooks;
    goldCost: number;
    requiredStoneLevel: number;
  } {
    const rule = this.getRule(target, level);
    const stoneBase = computeChanceFromStones(rule.baseChance, rule.requiredStoneLevel, stoneLevels);
    return {
      target,
      level,
      targetLevel: rule.targetLevel,
      chanceFinal: computeChance(stoneBase, luck, bonuses),
      baseChance: rule.baseChance,
      luckBonus: luckToUpgradeBonus(luck),
      bonuses,
      goldCost: rule.goldCost,
      requiredStoneLevel: rule.requiredStoneLevel,
    };
  }

  /** §5.3 — POST /upgrade/item */
  async upgradeItem(dto: {
    characterId: string;
    itemInstanceId: string;
    stoneInstanceIds: string[];
    luck?: number;
  }): Promise<{ success: boolean; newLevel: number; goldSpent: number }> {
    const { characterId, itemInstanceId, stoneInstanceIds, luck = 0 } = dto;

    return this.dataSource.transaction(async (manager) => {
      const itemRepo = manager.getRepository(ItemInstance);
      const characterRepo = manager.getRepository(Character);

      const item = await itemRepo.findOne({ where: { id: itemInstanceId, owner_id: characterId } });
      if (!item) throw new BadRequestException('Item não encontrado ou não pertence ao personagem');
      if (item.upgrade_level >= 10) throw new BadRequestException('Item já está no nível máximo (+10)');

      if (!stoneInstanceIds || stoneInstanceIds.length < 1 || stoneInstanceIds.length > 3) {
        throw new BadRequestException('Use entre 1 e 3 pedras de aprimoramento');
      }
      this.assertDistinctIds(stoneInstanceIds);

      const stones = await itemRepo.find({
        where: {
          id: In(stoneInstanceIds),
          owner_id: characterId,
          item_base_id: 'enhancement_stone',
        },
      });
      if (stones.length !== stoneInstanceIds.length) {
        throw new BadRequestException('Pedra não encontrada, não pertence ao personagem ou não é enhancement_stone');
      }

      const rule = this.getRule('item', item.upgrade_level);
      const character = await characterRepo.findOne({ where: { id: characterId } });
      if (!character) throw new BadRequestException('Personagem não encontrado');
      if (character.gold < rule.goldCost) throw new BadRequestException('Saldo de ouro insuficiente');
      character.gold -= rule.goldCost;
      await characterRepo.save(character);

      const stoneLevels = stones.map(s => s.upgrade_level);
      const stoneBase = computeChanceFromStones(rule.baseChance, rule.requiredStoneLevel, stoneLevels);
      const chance = computeChance(stoneBase, luck);
      const success = Math.random() < chance;

      await itemRepo.remove(stones);

      if (success) {
        item.upgrade_level = rule.targetLevel;
        await itemRepo.save(item);
      }

      return { success, newLevel: item.upgrade_level, goldSpent: rule.goldCost };
    });
  }

  /** §5.4 — POST /upgrade/stone */
  async upgradeStone(dto: {
    characterId: string;
    stoneInstanceIds: string[];
    luck?: number;
  }): Promise<{ success: boolean; newStoneLevel: number; goldSpent: number }> {
    const { characterId, stoneInstanceIds, luck = 0 } = dto;

    return this.dataSource.transaction(async (manager) => {
      const itemRepo = manager.getRepository(ItemInstance);
      const characterRepo = manager.getRepository(Character);

      if (!stoneInstanceIds || stoneInstanceIds.length < 1 || stoneInstanceIds.length > 3) {
        throw new BadRequestException('Use entre 1 e 3 pedras de aprimoramento');
      }
      this.assertDistinctIds(stoneInstanceIds);

      const stones = await itemRepo.find({
        where: {
          id: In(stoneInstanceIds),
          owner_id: characterId,
          item_base_id: 'enhancement_stone',
        },
      });
      if (stones.length !== stoneInstanceIds.length) {
        throw new BadRequestException('Pedra não encontrada, não pertence ao personagem ou não é enhancement_stone');
      }

      // Rule determined by the minimum stone level among the selected stones
      const minStoneLevel = Math.min(...stones.map(s => s.upgrade_level));
      if (minStoneLevel >= 5) throw new BadRequestException('Pedra já está no nível máximo (+5)');
      const rule = this.getRule('stone', minStoneLevel);

      const character = await characterRepo.findOne({ where: { id: characterId } });
      if (!character) throw new BadRequestException('Personagem não encontrado');
      if (character.gold < rule.goldCost) throw new BadRequestException('Saldo de ouro insuficiente');
      character.gold -= rule.goldCost;
      await characterRepo.save(character);

      const stoneLevels = stones.map(s => s.upgrade_level);
      const stoneBase = computeChanceFromStones(rule.baseChance, rule.requiredStoneLevel, stoneLevels);
      const chance = computeChance(stoneBase, luck);
      const success = Math.random() < chance;

      await itemRepo.remove(stones);

      if (success) {
        const newStone = itemRepo.create({
          owner_id: characterId,
          item_base_id: 'enhancement_stone',
          rarity: 'common',
          upgrade_level: rule.targetLevel,
        });
        await itemRepo.save(newStone);
      }

      return { success, newStoneLevel: success ? rule.targetLevel : minStoneLevel, goldSpent: rule.goldCost };
    });
  }

  private getRule(target: UpgradeTarget, level: number): UpgradeRule {
    const rules = target === 'stone' ? STONE_UPGRADE_RULES : ITEM_UPGRADE_RULES;
    const rule = rules[level];
    if (!rule) {
      throw new BadRequestException(
        target === 'stone'
          ? 'Pedra já está no nível máximo (+5)'
          : 'Item já está no nível máximo (+10)',
      );
    }
    return rule;
  }

  private assertDistinctIds(ids: string[]): void {
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('As 3 pedras devem ser instâncias diferentes');
    }
  }
}
