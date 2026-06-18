# Agente 003 — Economia de Ouro (backend)

## Memory — Economia de Ouro

### Objetivo
Implementar saldo de ouro do personagem (a coluna `Character.gold` JÁ EXISTE, default 0): adicionar `addGold(id, amount)` e `spendGold(id, amount)` (valida saldo, 400 se insuficiente) ao `CharacterService`, e expor `gold` no GET do personagem (e/ou `GET /characters/:id/gold`).

### Contexto permitido
- Spec §13.7, §10 (D16). Personagens começam com 0; ganho via portais, gasto no Aprimoramento.
- **JÁ EXISTE**: `gold: number` em `character.entity.ts` (~linha 42). NÃO recriar a coluna.

### Arquivos autorizados (criar/editar)
- `system/backend/src/character/character.service.ts` (editar — addGold/spendGold)
- `system/backend/src/character/character.controller.ts` (editar — expor gold/endpoint)

### Arquivos apenas de consulta
- `system/backend/src/character/character.entity.ts` (confirmar coluna gold)

### O que NÃO mexer
- Entity (coluna já existe); craft/upgrade/portais (consomem via estes métodos depois).

### Dependências obrigatórias
- Nenhuma.

### API pública (contrato)
`CharacterService.addGold(id, amount): Promise<Character>`, `CharacterService.spendGold(id, amount): Promise<Character>` (lança 400 se saldo < amount). `gold` presente no payload do GET de personagem.

### Critérios de aceite
- spendGold rejeita saldo insuficiente (400); addGold credita.
- gold exposto no GET. `npx tsc --noEmit && nest build` no backend passam.

### Checklist granular
- [ ] 3.1 Confirmar coluna gold na entity
- [ ] 3.2 `addGold` no service
- [ ] 3.3 `spendGold` no service (validação 400)
- [ ] 3.4 Expor gold no controller (GET/endpoint)
- [ ] 3.5 typecheck + build backend

### Comando de execução
"Implemente o Agente 003 conforme o arquivo. Atualize o checklist granular após cada item. Gere `003-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
