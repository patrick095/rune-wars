/**
 * Testes unitários do módulo dungeon-content — Rune Wars v1.8.0
 *
 * Execução: npx vitest run --config vitest.config.ts
 */
import { describe, it, expect } from 'vitest';
import {
  DIFFICULTY_MULTIPLIER,
  createEnemy,
  bossPhasePlan,
  DUNGEON_CONTENT,
} from '../dungeon-content';

describe('DIFFICULTY_MULTIPLIER', () => {
  it('heroic multiplier is 7.0', () => {
    expect(DIFFICULTY_MULTIPLIER.heroic).toBe(7.0);
  });

  it('easy multiplier is 1.0', () => {
    expect(DIFFICULTY_MULTIPLIER.easy).toBe(1.0);
  });

  it('medium multiplier is 1.5', () => {
    expect(DIFFICULTY_MULTIPLIER.medium).toBe(1.5);
  });

  it('hard multiplier is 3.0', () => {
    expect(DIFFICULTY_MULTIPLIER.hard).toBe(3.0);
  });
});

describe('createEnemy', () => {
  it('ACID_BAT hard: maxHp === Math.round(1000 * 3.0)', () => {
    const enemy = createEnemy('ACID_BAT', 'hard');
    expect(enemy.maxHp).toBe(Math.round(1000 * 3.0));
  });

  it('ACID_BAT easy: maxHp === 1000', () => {
    const enemy = createEnemy('ACID_BAT', 'easy');
    expect(enemy.maxHp).toBe(1000);
  });

  it('created enemy is alive with correct type', () => {
    const enemy = createEnemy('ACID_BAT', 'medium');
    expect(enemy.alive).toBe(true);
    expect(enemy.type).toBe('ACID_BAT');
    expect(enemy.hp).toBe(enemy.maxHp);
  });

  it('boss type gets BOSS ai level', () => {
    const enemy = createEnemy('GIANT_BAT_BOSS', 'easy');
    expect(enemy.ai).toBe('BOSS');
  });

  it('NPC type gets EASY ai level', () => {
    const enemy = createEnemy('MYSTIC_BEETLE_NPC', 'easy');
    expect(enemy.ai).toBe('EASY');
  });

  it('regular enemy gets INTERMEDIATE ai level', () => {
    const enemy = createEnemy('ACID_BAT', 'easy');
    expect(enemy.ai).toBe('INTERMEDIATE');
  });
});

describe('bossPhasePlan', () => {
  it("GIANT_BAT_BOSS easy returns ['BASIC_ATTACK']", () => {
    expect(bossPhasePlan('GIANT_BAT_BOSS', 'easy')).toEqual(['BASIC_ATTACK']);
  });

  it('GIANT_BAT_BOSS medium returns BASIC_ATTACK + SUMMON_BATS', () => {
    expect(bossPhasePlan('GIANT_BAT_BOSS', 'medium')).toEqual(['BASIC_ATTACK', 'SUMMON_BATS']);
  });

  it('GIANT_BAT_BOSS hard returns 3 phases', () => {
    expect(bossPhasePlan('GIANT_BAT_BOSS', 'hard')).toEqual(['BASIC_ATTACK', 'SUMMON_BATS', 'SPREAD_X5']);
  });

  it('GIANT_BAT_BOSS heroic skips phase 1 (starts with FRENZY)', () => {
    const plan = bossPhasePlan('GIANT_BAT_BOSS', 'heroic');
    expect(plan[0]).toBe('FRENZY');
  });

  it("TREANT_BOSS easy returns ['BASIC_ATTACK']", () => {
    expect(bossPhasePlan('TREANT_BOSS', 'easy')).toEqual(['BASIC_ATTACK']);
  });

  it('TREANT_BOSS heroic returns array with ONE_HIT', () => {
    const plan = bossPhasePlan('TREANT_BOSS', 'heroic');
    expect(plan).toContain('ONE_HIT');
  });

  it('TREANT_BOSS heroic skips phase 1 (starts with ROOT_BURST)', () => {
    const plan = bossPhasePlan('TREANT_BOSS', 'heroic');
    expect(plan[0]).toBe('ROOT_BURST');
  });
});

describe('DUNGEON_CONTENT', () => {
  it('has exactly 5 stages', () => {
    expect(DUNGEON_CONTENT.length).toBe(5);
  });

  it('contains f1-s1 through f2-s3', () => {
    const ids = DUNGEON_CONTENT.map(s => s.id);
    expect(ids).toEqual(['f1-s1', 'f1-s2', 'f2-s1', 'f2-s2', 'f2-s3']);
  });

  it('stage f1-s2 is a boss stage', () => {
    const stage = DUNGEON_CONTENT.find(s => s.id === 'f1-s2')!;
    expect(stage.objective.type).toBe('DEFEAT_BOSS');
    expect(stage.objective.bossId).toBe('GIANT_BAT_BOSS');
  });

  it('stage f2-s1 is a protect stage with 10 turns', () => {
    const stage = DUNGEON_CONTENT.find(s => s.id === 'f2-s1')!;
    expect(stage.objective.type).toBe('PROTECT');
    expect(stage.objective.turns).toBe(10);
  });

  it('stage f2-s3 has TREANT_BOSS', () => {
    const stage = DUNGEON_CONTENT.find(s => s.id === 'f2-s3')!;
    expect(stage.objective.bossId).toBe('TREANT_BOSS');
  });
});
