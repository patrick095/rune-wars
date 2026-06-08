import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemBinding } from './item-binding.entity';
import { BindingType, EquipmentSlot, SLOT_ALLOWED_TYPES } from './equipment-slot.enum';

@Injectable()
export class InventorySlotsService {
  constructor(
    @InjectRepository(ItemBinding)
    private bindingRepo: Repository<ItemBinding>,
  ) {}

  async getBinding(itemInstanceId: string): Promise<ItemBinding> {
    let binding = await this.bindingRepo.findOne({ where: { item_instance_id: itemInstanceId } });
    if (!binding) {
      binding = this.bindingRepo.create({
        item_instance_id: itemInstanceId,
        binding_type: BindingType.TRANSFERABLE,
      });
      await this.bindingRepo.save(binding);
    }
    return binding;
  }

  async setBindingType(itemInstanceId: string, type: BindingType): Promise<ItemBinding> {
    const binding = await this.getBinding(itemInstanceId);
    if (binding.is_bound) throw new BadRequestException('Item is already bound');
    binding.binding_type = type;
    return this.bindingRepo.save(binding);
  }

  async bindOnEquip(itemInstanceId: string): Promise<ItemBinding> {
    const binding = await this.getBinding(itemInstanceId);
    if (binding.binding_type === BindingType.BIND_ON_EQUIP) {
      binding.is_bound = true;
      return this.bindingRepo.save(binding);
    }
    return binding;
  }

  async canSell(itemInstanceId: string): Promise<boolean> {
    const binding = await this.getBinding(itemInstanceId);
    if (binding.binding_type === BindingType.NON_TRANSFERABLE) return false;
    if (binding.is_bound) return false;
    return true;
  }

  validateSlot(slot: string, itemType: string): boolean {
    const allowed = SLOT_ALLOWED_TYPES[slot as EquipmentSlot];
    if (!allowed) return false;
    return allowed.includes(itemType);
  }

  getEquipmentSlots(): string[] {
    return Object.values(EquipmentSlot);
  }
}
