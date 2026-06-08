import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CraftRecipe } from './craft-recipe.entity';
import { CraftAttempt } from './craft-attempt.entity';

// 10 receitas de exemplo
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

@Injectable()
export class CraftService {
  constructor(
    @InjectRepository(CraftRecipe) private recipeRepo: Repository<CraftRecipe>,
    @InjectRepository(CraftAttempt) private attemptRepo: Repository<CraftAttempt>,
  ) {}

  async seed(): Promise<void> {
    const count = await this.recipeRepo.count();
    if (count > 0) return;
    for (const r of SEED_RECIPES) {
      await this.recipeRepo.save(this.recipeRepo.create({ ...r, luck_scaling: 0.001 }));
    }
  }

  async getAllRecipes(): Promise<CraftRecipe[]> {
    return this.recipeRepo.find({ where: { active: true } });
  }

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

  async dismantle(itemRarity: string, luckStat: number): Promise<{ success: boolean; stoneType: string | null }> {
    const chances: Record<string, number> = { common: 0.5, uncommon: 0.575, rare: 0.65, epic: 0.8, legendary: 0.9 };
    const base = chances[itemRarity] ?? 0.5;
    const bonus = luckStat * 0.001;
    const success = Math.random() < Math.min(0.95, base + bonus);
    return { success, stoneType: success ? `upgrade_stone_${itemRarity}` : null };
  }
}
