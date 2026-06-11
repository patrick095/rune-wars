import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemInstance } from './item-instance.entity';
import { CharacterService } from '../character/character.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ItemInstance) private repo: Repository<ItemInstance>,
    private chars: CharacterService,
  ) {}

  async list(characterId: string, userId: string) {
    await this.chars.findOne(characterId, userId);
    return this.repo.find({ where: { owner_id: characterId } });
  }

  async equip(itemId: string, slot: string, characterId: string, userId: string) {
    await this.chars.findOne(characterId, userId);
    const item = await this.repo.findOne({ where: { id: itemId, owner_id: characterId } });
    if (!item) return null;
    item.equipped_slot = slot;
    return this.repo.save(item);
  }

  async unequip(itemId: string, characterId: string, userId: string) {
    return this.equip(itemId, null, characterId, userId);
  }

  /**
   * Acknowledges an inventory reorder request.
   * Visual ordering is managed client-side. This method validates ownership
   * and returns a success payload so the frontend receives a 201 instead of 404.
   */
  async move(characterId: string, userId: string, fromIndex: number, toIndex: number) {
    await this.chars.findOne(characterId, userId);
    return { characterId, fromIndex, toIndex };
  }
}
