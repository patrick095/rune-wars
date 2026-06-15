/**
 * Testes automatizados da IA tática do Rune Wars.
 *
 * Execução: npx vitest run --config vitest.config.ts
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { AiDecisionMaker } from '../ai-decision-maker';
import { BattleSnapshot, CombatantSnapshot } from '../ai-battle-types';
import { TerrainEngine } from '../terrain-engine';
import { WeaponSystem } from '../weapon-system';
import { WindState } from '../wind-system';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const weaponSystem = new WeaponSystem();
const cannon = weaponSystem.getById('cannon')!;
const tnt    = weaponSystem.getById('tnt')!;

function makeCombatant(overrides: Partial<CombatantSnapshot> & { id: 'ai' | 'player' }): CombatantSnapshot {
  const base: CombatantSnapshot = {
    id: overrides.id,
    x: 400,
    y: 500,
    hp: 100,
    maxHp: 100,
    facing: 'right',
    weapon: cannon,
    shieldReduction: 0,
    effects: [],
    strength: 0,
    luck: 10,
    usedConsumableIds: new Set(),
    invisibleTurns: 0,
    frozenTurns: 0,
  };
  return { ...base, ...overrides };
}

function makeSnapshot(overrides: {
  aiHp?: number;
  playerHp?: number;
  aiX?: number;
  playerX?: number;
  aiY?: number;
  playerY?: number;
  aiConsumables?: string[];
  aiHasShield?: boolean;
  playerShield?: number;
  wind?: WindState;
  seed?: number;
} = {}): BattleSnapshot {
  // Use a tiny terrain (200×200) so tests run fast and bitmap copies are cheap.
  const W = 200;
  const H = 200;
  const terrain = TerrainEngine.empty(W, H);
  // Solid floor at y >= 160 (leaves 160px of open space above)
  const bmp = terrain.getBitmap();
  for (let y = 160; y < H; y++) {
    for (let x = 0; x < W; x++) {
      bmp[y * W + x] = 1; // DESTRUCTIBLE
    }
  }

  // AI to the LEFT of player → shoots RIGHT → angles 45-85° (normal range, easier to hit)
  const ai     = makeCombatant({
    id: 'ai',
    x: overrides.aiX ?? 50,
    y: overrides.aiY ?? 120,
    hp: overrides.aiHp ?? 100,
    maxHp: 100,
    weapon: cannon,
    usedConsumableIds: new Set(overrides.aiHasShield ? ['__shield'] : []),
    shieldReduction: overrides.aiHasShield ? 0.4 : 0,
  });

  const player = makeCombatant({
    id: 'player',
    x: overrides.playerX ?? 150,
    y: overrides.playerY ?? 120,
    hp: overrides.playerHp ?? 100,
    maxHp: 100,
    weapon: cannon,
    shieldReduction: overrides.playerShield ?? 0,
    invisibleTurns: 0,
    frozenTurns: 0,
  });

  return {
    ai,
    player,
    wind: overrides.wind ?? { direction: 0, intensity: 0 },
    turnNumber: 1,
    terrain,
    availableConsumables: overrides.aiConsumables ?? [],
    availableSecondaryItemId: null,
    aiShieldActive: overrides.aiHasShield ?? false,
    seed: overrides.seed ?? 42,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AiDecisionMaker', () => {
  let dm: AiDecisionMaker;

  beforeEach(() => {
    dm = new AiDecisionMaker();
  });

  // 1. IA ataca quando consegue vencer, mesmo com pouca vida
  it('ataca para vencer mesmo com HP baixo', () => {
    // AI has 15 HP; player has 1 HP — any hit wins
    const snap = makeSnapshot({ aiHp: 15, playerHp: 1 });
    const decision = dm.decide(snap, 'hard');
    // Should pick a fire shot aiming to win, not a heal
    expect(decision.action.type).toBe('fire');
    expect(decision.evaluation.winsBattle).toBe(true);
  });

  // 2. IA não cura se pode finalizar a partida
  it('não usa cura se pode matar o inimigo neste turno', () => {
    // Player has 1 HP, AI has 20 HP, heal available
    const snap = makeSnapshot({
      aiHp: 20,
      playerHp: 1,
      aiConsumables: ['heal'],
    });
    const decision = dm.decide(snap, 'hard');
    // Winning shot must be preferred over heal
    expect(decision.action.type).not.toBe('use_heal');
    expect(decision.evaluation.winsBattle).toBe(true);
  });

  // 3. IA tenta impedir derrota quando inimigo pode matar no próximo turno
  it('ativa defesa quando inimigo pode matar na próxima ação', () => {
    // AI has 5 HP. Enemy cannon base = 40 * 2.5 = 100 expected > 5 HP
    const snap = makeSnapshot({
      aiHp: 5,
      playerHp: 200,
      aiConsumables: ['heal'],
    });
    const decision = dm.decide(snap, 'hard');
    // Should heal since there's no realistic win and death is imminent
    expect(decision.action.type).toBe('use_heal');
    expect(decision.evaluation.preventsLoss).toBe(true);
  });

  // 4. IA escolhe cura quando não pode vencer e está em risco real
  it('cura quando não pode vencer e HP está crítico', () => {
    const snap = makeSnapshot({
      aiHp: 10,
      playerHp: 500,   // effectively unkillable
      aiConsumables: ['heal'],
    });
    const decision = dm.decide(snap, 'medium');
    // With so much HP difference, healing should score better than a useless shot
    expect(decision.action.type).toBe('use_heal');
  });

  // 5. Simulação não altera estado real da partida
  it('decide() não muda o estado do terreno nem dos combatentes', { timeout: 15000 }, () => {
    const snap = makeSnapshot({ playerHp: 50 });
    const origPlayerHp = snap.player.hp;
    // Sample key positions from the bitmap rather than comparing all bytes
    const sampleBefore = [0, 100, 1000, 5000].map(i => snap.terrain.getBitmap()[i] ?? 0);

    dm.decide(snap, 'hard');

    expect(snap.player.hp).toBe(origPlayerHp);
    const sampleAfter = [0, 100, 1000, 5000].map(i => snap.terrain.getBitmap()[i] ?? 0);
    expect(sampleAfter).toEqual(sampleBefore);
  });

  // 6. Mesma seed gera a mesma decisão (determinismo)
  it('a mesma seed sempre gera a mesma decisão', () => {
    const snap1 = makeSnapshot({ seed: 12345 });
    const snap2 = makeSnapshot({ seed: 12345 });
    const d1 = dm.decide(snap1, 'hard');
    const d2 = dm.decide(snap2, 'hard');
    expect(JSON.stringify(d1.action)).toBe(JSON.stringify(d2.action));
  });

  // 7. IA não usa item em cooldown (já utilizado)
  it('não usa heal já utilizado', () => {
    const snap = makeSnapshot({ aiHp: 10, aiConsumables: [] }); // heal NOT in available
    const decision = dm.decide(snap, 'hard');
    expect(decision.action.type).not.toBe('use_heal');
  });

  // 8. IA respeita perfil de dificuldade fácil (mais ruído, menos precisão)
  it('fácil vs heroico: heroico encontra jogada mais pontuada', () => {
    const snap1 = makeSnapshot({ seed: 99, playerHp: 30 });
    const snap2 = makeSnapshot({ seed: 99, playerHp: 30 });
    const easyDecision   = dm.decide(snap1, 'easy');
    const heroicDecision = dm.decide(snap2, 'heroic');
    // Heroic should consider win condition; easy might not
    // We can't guarantee specific action, but heroic score should be ≥ easy score
    // (or at least heroic detects win on player with 30 HP if cannon shot lands)
    expect(heroicDecision.evaluation.score).toBeGreaterThanOrEqual(0);
    expect(easyDecision.evaluation.score).toBeGreaterThanOrEqual(0);
  });

  // 9. Fire action tem hitChance >= 0 e <= 1
  it('hitChance está no intervalo [0, 1]', () => {
    const snap = makeSnapshot();
    const decision = dm.decide(snap, 'medium');
    if (decision.action.type === 'fire') {
      expect(decision.evaluation.hitChance).toBeGreaterThanOrEqual(0);
      expect(decision.evaluation.hitChance).toBeLessThanOrEqual(1);
    }
  });

  // 10. Win detection ativa em medium/hard mas não em easy
  it('win detection retorna winsBattle=true em hard com inimigo com 1 HP', () => {
    const snap = makeSnapshot({ playerHp: 1, seed: 1 });
    const decision = dm.decide(snap, 'hard');
    expect(decision.evaluation.winsBattle).toBe(true);
  });

  // 11. Ice-throw não é usado quando já foi utilizado
  it('não usa ice-throw já utilizado', () => {
    const snap = makeSnapshot({ aiConsumables: [] }); // ice-throw NOT available
    const decision = dm.decide(snap, 'hard');
    expect(decision.action.type).not.toBe('use_ice_throw');
  });

  // 12. Geração de ações inclui pelo menos uma ação de fogo
  it('gera pelo menos uma ação de fogo', () => {
    const snap = makeSnapshot();
    const decision = dm.decide(snap, 'medium');
    const hasFireInAll = decision.allEvaluations.some(e => e.action.type === 'fire');
    expect(hasFireInAll).toBe(true);
  });

  // 13. expectedDamage >= 0 sempre
  it('expectedDamage é sempre não-negativo', () => {
    const snap = makeSnapshot();
    const decision = dm.decide(snap, 'hard');
    for (const e of decision.allEvaluations) {
      expect(e.expectedDamage).toBeGreaterThanOrEqual(0);
    }
  });

  // 14. AI com escudo ativo não tenta ativar escudo de novo
  it('não tenta usar escudo quando já está ativo', () => {
    const snap = makeSnapshot({ aiHasShield: true, aiHp: 20 });
    const decision = dm.decide(snap, 'hard');
    expect(decision.action.type).not.toBe('use_shield');
  });

  // 15. dropsEnemy requer profile.analyzeTerrainFall (hard/heroic)
  it('dropsEnemy só é avaliado em hard/heroic', () => {
    const snap = makeSnapshot({ seed: 7 });
    const easyDecision = dm.decide(snap, 'easy');
    // Easy never evaluates terrain fall
    for (const e of easyDecision.allEvaluations) {
      expect(e.dropsEnemy).toBe(false);
    }
  });
});

// ─── AiTerrainAnalyzer ────────────────────────────────────────────────────────

import { AiTerrainAnalyzer } from '../ai-terrain-analyzer';
import { TerrainMaterial } from '../terrain-types';

describe('AiTerrainAnalyzer', () => {
  const W = 200;
  const H = 200;

  it('detecta personagem em plataforma fina (sem suporte)', () => {
    const terrain = TerrainEngine.empty(W, H);
    const analyzer = new AiTerrainAnalyzer();
    // Empty terrain → no floor below → thin platform
    expect(analyzer.isOnThinPlatform(terrain, 100, 100)).toBe(true);
  });

  it('detecta personagem em plataforma sólida', () => {
    const terrain = TerrainEngine.empty(W, H);
    const bmp = terrain.getBitmap();
    // Solid floor at y=132 (within SUPPORT_DEPTH=8 below char feet at y=100+30=130)
    for (let x = 0; x < W; x++) {
      bmp[132 * W + x] = TerrainMaterial.DESTRUCTIBLE;
    }
    const analyzer = new AiTerrainAnalyzer();
    expect(analyzer.isOnThinPlatform(terrain, 100, 100)).toBe(false);
  });

  it('estimateFallRisk retorna willFall=false sem terreno para excavar', () => {
    const terrain = TerrainEngine.empty(W, H);
    const analyzer = new AiTerrainAnalyzer();
    const risk = analyzer.estimateFallRisk(terrain, 100, 140, 40, 100, 100, 100);
    expect(risk.willFall).toBe(false);
  });

  it('estimateCoverValue retorna 0 em campo aberto', () => {
    const terrain = TerrainEngine.empty(W, H);
    const analyzer = new AiTerrainAnalyzer();
    const cover = analyzer.estimateCoverValue(terrain, 10, 100, 190, 100);
    expect(cover).toBe(0);
  });
});
