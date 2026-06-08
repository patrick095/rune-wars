import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vault } from './vault.entity';
import { VaultSlot } from './vault-slot.entity';
import { Character } from '../character/character.entity';
import { ItemInstance } from '../inventory/item-instance.entity';
import { DepositItemDto } from './dto/deposit-item.dto';
import { WithdrawItemDto } from './dto/withdraw-item.dto';
import { DepositGoldDto } from './dto/deposit-gold.dto';
import { WithdrawGoldDto } from './dto/withdraw-gold.dto';

const VAULT_MAX_SLOTS = 60;
const VAULT_ITEM_FEE = 100;

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);

  constructor(
    @InjectRepository(Vault)
    private vaultRepo: Repository<Vault>,
    @InjectRepository(VaultSlot)
    private slotRepo: Repository<VaultSlot>,
    @InjectRepository(Character)
    private characterRepo: Repository<Character>,
    @InjectRepository(ItemInstance)
    private itemRepo: Repository<ItemInstance>,
  ) {}

  async getVault(userId: string): Promise<Vault> {
    let vault = await this.vaultRepo.findOne({ where: { userId }, relations: ['slots'] });
    if (!vault) {
      vault = this.vaultRepo.create({ userId, gold: 0, slots: [] });
      vault = await this.vaultRepo.save(vault);
    }
    return vault;
  }

  async depositItem(userId: string, dto: DepositItemDto): Promise<Vault> {
    const character = await this.validateCharacterOwnership(dto.characterId, userId);

    if (dto.slotIndex < 0 || dto.slotIndex >= VAULT_MAX_SLOTS) {
      throw new BadRequestException(`Slot index must be between 0 and ${VAULT_MAX_SLOTS - 1}`);
    }

    const vault = await this.getVault(userId);

    const existingSlot = vault.slots.find(s => s.slotIndex === dto.slotIndex);
    if (existingSlot && existingSlot.item !== null) {
      throw new BadRequestException('Vault slot is already occupied');
    }

    const item = await this.itemRepo.findOne({
      where: { id: dto.itemId, owner_id: character.id },
    });
    if (!item) {
      throw new NotFoundException('Item not found in character inventory');
    }

    const itemData = {
      id: item.id,
      item_base_id: item.item_base_id,
      rarity: item.rarity,
      upgrade_level: item.upgrade_level,
    };

    if (existingSlot) {
      existingSlot.item = itemData;
      await this.slotRepo.save(existingSlot);
    } else {
      const slot = this.slotRepo.create({
        vaultId: vault.id,
        slotIndex: dto.slotIndex,
        item: itemData,
      });
      await this.slotRepo.save(slot);
    }

    await this.itemRepo.remove(item);

    this.logger.log(`VAULT_DEPOSIT_ITEM: userId=${userId} characterId=${dto.characterId} itemId=${dto.itemId} slot=${dto.slotIndex}`);

    return this.getVault(userId);
  }

  async withdrawItem(userId: string, dto: WithdrawItemDto): Promise<Vault> {
    const character = await this.validateCharacterOwnership(dto.characterId, userId);

    const vault = await this.getVault(userId);

    const vaultSlot = vault.slots.find(s => s.slotIndex === dto.vaultSlotIndex);
    if (!vaultSlot || vaultSlot.item === null) {
      throw new BadRequestException('Vault slot is empty');
    }

    if (character.gold < VAULT_ITEM_FEE) {
      this.logger.warn(`VAULT_INSUFFICIENT_GOLD: userId=${userId} characterId=${dto.characterId} required=${VAULT_ITEM_FEE} available=${character.gold}`);
      throw new BadRequestException(`Insufficient gold. Withdrawing an item costs ${VAULT_ITEM_FEE} gold`);
    }

    const itemData = vaultSlot.item;
    const newItem = this.itemRepo.create({
      owner_id: character.id,
      item_base_id: itemData.item_base_id,
      rarity: itemData.rarity,
      upgrade_level: itemData.upgrade_level ?? 0,
    });
    await this.itemRepo.save(newItem);

    character.gold -= VAULT_ITEM_FEE;
    await this.characterRepo.save(character);

    vaultSlot.item = null;
    await this.slotRepo.save(vaultSlot);

    this.logger.log(`VAULT_WITHDRAW_ITEM: userId=${userId} characterId=${dto.characterId} vaultSlot=${dto.vaultSlotIndex} fee=${VAULT_ITEM_FEE}`);

    return this.getVault(userId);
  }

  async depositGold(userId: string, dto: DepositGoldDto): Promise<Vault> {
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const character = await this.validateCharacterOwnership(dto.characterId, userId);

    if (character.gold < dto.amount) {
      throw new BadRequestException(`Insufficient gold. Character has ${character.gold} gold`);
    }

    const vault = await this.getVault(userId);

    character.gold -= dto.amount;
    await this.characterRepo.save(character);

    vault.gold += dto.amount;
    await this.vaultRepo.save(vault);

    this.logger.log(`VAULT_DEPOSIT_GOLD: userId=${userId} characterId=${dto.characterId} amount=${dto.amount}`);

    return this.getVault(userId);
  }

  async withdrawGold(userId: string, dto: WithdrawGoldDto): Promise<Vault> {
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const character = await this.validateCharacterOwnership(dto.characterId, userId);
    const vault = await this.getVault(userId);

    const fee = Math.floor(dto.amount * 0.03);
    const totalDeducted = dto.amount + fee;

    if (vault.gold < totalDeducted) {
      this.logger.warn(`VAULT_INSUFFICIENT_GOLD: userId=${userId} characterId=${dto.characterId} required=${totalDeducted} available=${vault.gold}`);
      throw new BadRequestException(
        `Insufficient gold in vault. Withdrawing ${dto.amount} requires ${totalDeducted} gold (3% fee: ${fee}). Vault has ${vault.gold}`,
      );
    }

    vault.gold -= totalDeducted;
    await this.vaultRepo.save(vault);

    character.gold += dto.amount;
    await this.characterRepo.save(character);

    this.logger.log(`VAULT_WITHDRAW_GOLD: userId=${userId} characterId=${dto.characterId} amount=${dto.amount} fee=${fee}`);

    return this.getVault(userId);
  }

  private async validateCharacterOwnership(characterId: string, userId: string): Promise<Character> {
    const character = await this.characterRepo.findOne({
      where: { id: characterId, user_id: userId },
    });
    if (!character) {
      throw new NotFoundException('Character not found or does not belong to this user');
    }
    return character;
  }
}
