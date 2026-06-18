# Arquivos Alterados — v1.8.0

> Registrar cada arquivo **imediatamente após** alterá-lo. Tipo: NOVO | EDIT | DELETE.

| Arquivo | Agente | Tipo de alteração | Status |
| ------- | ------ | ----------------- | ------ |
| (vazio — preencher durante a execução) | — | — | — |

---
## Arquivos com edição COMPARTILHADA (atenção a conflito)
- `system/frontend/src/app/shared/services/game-navigator.service.ts` — **dono: 011** (adiciona ferreiro/dungeon-lobby/dungeon-room). 015 só usa.
- `system/frontend/src/app/app.component.ts/.html` — 011 (@case ferreiro) e 015 (@case dungeon-lobby/room); editar blocos `@case` distintos; 015 roda após 011.
- `system/frontend/src/app/shared/game-core/item-catalog.ts` — **dono: 002**; 013 só consulta.
- `system/backend/src/pvp/*` — 009 (entity/service/controller) vs 010/016 (frontend pvp-*). Backend e frontend não colidem.
