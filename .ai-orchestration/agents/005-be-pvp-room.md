# Sub-spec — Agent 005: BE PvP Room Extensions

## Objetivo
Estender o módulo PvP existente com:
1. Campos `slots`, `mode`, `map_slug` na entity `PvpRoom`
2. Novos endpoints: fechar/abrir vaga, chutar jogador, marcar pronto com seleção de consumíveis

## Dependências
- Agent 001 (DB Migrations) — colunas `slots`, `mode`, `map_slug` devem existir

## Contexto mínimo necessário
- Backend NestJS em `system/backend/src/pvp/`
- Arquivos: `pvp-room.entity.ts`, `pvp.service.ts`, `pvp.controller.ts`, `pvp.module.ts`
- Sistema atual: polling de 3s, sem WebSocket

## Arquivos autorizados a alterar
- `system/backend/src/pvp/pvp-room.entity.ts`
- `system/backend/src/pvp/pvp.service.ts`
- `system/backend/src/pvp/pvp.controller.ts`

## Arquivos a consultar (somente leitura)
- `system/backend/src/auth/jwt-auth.guard.ts`

## O que NÃO mexer
- `pvp.module.ts` (a menos que necessário para novos imports)
- Lógica de batalha existente

## Implementações exigidas

### PvpRoom entity — novos campos
```typescript
@Column({ type: 'jsonb', default: [] })
slots: SlotState[];  // array de 4 objetos

@Column({ default: 'free' })
mode: string;  // 'ranked' | 'free' | 'guild'

@Column({ default: 'plains' })
map_slug: string;
```

SlotState type (pode ser definido no mesmo arquivo ou em types separado):
```typescript
export interface SlotState {
  playerId: string | null;
  playerName: string | null;
  closed: boolean;
}
```

### PvpService — novos métodos
- `closeSlot(roomId, slotIndex, requesterId)`: fecha/abre vaga (toggle). Verifica que requesterId é o dono.
- `kickPlayer(roomId, slotIndex, requesterId)`: remove player do slot. Verifica que requesterId é o dono e não é o próprio slot do dono.
- `setReady(roomId, characterId, consumableSelection: string[])`: marca player como pronto, salva seleção de consumíveis no slot do player.

### PvpController — novos endpoints
```
POST /pvp/rooms/:id/slots/:slotIndex/close   → fecha/abre vaga (somente dono)
POST /pvp/rooms/:id/slots/:slotIndex/kick    → chuta player (somente dono)
PATCH /pvp/rooms/:id/ready                   → { characterId, consumableSelection: string[] }
```

Todos protegidos por `@UseGuards(JwtAuthGuard)`.

### Regras de negócio
- RN18: Dono pode fechar vaga vazia (toggle)
- RN19: Dono pode reabrir vaga fechada (toggle — mesmo endpoint de close)
- RN20: Dono pode chutar jogador em slot ocupado (não pode chutar a si mesmo)
- Botão PRONTO: envia `consumableSelection` (array de até 5 consumableIds, pode repetir)

## Critérios de aceite
- [ ] Entity atualizada com slots, mode, map_slug
- [ ] `POST /pvp/rooms/:id/slots/:slotIndex/close` funciona (toggle)
- [ ] `POST /pvp/rooms/:id/slots/:slotIndex/kick` retorna 403 se não for o dono
- [ ] `PATCH /pvp/rooms/:id/ready` salva consumableSelection
- [ ] Build backend sem erros TypeScript

## Formato do resumo final
Criar `.ai-orchestration/agents/005-be-pvp-room-result.md`

## Memory

### Objetivo
Estender PvpRoomsModule com campos slots/mode/map_slug e 3 novos endpoints (close, kick, ready).

### Contexto permitido
Backend NestJS. system/backend/src/pvp/ apenas.

### Arquivos autorizados
pvp-room.entity.ts, pvp.service.ts, pvp.controller.ts

### Dependências
Agent 001 (colunas slots/mode/map_slug devem existir na tabela pvp_room)

### Restrições
NÃO alterar lógica de batalha existente. NÃO criar arquivos novos desnecessários.

### Critérios de aceite
3 endpoints funcionando, entity atualizada, verificação de dono implementada, build limpo.
