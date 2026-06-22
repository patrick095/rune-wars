/**
 * Testes unitários do módulo de raridade — Rune Wars v1.8.0
 *
 * Execução: npx vitest run --config vitest.config.ts
 */
import { describe, it, expect } from 'vitest';
import {
  applyRarity,
  formatItemName,
  normalizeRarity,
  RARITY_BONUS,
} from '../rarity';
import { ItemStats } from '../item-catalog';

// ---------------------------------------------------------------------------
// applyRarity — weapon (primary stat: attack)
// ---------------------------------------------------------------------------

describe('applyRarity — weapon', () => {
  const baseStats: ItemStats = { attack: 35 };

  it('common: no bonus (×1.00)', () => {
    const result = applyRarity(baseStats, 'weapon', 'common');
    expect(result.attack).toBe(Math.round(35 * RARITY_BONUS.common)); // 35
    expect(result.attack).toBe(35);
  });

  it('uncommon: ×1.02', () => {
    const result = applyRarity(baseStats, 'weapon', 'uncommon');
    expect(result.attack).toBe(Math.round(35 * RARITY_BONUS.uncommon)); // 36
    expect(result.attack).toBe(36);
  });

  it('rare: ×1.04', () => {
    const result = applyRarity(baseStats, 'weapon', 'rare');
    expect(result.attack).toBe(Math.round(35 * RARITY_BONUS.rare)); // 36
    expect(result.attack).toBe(36);
  });

  it('heroic: ×1.07', () => {
    const result = applyRarity(baseStats, 'weapon', 'heroic');
    expect(result.attack).toBe(Math.round(35 * RARITY_BONUS.heroic)); // 37
    expect(result.attack).toBe(37);
  });

  it('does not modify non-primary stats', () => {
    const multiStats: ItemStats = { attack: 22, mana: 10 };
    const result = applyRarity(multiStats, 'weapon', 'heroic');
    expect(result.mana).toBe(10); // unchanged
    expect(result.attack).toBe(Math.round(22 * RARITY_BONUS.heroic)); // 24
  });
});

// ---------------------------------------------------------------------------
// applyRarity — armor (primary stat: defense)
// ---------------------------------------------------------------------------

describe('applyRarity — armor', () => {
  const baseStats: ItemStats = { defense: 15, speed: 1 };

  it('common: no bonus', () => {
    const result = applyRarity(baseStats, 'armor', 'common');
    expect(result.defense).toBe(15);
    expect(result.speed).toBe(1); // unchanged
  });

  it('uncommon: defense ×1.02', () => {
    const result = applyRarity(baseStats, 'armor', 'uncommon');
    expect(result.defense).toBe(Math.round(15 * RARITY_BONUS.uncommon)); // 15
    expect(result.speed).toBe(1); // unchanged
  });

  it('rare: defense ×1.04', () => {
    const result = applyRarity(baseStats, 'armor', 'rare');
    expect(result.defense).toBe(Math.round(15 * RARITY_BONUS.rare)); // 16
  });

  it('heroic: defense ×1.07', () => {
    const result = applyRarity(baseStats, 'armor', 'heroic');
    expect(result.defense).toBe(Math.round(15 * RARITY_BONUS.heroic)); // 16
  });
});

// ---------------------------------------------------------------------------
// formatItemName
// ---------------------------------------------------------------------------

describe('formatItemName', () => {
  it("formats 'Canhão' with 'common' → 'Canhão (Comum)'", () => {
    expect(formatItemName('Canhão', 'common')).toBe('Canhão (Comum)');
  });

  it("formats with 'uncommon'", () => {
    expect(formatItemName('Espada', 'uncommon')).toBe('Espada (Incomum)');
  });

  it("formats with 'rare'", () => {
    expect(formatItemName('Arco', 'rare')).toBe('Arco (Raro)');
  });

  it("formats with 'heroic'", () => {
    expect(formatItemName('Cajado', 'heroic')).toBe('Cajado (Heroico)');
  });
});

// ---------------------------------------------------------------------------
// normalizeRarity
// ---------------------------------------------------------------------------

describe('normalizeRarity', () => {
  it("'epic' → 'rare'", () => {
    expect(normalizeRarity('epic')).toBe('rare');
  });

  it("'legendary' → 'heroic'", () => {
    expect(normalizeRarity('legendary')).toBe('heroic');
  });

  it("'common' → 'common'", () => {
    expect(normalizeRarity('common')).toBe('common');
  });

  it("'uncommon' → 'uncommon'", () => {
    expect(normalizeRarity('uncommon')).toBe('uncommon');
  });

  it("'rare' → 'rare'", () => {
    expect(normalizeRarity('rare')).toBe('rare');
  });

  it("'heroic' → 'heroic'", () => {
    expect(normalizeRarity('heroic')).toBe('heroic');
  });

  it('unknown string → common', () => {
    expect(normalizeRarity('godlike')).toBe('common');
    expect(normalizeRarity('')).toBe('common');
  });
});
