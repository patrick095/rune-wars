import { strict as assert } from 'node:assert';
import { PortalService } from './portal.service';

function withRandom<T>(value: number, fn: () => T): T {
  const original = Math.random;
  Math.random = () => value;
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

async function runPortalServiceSpecs(): Promise<void> {
  const savedItems: any[] = [];
  const goldGrants: any[] = [];
  const itemRepo = {
    create: (item: any) => item,
    save: async (item: any) => {
      const saved = { id: `item-${savedItems.length + 1}`, ...item };
      savedItems.push(saved);
      return saved;
    },
  };
  const characters = {
    addGold: async (characterId: string, amount: number) => {
      goldGrants.push({ characterId, amount });
      return { id: characterId, gold: amount };
    },
  };
  const service = new PortalService(itemRepo as any, characters as any);

  const easyNormal = withRandom(0.1, () => service.generatePortals({ mode: 'dungeon', difficulty: 'easy' }));
  assert.equal(easyNormal.length, 8);
  assert.equal(easyNormal.every(portal => portal.kind === 'gold'), true);

  const mediumBoss = withRandom(0.6, () => service.generatePortals({ mode: 'dungeon', difficulty: 'medium', isBoss: true }));
  assert.equal(mediumBoss.length, 16);
  assert.equal(mediumBoss.filter(portal => portal.rarity === 'common').length, 6);
  assert.equal(mediumBoss.filter(portal => portal.rarity === 'uncommon').length, 3);
  assert.equal(mediumBoss.filter(portal => portal.rarity === 'rare').length, 1);

  const pvpRare = withRandom(0.995, () => service.generatePortals({ mode: 'pvp' }));
  assert.equal(pvpRare.length, 8);
  assert.equal(pvpRare.every(portal => portal.rarity === 'rare'), true);

  service.registerContext('normal-context', easyNormal, { mode: 'dungeon', isBoss: false, participantIds: ['char-1'] });
  const normalSelection = await service.select('normal-context', 'char-1', [0]);
  assert.equal(normalSelection.gains.length, 1);
  assert.equal(goldGrants.length, 1);

  service.registerContext('boss-context', mediumBoss, { mode: 'dungeon', isBoss: true });
  const bossSelection = await service.select('boss-context', 'char-2', [0, 1]);
  assert.equal(bossSelection.reveal.length, 16);
  assert.equal(bossSelection.gains.length, 2);

  await assert.rejects(
    () => service.select('boss-context', 'char-3', [0, 0]),
    /mesmo portal/,
  );
}

runPortalServiceSpecs();
