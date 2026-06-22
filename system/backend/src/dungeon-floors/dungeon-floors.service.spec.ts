import { strict as assert } from 'node:assert';
import { DungeonFloorsService } from './dungeon-floors.service';

async function runDungeonRoomSpecs(): Promise<void> {
  const rooms: any[] = [];
  const repo = {
    create: (room: any) => ({ id: `room-${rooms.length + 1}`, created_at: new Date(), ...room }),
    save: async (room: any) => {
      const index = rooms.findIndex(existing => existing.id === room.id);
      if (index >= 0) rooms[index] = room;
      else rooms.push(room);
      return room;
    },
    find: async () => [...rooms],
    findOne: async ({ where }: any) => rooms.find(room => room.id === where.id) ?? null,
    remove: async (roomOrRooms: any) => {
      const deletedRooms = Array.isArray(roomOrRooms) ? [...roomOrRooms] : [roomOrRooms];
      for (const room of deletedRooms) {
        const index = rooms.findIndex(existing => existing.id === room.id);
        if (index >= 0) rooms.splice(index, 1);
      }
      return roomOrRooms;
    },
    delete: async () => ({ affected: 0 }),
  };
  const characters = {
    findOneById: async (id: string) => ({ id, name: `Char ${id}`, vitality: id === 'leader' ? 4 : 2 }),
  };
  const itemRepo = {
    findOne: async ({ where }: any) => where.owner_id === 'leader'
      ? { item_base_id: 'longbow' }
      : { item_base_id: 'cannon' },
  };
  const clears: any[] = [];
  const dungeon = {
    canAccessFloor: async () => true,
    recordFloorClear: async (characterId: string, floor: number, difficulty: string) => {
      clears.push({ characterId, floor, difficulty });
    },
  };
  const portalContexts: any[] = [];
  const portals = {
    createContext: (options: any) => {
      const context = {
        contextId: options.contextId,
        portals: [{ index: 0, kind: 'gold', amount: 50 }],
        picksPerCharacter: options.isBoss ? 2 : 1,
      };
      portalContexts.push({ options, context });
      return context;
    },
    select: async (contextId: string, characterId: string, indices?: number[]) => ({
      contextId,
      characterId,
      selectedIndices: indices ?? [0],
      reveal: [],
      gains: [],
    }),
  };
  const service = new DungeonFloorsService(repo as any, itemRepo as any, characters as any, dungeon as any, portals as any);

  const room = await service.createRoom('leader', 1, 'easy');
  assert.equal(room.member_character_ids.length, 1);
  assert.equal(room.stage_count, 2);
  assert.equal(room.slots[0].playerName, 'Char leader');
  assert.equal(room.slots[0].maxHp, 280);

  await service.joinLobby(room.id, 'member');
  assert.equal(room.member_character_ids.length, 2);

  await service.setReady(room.id, 'member', true, { weaponId: 'bow_wood' });
  await service.startDungeon(room.id, 'leader');
  assert.equal(room.status, 'in_battle');
  assert.equal(room.slots[0].weaponId, 'longbow');
  assert.equal(room.slots[1].maxHp, 240);

  await service.completePhase(room.id);
  assert.equal(room.status, 'portal');
  assert.equal(portalContexts[0].options.isBoss, false);

  await service.regroup(room.id, 'leader');
  assert.equal(room.status, 'regroup');
  assert.equal(room.current_stage, 2);

  await service.setReady(room.id, 'member', true);
  await service.startDungeon(room.id, 'leader');
  await service.completePhase(room.id);
  assert.equal(portalContexts[1].options.isBoss, true);
  assert.equal(clears.length, 2);

  const failedRoom = await service.createRoom('leader', 1, 'easy');
  await service.joinLobby(failedRoom.id, 'member');
  await service.setReady(failedRoom.id, 'member', true);
  await service.startDungeon(failedRoom.id, 'leader');
  const failResult = await service.failRoom(failedRoom.id, 'leader');
  assert.equal(failResult.status, 'regroup');
  assert.equal(failResult.current_stage, 1);
  assert.equal(failResult.member_character_ids.length, 2);
  assert.equal(failResult.slots.every(slot => !slot.ready), true);

  const leaveResult = await service.leaveRoom(failedRoom.id, 'member');
  assert.equal(leaveResult.deleted, false);
  assert.equal(leaveResult.lobby?.member_character_ids.length, 1);
  assert.equal(rooms.some(existing => existing.id === failedRoom.id), true);

  const deleteResult = await service.leaveRoom(failedRoom.id, 'leader');
  assert.equal(deleteResult.deleted, true);
  assert.equal(rooms.some(existing => existing.id === failedRoom.id), false);

  const leaderLeaveRoom = await service.createRoom('leader', 1, 'easy');
  await service.joinLobby(leaderLeaveRoom.id, 'member');
  const leaderLeaveResult = await service.leaveRoom(leaderLeaveRoom.id, 'leader');
  assert.equal(leaderLeaveResult.deleted, false);
  assert.equal(leaderLeaveResult.lobby?.leader_character_id, 'member');

  const cleanupRoom = await service.createRoom('leader', 1, 'easy');
  await service.startDungeon(cleanupRoom.id, 'leader');
  const cleanupResult = await service.cleanupAllRooms();
  assert.equal(cleanupResult.deleted > 0, true);
  assert.equal(rooms.some(existing => existing.id === cleanupRoom.id), false);

  const finalStageRoom = await service.createRoom('leader', 1, 'easy');
  finalStageRoom.current_stage = finalStageRoom.stage_count;
  finalStageRoom.status = 'portal';
  const finalRegroup = await service.regroup(finalStageRoom.id, 'leader');
  assert.equal(finalRegroup.status, 'regroup');
  assert.equal(finalRegroup.current_stage, 1);
  assert.equal(finalRegroup.current_phase, 1);
}

runDungeonRoomSpecs();
