import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterService } from '../character/character.service';
import { ItemInstance } from '../inventory/item-instance.entity';
import {
  DUNGEON_GOLD_BASE,
  DUNGEON_GOLD_MULTIPLIER,
  DungeonDifficulty,
  pickGoldAmount,
  pickItemBaseId,
  PortalMode,
  PVP_GOLD_AMOUNTS,
  RewardRarity,
  shuffle,
  STONE_LEVEL_BY_RARITY,
} from './portal-pools';

export type PortalKind = 'gold' | 'item' | 'stone';

export interface Portal {
  index: number;
  kind: PortalKind;
  amount?: number;
  itemBaseId?: string;
  rarity?: RewardRarity;
  stoneLevel?: number;
}

export interface GeneratePortalsOptions {
  mode: PortalMode;
  floor?: number;
  stage?: number;
  difficulty?: DungeonDifficulty;
  isBoss?: boolean;
}

export interface PortalContextOptions extends GeneratePortalsOptions {
  contextId: string;
  participantIds?: string[];
}

export interface PortalGain {
  portalIndex: number;
  kind: PortalKind;
  amount?: number;
  item?: ItemInstance;
  itemBaseId?: string;
  rarity?: RewardRarity;
  stoneLevel?: number;
}

export interface PortalSelectionResult {
  contextId: string;
  characterId: string;
  selectedIndices: number[];
  reveal: Portal[];
  gains: PortalGain[];
}

interface PortalContext {
  contextId: string;
  mode: PortalMode;
  isBoss: boolean;
  portals: Portal[];
  picksPerCharacter: number;
  participantIds: string[];
  selections: Map<string, number[]>;
}

@Injectable()
export class PortalService {
  private readonly contexts = new Map<string, PortalContext>();

  constructor(
    @InjectRepository(ItemInstance) private readonly itemRepo: Repository<ItemInstance>,
    private readonly characters: CharacterService,
  ) {}

  generatePortals(options: GeneratePortalsOptions): Portal[] {
    if (options.mode === 'pvp') return this.generatePvpPortals();
    return this.generateDungeonPortals(options.difficulty ?? 'easy', options.isBoss ?? false);
  }

  createContext(options: PortalContextOptions): PortalContext {
    const portals = this.generatePortals(options);
    return this.registerContext(options.contextId, portals, options);
  }

  registerContext(
    contextId: string,
    portals: Portal[],
    options: Pick<PortalContextOptions, 'mode' | 'isBoss' | 'participantIds'>,
  ): PortalContext {
    const context: PortalContext = {
      contextId,
      mode: options.mode,
      isBoss: options.isBoss ?? false,
      portals,
      picksPerCharacter: options.mode === 'dungeon' && options.isBoss ? 2 : 1,
      participantIds: options.participantIds ?? [],
      selections: new Map<string, number[]>(),
    };
    this.contexts.set(contextId, context);
    return context;
  }

  getContext(contextId: string): PortalContext | undefined {
    return this.contexts.get(contextId);
  }

  async select(
    contextId: string,
    characterId: string,
    portalIndices?: number[],
  ): Promise<PortalSelectionResult> {
    const context = this.contexts.get(contextId);
    if (!context) throw new BadRequestException('Contexto de portais não encontrado');
    if (context.participantIds.length > 0 && !context.participantIds.includes(characterId)) {
      throw new BadRequestException('Personagem não pertence ao contexto de portais');
    }
    if (context.selections.has(characterId)) {
      throw new BadRequestException('Personagem já selecionou portais neste contexto');
    }

    const selectedIndices = this.normalizeSelection(context, portalIndices);
    const selectedPortals = selectedIndices.map(index => context.portals[index]);
    const gains: PortalGain[] = [];

    for (const portal of selectedPortals) {
      gains.push(await this.grantPortal(characterId, portal));
    }

    context.selections.set(characterId, selectedIndices);

    return {
      contextId,
      characterId,
      selectedIndices,
      reveal: context.isBoss ? context.portals : selectedPortals,
      gains,
    };
  }

  private generateDungeonPortals(difficulty: DungeonDifficulty, isBoss: boolean): Portal[] {
    const itemSlots = this.getDungeonItemSlots(difficulty, isBoss);
    const total = isBoss ? 16 : 8;
    const goldCount = Math.max(0, total - itemSlots.length);
    const multiplier = DUNGEON_GOLD_MULTIPLIER[difficulty] ?? 1;
    const goldTable = isBoss ? DUNGEON_GOLD_BASE.boss : DUNGEON_GOLD_BASE.normal;

    const portals = [
      ...itemSlots.map(rarity => this.createItemOrStonePortal(rarity)),
      ...Array.from({ length: goldCount }, () => this.createGoldPortal(pickGoldAmount(goldTable, multiplier))),
    ];

    return this.indexPortals(shuffle(portals));
  }

  private generatePvpPortals(): Portal[] {
    const portals = Array.from({ length: 8 }, () => {
      const roll = Math.random();
      if (roll < 0.91) return this.createGoldPortal(pickGoldAmount(PVP_GOLD_AMOUNTS));
      if (roll < 0.96) return this.createItemOrStonePortal('common');
      if (roll < 0.99) return this.createItemOrStonePortal('uncommon');
      return this.createItemOrStonePortal('rare');
    });

    return this.indexPortals(portals);
  }

  private getDungeonItemSlots(difficulty: DungeonDifficulty, isBoss: boolean): RewardRarity[] {
    if (!isBoss) {
      switch (difficulty) {
        case 'easy': return [];
        case 'medium': return ['common', 'common'];
        case 'hard': return ['common', 'common', 'common', 'common', 'uncommon'];
        case 'heroic': return ['common', 'common', 'common', 'common', 'uncommon', 'uncommon', 'uncommon'];
      }
    }

    switch (difficulty) {
      case 'easy':
        return ['common', 'common', 'common', 'uncommon', 'uncommon'];
      case 'medium':
        return ['common', 'common', 'common', 'common', 'common', 'common', 'uncommon', 'uncommon', 'uncommon', 'rare'];
      case 'hard':
        return ['common', 'common', 'common', 'common', 'common', 'common', 'uncommon', 'uncommon', 'uncommon', 'uncommon', 'rare', 'rare'];
      case 'heroic':
        return ['common', 'common', 'common', 'common', 'uncommon', 'uncommon', 'uncommon', 'uncommon', 'rare', 'rare', 'rare', 'rare'];
    }
  }

  private createItemOrStonePortal(rarity: RewardRarity): Omit<Portal, 'index'> {
    if (Math.random() < 0.5) {
      return {
        kind: 'stone',
        rarity,
        stoneLevel: STONE_LEVEL_BY_RARITY[rarity],
      };
    }

    return {
      kind: 'item',
      rarity,
      itemBaseId: pickItemBaseId(rarity),
    };
  }

  private createGoldPortal(amount: number): Omit<Portal, 'index'> {
    return { kind: 'gold', amount };
  }

  private indexPortals(portals: Omit<Portal, 'index'>[]): Portal[] {
    return portals.map((portal, index) => ({ index, ...portal }));
  }

  private normalizeSelection(context: PortalContext, portalIndices?: number[]): number[] {
    const selectedIndices = portalIndices?.length
      ? portalIndices
      : this.autoPick(context);

    if (selectedIndices.length !== context.picksPerCharacter) {
      throw new BadRequestException(`Selecione exatamente ${context.picksPerCharacter} portal(is)`);
    }
    if (new Set(selectedIndices).size !== selectedIndices.length) {
      throw new BadRequestException('Não é permitido selecionar o mesmo portal duas vezes');
    }
    for (const index of selectedIndices) {
      if (!Number.isInteger(index) || index < 0 || index >= context.portals.length) {
        throw new BadRequestException('Índice de portal inválido');
      }
    }

    return selectedIndices;
  }

  private autoPick(context: PortalContext): number[] {
    const indices = shuffle(context.portals.map(portal => portal.index));
    return indices.slice(0, context.picksPerCharacter);
  }

  private async grantPortal(characterId: string, portal: Portal): Promise<PortalGain> {
    if (portal.kind === 'gold') {
      await this.characters.addGold(characterId, portal.amount ?? 0);
      return {
        portalIndex: portal.index,
        kind: 'gold',
        amount: portal.amount ?? 0,
      };
    }

    if (portal.kind === 'stone') {
      const item = await this.itemRepo.save(this.itemRepo.create({
        owner_id: characterId,
        item_base_id: 'enhancement_stone',
        rarity: 'common',
        upgrade_level: portal.stoneLevel ?? 0,
      }));
      return {
        portalIndex: portal.index,
        kind: 'stone',
        item,
        itemBaseId: 'enhancement_stone',
        stoneLevel: portal.stoneLevel ?? 0,
        rarity: portal.rarity,
      };
    }

    const item = await this.itemRepo.save(this.itemRepo.create({
      owner_id: characterId,
      item_base_id: portal.itemBaseId,
      rarity: portal.rarity ?? 'common',
      upgrade_level: 0,
    }));
    return {
      portalIndex: portal.index,
      kind: 'item',
      item,
      itemBaseId: portal.itemBaseId,
      rarity: portal.rarity,
    };
  }
}
