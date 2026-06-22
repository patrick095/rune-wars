import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CraftRecipe } from './craft-recipe.entity';
import { CraftAttempt } from './craft-attempt.entity';
import { ItemInstance } from '../inventory/item-instance.entity';

// ---------------------------------------------------------------------------
// Legado — seed de receitas
// ---------------------------------------------------------------------------
const SEED_RECIPES = [
  { result_item_base_id: 'sword_iron', result_rarity: 'common', materials: [{ itemBaseId: 'iron_ore', quantity: 3 }], base_craft_chance: 0.8 },
  { result_item_base_id: 'sword_steel', result_rarity: 'uncommon', materials: [{ itemBaseId: 'steel_bar', quantity: 3 }], base_craft_chance: 0.65 },
  { result_item_base_id: 'bow_wood', result_rarity: 'common', materials: [{ itemBaseId: 'hardwood', quantity: 2 }, { itemBaseId: 'fiber', quantity: 1 }], base_craft_chance: 0.8 },
  { result_item_base_id: 'staff_runic', result_rarity: 'rare', materials: [{ itemBaseId: 'rune_crystal', quantity: 2 }], base_craft_chance: 0.45 },
  { result_item_base_id: 'armor_leather', result_rarity: 'common', materials: [{ itemBaseId: 'leather', quantity: 4 }], base_craft_chance: 0.85 },
  { result_item_base_id: 'helmet_iron', result_rarity: 'common', materials: [{ itemBaseId: 'iron_ore', quantity: 2 }], base_craft_chance: 0.8 },
  { result_item_base_id: 'boots_swift', result_rarity: 'uncommon', materials: [{ itemBaseId: 'leather', quantity: 2 }, { itemBaseId: 'agility_crystal', quantity: 1 }], base_craft_chance: 0.6 },
  { result_item_base_id: 'ring_luck', result_rarity: 'rare', materials: [{ itemBaseId: 'gold_nugget', quantity: 1 }, { itemBaseId: 'luck_gem', quantity: 1 }], base_craft_chance: 0.4 },
  { result_item_base_id: 'necklace_vitality', result_rarity: 'rare', materials: [{ itemBaseId: 'life_crystal', quantity: 2 }], base_craft_chance: 0.45 },
  { result_item_base_id: 'bracelet_strength', result_rarity: 'uncommon', materials: [{ itemBaseId: 'iron_ore', quantity: 1 }, { itemBaseId: 'strength_gem', quantity: 1 }], base_craft_chance: 0.6 },
];

// ---------------------------------------------------------------------------
// v1.8.0 — Rarity chain e chances de combine
// ---------------------------------------------------------------------------
const RARITY_CHAIN: string[] = ['common', 'uncommon', 'rare', 'heroic'];

const COMBINE_CHANCES: Record<string, number> = {
  common: 0.30,    // common → uncommon
  uncommon: 0.20,  // uncommon → rare
  rare: 0.10,      // rare → heroic
  heroic: 0.05,    // heroic → heroic item
};

const DISMANTLE_CHANCES: Record<string, number> = {
  common: 0.70,
  uncommon: 0.60,
  rare: 0.50,
};

// ---------------------------------------------------------------------------
// Mapa de categoria por item_base_id (v1.8.0)
// ---------------------------------------------------------------------------
const ITEM_CATEGORIES: Record<string, string> = {
  boomerang: 'weapon',
  cannon: 'weapon',
  'ice-book': 'weapon',
  longbow: 'weapon',
  'magic-grenade': 'weapon',
  musket: 'weapon',
  crossbow: 'weapon',
  shuriken: 'weapon',
  staff: 'weapon',
  scepter: 'weapon',
  armor: 'armor',
  'armor-leather': 'armor',
  'chain-mail': 'armor',
  helmet: 'head',
  'iron-helmet': 'head',
  leggings: 'legs',
  greaves: 'legs',
  ring: 'accessory',
  amulet: 'accessory',
  bracelet: 'accessory',
  shield: 'secondary',
  'magic-orb': 'secondary',
  quiver: 'secondary',
};

// Itens disponíveis por categoria (usados no combine para sortear o resultado)
const ITEMS_BY_CATEGORY: Record<string, string[]> = {
  weapon: ['boomerang', 'cannon', 'ice-book', 'longbow', 'magic-grenade', 'musket', 'crossbow', 'shuriken', 'staff', 'scepter'],
  armor: ['armor', 'armor-leather', 'chain-mail'],
  head: ['helmet', 'iron-helmet'],
  legs: ['leggings', 'greaves'],
  accessory: ['ring', 'amulet', 'bracelet'],
  secondary: ['shield', 'magic-orb', 'quiver'],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
@Injectable()
export class CraftService {
  constructor(
    @InjectRepository(CraftRecipe) private recipeRepo: Repository<CraftRecipe>,
    @InjectRepository(CraftAttempt) private attemptRepo: Repository<CraftAttempt>,
    @InjectRepository(ItemInstance) private itemInstanceRepo: Repository<ItemInstance>,
  ) {}

  // -------------------------------------------------------------------------
  // Legado (deprecated — mantido para compatibilidade)
  // -------------------------------------------------------------------------

  async seed(): Promise<void> {
    const count = await this.recipeRepo.count();
    if (count > 0) return;
    for (const r of SEED_RECIPES) {
      await this.recipeRepo.save(this.recipeRepo.create({ ...r, luck_scaling: 0.001 }));
    }
  }

  /** @deprecated Use POST /craft/combine instead */
  async getAllRecipes(): Promise<CraftRecipe[]> {
    return this.recipeRepo.find({ where: { active: true } });
  }

  /** @deprecated Use POST /craft/combine instead */
  async craft(characterId: string, recipeId: string, luckStat: number): Promise<CraftAttempt> {
    const recipe = await this.recipeRepo.findOne({ where: { id: recipeId, active: true } });
    if (!recipe) throw new NotFoundException('Recipe not found');

    const chance = Math.min(0.95, recipe.base_craft_chance + luckStat * recipe.luck_scaling);
    const success = Math.random() < chance;

    const attempt = this.attemptRepo.create({
      character_id: characterId,
      recipe_id: recipeId,
      success,
      result_item_instance_id: success ? `crafted_${Date.now()}` : null,
    });
    return this.attemptRepo.save(attempt);
  }

  // -------------------------------------------------------------------------
  // v1.8.0 — combine: 3 fragmentos → item R+1
  // -------------------------------------------------------------------------
  async combine(
    characterId: string,
    fragmentInstanceIds: [string, string, string],
  ): Promise<{ success: boolean; resultItem: ItemInstance | null }> {
    // 1. Carregar as 3 instâncias
    const instances = await Promise.all(
      fragmentInstanceIds.map(id => this.itemInstanceRepo.findOne({ where: { id } })),
    );

    // 2. Validar posse e existência
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      if (!inst) throw new NotFoundException(`Fragment instance ${fragmentInstanceIds[i]} not found`);
      if (inst.owner_id !== characterId) {
        throw new BadRequestException(`Fragment ${fragmentInstanceIds[i]} does not belong to character ${characterId}`);
      }
      if (!inst.item_base_id.startsWith('fragment_')) {
        throw new BadRequestException(`Item ${inst.item_base_id} is not a fragment`);
      }
    }

    // 3. Validar mesma categoria
    const categories = instances.map(inst => {
      // fragment_weapon → 'weapon', fragment_armor → 'armor', etc.
      const parts = inst!.item_base_id.split('_');
      return parts.slice(1).join('_'); // suporte a nomes compostos
    });
    if (new Set(categories).size !== 1) {
      throw new BadRequestException('All fragments must be of the same category');
    }
    const category = categories[0];

    // 4. Validar mesmo rarity
    const rarities = instances.map(inst => inst!.rarity);
    if (new Set(rarities).size !== 1) {
      throw new BadRequestException('All fragments must have the same rarity');
    }
    const inputRarity = rarities[0];

    // 6. Deletar os 3 fragmentos (consome sempre, independente do resultado)
    await this.itemInstanceRepo.remove(instances as ItemInstance[]);

    // 7. Rolagem
    const chance = COMBINE_CHANCES[inputRarity] ?? 0;
    const success = Math.random() < chance;

    if (!success) {
      return { success: false, resultItem: null };
    }

    // 8. Determinar rarity resultante (R+1, ou mantém heroic se já for o topo)
    const rarityIndex = RARITY_CHAIN.indexOf(inputRarity);
    const resultRarity = RARITY_CHAIN[rarityIndex + 1] ?? inputRarity;

    // 9. Escolher item aleatório da categoria
    const itemPool = ITEMS_BY_CATEGORY[category];
    if (!itemPool || itemPool.length === 0) {
      // Fallback: retorna item genérico da categoria como weapon
      const fallbackPool = ITEMS_BY_CATEGORY['weapon'];
      const resultItem = await this.itemInstanceRepo.save(
        this.itemInstanceRepo.create({
          owner_id: characterId,
          item_base_id: pickRandom(fallbackPool),
          rarity: resultRarity,
          upgrade_level: 0,
        }),
      );
      return { success: true, resultItem };
    }

    const resultItem = await this.itemInstanceRepo.save(
      this.itemInstanceRepo.create({
        owner_id: characterId,
        item_base_id: pickRandom(itemPool),
        rarity: resultRarity,
        upgrade_level: 0,
      }),
    );

    return { success: true, resultItem };
  }

  // -------------------------------------------------------------------------
  // v1.8.0 — dismantle: item → fragment da categoria
  // -------------------------------------------------------------------------
  async dismantle(
    characterId: string,
    itemInstanceId: string,
  ): Promise<{ success: boolean; resultFragment: ItemInstance | null }> {
    // 1. Carregar instância
    const instance = await this.itemInstanceRepo.findOne({ where: { id: itemInstanceId } });
    if (!instance) throw new NotFoundException(`Item instance ${itemInstanceId} not found`);

    // 2. Validar posse
    if (instance.owner_id !== characterId) {
      throw new BadRequestException(`Item ${itemInstanceId} does not belong to character ${characterId}`);
    }

    // 3. Bloquear fragmentos e pedras de melhoria
    if (instance.item_base_id.startsWith('fragment_')) {
      throw new BadRequestException('Cannot dismantle a fragment');
    }
    if (instance.item_base_id.startsWith('enhancement_stone')) {
      throw new BadRequestException('Cannot dismantle an enhancement stone');
    }

    // 4. Bloquear heroic
    if (instance.rarity === 'heroic') {
      throw new BadRequestException('Heroic items cannot be dismantled');
    }

    // 5. Determinar categoria
    const category = ITEM_CATEGORIES[instance.item_base_id];
    if (!category) {
      throw new BadRequestException(`Unknown item category for item_base_id: ${instance.item_base_id}`);
    }

    // 6. Deletar o item (consome sempre)
    await this.itemInstanceRepo.remove(instance);

    // 7. Rolagem
    const chance = DISMANTLE_CHANCES[instance.rarity] ?? 0;
    const success = Math.random() < chance;

    if (!success) {
      return { success: false, resultFragment: null };
    }

    // 8. Criar fragmento da categoria com rarity R+1 (common→uncommon, uncommon→rare, rare→heroic)
    const fragmentRarity = RARITY_CHAIN[RARITY_CHAIN.indexOf(instance.rarity) + 1] ?? instance.rarity;
    const fragmentBaseId = `fragment_${category}`;
    const resultFragment = await this.itemInstanceRepo.save(
      this.itemInstanceRepo.create({
        owner_id: characterId,
        item_base_id: fragmentBaseId,
        rarity: fragmentRarity,
        upgrade_level: 0,
      }),
    );

    return { success: true, resultFragment };
  }
}
