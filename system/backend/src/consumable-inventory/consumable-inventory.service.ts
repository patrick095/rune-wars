import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterConsumable } from '../inventory/character-consumable.entity';
import { Character } from '../character/character.entity';

@Injectable()
export class ConsumableInventoryService {
  private readonly logger = new Logger(ConsumableInventoryService.name);

  constructor(
    @InjectRepository(CharacterConsumable)
    private readonly repo: Repository<CharacterConsumable>,
    @InjectRepository(Character)
    private readonly characterRepo: Repository<Character>,
  ) {}

  /**
   * Validates that the character identified by characterId belongs to userId.
   * Returns true if the character is owned by the user, false otherwise.
   */
  async validateOwnership(characterId: string, userId: string): Promise<boolean> {
    const character = await this.characterRepo.findOne({
      where: { id: characterId, user_id: userId },
    });
    return character !== null;
  }

  async getConsumables(characterId: string): Promise<CharacterConsumable[]> {
    return this.repo.find({
      where: { character_id: characterId },
    }).then(items => items.filter(i => i.quantity > 0));
  }

  async useConsumable(characterId: string, consumableId: string): Promise<CharacterConsumable> {
    let entry = await this.repo.findOne({
      where: { character_id: characterId, consumable_id: consumableId },
    });

    if (!entry) {
      entry = this.repo.create({
        character_id: characterId,
        consumable_id: consumableId,
        quantity: 0,
      });
    } else {
      entry.quantity = Math.max(0, entry.quantity - 1);
    }

    const saved = await this.repo.save(entry);
    this.logger.log(`CONSUMABLE_USE characterId=${characterId} consumableId=${consumableId} quantity=${saved.quantity}`);
    return saved;
  }

  async addConsumable(characterId: string, consumableId: string, quantity: number): Promise<CharacterConsumable> {
    let entry = await this.repo.findOne({
      where: { character_id: characterId, consumable_id: consumableId },
    });

    if (entry) {
      entry.quantity += quantity;
    } else {
      entry = this.repo.create({
        character_id: characterId,
        consumable_id: consumableId,
        quantity,
      });
    }

    return this.repo.save(entry);
  }
}
