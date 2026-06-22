import { strict as assert } from 'node:assert';
import {
  computeChance,
  computeChanceFromStones,
  ITEM_UPGRADE_RULES,
  luckToUpgradeBonus,
  stonePower,
  STONE_UPGRADE_RULES,
} from './upgrade.service';

function runUpgradeRuleSpecs(): void {
  assert.equal(STONE_UPGRADE_RULES[0].baseChance, 0.80);
  assert.equal(STONE_UPGRADE_RULES[4].goldCost, 10000);
  assert.equal(ITEM_UPGRADE_RULES[5].requiredStoneLevel, 5);
  assert.equal(ITEM_UPGRADE_RULES[9].goldCost, 500000);

  assert.equal(luckToUpgradeBonus(12), 0.06);
  assert.equal(computeChance(0.10, 12, { race: 0.02, event: 0.03 }), 0.21);
  assert.equal(computeChance(0.95, 20, { event: 0.10 }), 1);
  assert.equal(computeChance(-0.10, -4), 0);

  // stonePower: exponential growth
  assert.equal(stonePower(0), 1);
  assert.equal(stonePower(1), 2);
  assert.equal(stonePower(5), 32);

  // 3 stones at required level → exactly baseChance
  assert.equal(computeChanceFromStones(0.80, 0, [0, 0, 0]), 0.80);
  assert.equal(computeChanceFromStones(0.30, 5, [5, 5, 5]), 0.30);

  // 1 stone at required level → 1/3 of baseChance
  assert.equal(computeChanceFromStones(0.90, 0, [0]), 0.30);

  // stones above required level can reach 100%
  assert.equal(computeChanceFromStones(0.80, 0, [5, 5, 5]), 1);

  // 0 stones → 0%
  assert.equal(computeChanceFromStones(0.80, 0, []), 0);
}

runUpgradeRuleSpecs();
