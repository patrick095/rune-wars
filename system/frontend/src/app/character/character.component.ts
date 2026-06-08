import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttributeCalculator } from '../shared/game-core/attribute-calculator';
import { WeaponSystem } from '../shared/game-core/weapon-system';
import { canUseWeapon } from '../shared/game-core/weapon-requirements';
import { PlayerBaseStats, PlayerStats } from '../shared/game-core/player-stats';
import { WeaponDefinition } from '../shared/game-core/weapon-definition';
import { CharacterStorageService } from '../shared/services/character-storage.service';
import { BuildPreset, CHARACTER_PRESETS } from './character-presets';

interface WeaponEntry {
  weapon: WeaponDefinition;
  canUse: boolean;
}

@Component({
  selector: 'app-character',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
})
export class CharacterComponent implements OnInit {
  private readonly calculator = new AttributeCalculator();
  private readonly weaponSystem = new WeaponSystem();

  base: PlayerBaseStats = { level: 1, strength: 0, agility: 0, vitality: 0, luck: 0 };
  presets: BuildPreset[] = CHARACTER_PRESETS;
  saveMessage = '';
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private storageService: CharacterStorageService) {}

  ngOnInit(): void {
    const saved = this.storageService.load();
    if (saved) {
      this.base = { ...saved };
    }
  }

  get stats(): PlayerStats {
    return this.calculator.calculate(this.base);
  }

  get weapons(): WeaponEntry[] {
    const currentStats = this.stats;
    return this.weaponSystem.getAll().map((weapon) => ({
      weapon,
      canUse: canUseWeapon(currentStats, weapon),
    }));
  }

  get availablePoints(): number {
    return this.stats.totalPoints - this.stats.usedPoints;
  }

  increment(attr: 'strength' | 'agility' | 'vitality' | 'luck'): void {
    if (this.availablePoints > 0) {
      this.base = { ...this.base, [attr]: this.base[attr] + 1 };
    }
  }

  decrement(attr: 'strength' | 'agility' | 'vitality' | 'luck'): void {
    if (this.base[attr] > 0) {
      this.base = { ...this.base, [attr]: this.base[attr] - 1 };
    }
  }

  incrementLevel(): void {
    if (this.base.level < 100) {
      this.base = { ...this.base, level: this.base.level + 1 };
    }
  }

  decrementLevel(): void {
    if (this.base.level > 1) {
      const newLevel = this.base.level - 1;
      const newTotal = (newLevel - 1) * 4;
      const used = this.base.strength + this.base.agility + this.base.vitality + this.base.luck;
      if (used <= newTotal) {
        this.base = { ...this.base, level: newLevel };
      }
    }
  }

  applyPreset(preset: BuildPreset): void {
    this.base = { ...preset.stats };
  }

  save(): void {
    this.storageService.save(this.base);
    this.saveMessage = 'Salvo!';
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => { this.saveMessage = ''; }, 2000);
  }
}
