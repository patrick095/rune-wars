import { strict as assert } from 'node:assert';
import { PvpService } from './pvp.service';

async function runPvpRewardSpecs(): Promise<void> {
  const room = {
    id: 'pvp-room',
    name: 'PvP',
    ownerCharacterId: 'char-1',
    playerIds: ['char-1', 'char-2'],
    playerCount: 2,
    maxPlayers: 2,
    status: 'active',
    slots: [],
    reward_state: null,
    updatedAt: new Date(),
  };
  const repo = {
    findOne: async ({ where }: any) => (where.id === room.id ? room : null),
    save: async (next: any) => Object.assign(room, next),
    find: async () => [room],
    remove: async () => room,
  };
  const portals = {
    createContext: (options: any) => ({
      contextId: options.contextId,
      portals: Array.from({ length: 8 }, (_, index) => ({ index, kind: 'gold', amount: 50 })),
      picksPerCharacter: 1,
    }),
    select: async (contextId: string, characterId: string, indices?: number[]) => ({
      contextId,
      characterId,
      selectedIndices: indices ?? [0],
      reveal: [{ index: indices?.[0] ?? 0, kind: 'gold', amount: 50 }],
      gains: [{ portalIndex: indices?.[0] ?? 0, kind: 'gold', amount: 50 }],
    }),
  };
  const service = new PvpService(repo as any, {} as any, {} as any, portals as any);

  const rewardRoom = await service.ensureRewardState(room.id);
  assert.equal((rewardRoom.reward_state?.portals as any[]).length, 8);

  const selection = await service.selectReward(room.id, 'char-1', [3]);
  assert.equal(selection.selectedIndices[0], 3);
  assert.equal(Boolean((room.reward_state?.selections as any)['char-1']), true);

  await service.completeBattle(room.id, 'char-1');
  assert.equal(room.status, 'closed');
  assert.equal(room.reward_state?.winnerId, 'char-1');
}

runPvpRewardSpecs();
