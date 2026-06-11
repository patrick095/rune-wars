import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../character/character.entity';
import { ItemInstance } from '../inventory/item-instance.entity';
import { CharacterConsumable } from '../inventory/character-consumable.entity';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Character) private characters: Repository<Character>,
    @InjectRepository(ItemInstance) private items: Repository<ItemInstance>,
    @InjectRepository(CharacterConsumable) private consumables: Repository<CharacterConsumable>,
  ) {}

  async listCharacters() {
    return this.characters.find({
      relations: ['user'],
    });
  }

  async getCharacterInventory(id: string): Promise<ItemInstance[]> {
    return this.items.find({ where: { owner_id: id } });
  }

  async addItemToInventory(
    characterId: string,
    itemBaseId: string,
    rarity: string = 'common',
    quantity: number = 1,
  ): Promise<ItemInstance[]> {
    const instances: ItemInstance[] = [];
    for (let i = 0; i < quantity; i++) {
      const instance = this.items.create({
        owner_id: characterId,
        item_base_id: itemBaseId,
        rarity,
      });
      instances.push(await this.items.save(instance));
    }
    this.logger.log(
      `ADMIN_ADD_ITEM: character=${characterId} item=${itemBaseId} rarity=${rarity} quantity=${quantity}`,
    );
    return instances;
  }

  async removeItem(itemId: string): Promise<void> {
    const item = await this.items.findOne({ where: { id: itemId } });
    if (item) await this.items.remove(item);
  }

  async addConsumable(
    characterId: string,
    consumableId: string,
    quantity: number,
  ): Promise<CharacterConsumable> {
    let entry = await this.consumables.findOne({
      where: { character_id: characterId, consumable_id: consumableId },
    });

    if (entry) {
      entry.quantity += quantity;
    } else {
      entry = this.consumables.create({
        character_id: characterId,
        consumable_id: consumableId,
        quantity,
      });
    }

    const saved = await this.consumables.save(entry);
    this.logger.log(
      `ADMIN_ADD_CONSUMABLE: character=${characterId} consumable=${consumableId} quantity=${quantity}`,
    );
    return saved;
  }
}
