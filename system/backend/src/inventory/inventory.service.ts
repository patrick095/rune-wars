import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemInstance } from './item-instance.entity';
import { CharacterService } from '../character/character.service';

const ALL_EQUIPMENT_SLOTS = new Set([
  'mainHand',
  'offHand',
  'head',
  'chest',
  'legs',
  'accessory1',
  'accessory2',
  'necklace',
  'earring',
  'bracelet',
]);

const ITEM_SLOT_OVERRIDES: Record<string, string[]> = {
  boomerang: ['mainHand'],
  cannon: ['mainHand'],
  'ice-book': ['mainHand'],
  longbow: ['mainHand'],
  'magic-grenade': ['mainHand'],
  potion: ['mainHand'],
  tnt: ['mainHand'],
  sword_iron: ['mainHand'],
  sword_steel: ['mainHand'],
  bow_wood: ['mainHand'],
  staff_runic: ['mainHand'],
  armor_leather: ['chest'],
  helmet_iron: ['head'],
  boots_swift: ['legs'],
  ring_luck: ['accessory1', 'accessory2'],
  necklace_vitality: ['necklace'],
  bracelet_strength: ['bracelet'],
  shield: ['offHand'],
  'healing-book': ['offHand'],
  'protection-totem': ['offHand'],
  'runic-builder': ['offHand'],
  'magic-orb': ['offHand'],
  quiver: ['offHand'],
};

function allowedSlotsForItem(itemBaseId: string): string[] {
  if (ITEM_SLOT_OVERRIDES[itemBaseId]) return ITEM_SLOT_OVERRIDES[itemBaseId];
  if (itemBaseId.startsWith('ring_')) return ['accessory1', 'accessory2'];
  if (itemBaseId.startsWith('necklace_')) return ['necklace'];
  if (itemBaseId.startsWith('bracelet_')) return ['bracelet'];
  if (itemBaseId.startsWith('earring_')) return ['earring'];
  return [];
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ItemInstance) private repo: Repository<ItemInstance>,
    private chars: CharacterService,
  ) {}

  async list(characterId: string, userId: string) {
    await this.chars.findOne(characterId, userId);
    const items = await this.repo.find({
      where: { owner_id: characterId },
      order: { created_at: 'ASC' },
    });
    const occupiedSlots = new Set<string>();
    const cleanup: Promise<ItemInstance>[] = [];

    for (const item of items) {
      const slot = item.equipped_slot;
      if (!slot) continue;
      const invalidSlot =
        !ALL_EQUIPMENT_SLOTS.has(slot) ||
        !allowedSlotsForItem(item.item_base_id).includes(slot) ||
        occupiedSlots.has(slot);
      if (invalidSlot) {
        item.equipped_slot = null;
        cleanup.push(this.repo.save(item));
      } else {
        occupiedSlots.add(slot);
      }
    }

    if (cleanup.length) await Promise.all(cleanup);
    return items;
  }

  async equip(itemId: string, slot: string | null, characterId: string, userId: string) {
    await this.chars.findOne(characterId, userId);
    const item = await this.repo.findOne({ where: { id: itemId, owner_id: characterId } });
    if (!item) return null;

    if (slot) {
      if (!ALL_EQUIPMENT_SLOTS.has(slot)) {
        throw new BadRequestException('Slot de equipamento inválido');
      }
      if (!allowedSlotsForItem(item.item_base_id).includes(slot)) {
        throw new BadRequestException('Este item não pode ser equipado neste slot');
      }

      await this.repo.update(
        { owner_id: characterId, equipped_slot: slot },
        { equipped_slot: null },
      );
    }

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
