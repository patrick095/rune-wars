# Agente 012 — Academia (frontend)

## Memory — Academia

### Objetivo
Reformular a Academia com painel de configuração (mapa, arma, tipo de alvo) e cena de treino correspondente com física/vento reais.

### Contexto permitido
- Spec §10.3, §14.3.
- Painel (overlay Angular): Mapa (mapas PvP + cavernas), Arma (`WeaponSystem`), Tipo de alvo: `fixed` (parado), `mobile` (vai-e-vem no turno), `dummy_player` (humanoide que se move e atira de volta via IA local; treino não letal; alvo respawna).
- `AcademyScene` carrega terreno do mapa (motor bitmap) + vento + física reais; contador de acertos/dano.

### Arquivos autorizados (criar/editar)
- `system/frontend/src/app/academy/academy.component.ts/html/scss` (estender)
- `system/frontend/src/app/academy/` (NOVO: AcademyConfigPanel, AcademyScene)

### Arquivos apenas de consulta
- `system/frontend/src/app/shared/game-core/weapon-system.ts`, `terrain-engine.ts`, `wind-system.ts`, `ai-local.ts`, maps, rarity.ts (001)
- Cena de batalha existente (referência de física)

### O que NÃO mexer
- Backend; ferreiro; dungeon; pvp.

### Dependências obrigatórias
- **001** (loadout com raridade — usar applyRarity se já equipado).

### Critérios de aceite (§25.4)
- Escolher mapa/arma/alvo (fixo/móvel/CPU) e treinar com física/vento reais; dummy atira de volta sem matar o player.
- `tsc --noEmit && ng build` passam.

### Checklist granular
- [ ] 12.1 AcademyConfigPanel (selects mapa/arma/alvo)
- [ ] 12.2 AcademyScene: terreno + vento + física
- [ ] 12.3 Alvo `fixed` e `mobile`
- [ ] 12.4 Alvo `dummy_player` (IA local move+atira, não letal, respawn)
- [ ] 12.5 HUD acertos/dano + botão Voltar
- [ ] 12.6 typecheck + build frontend

### Comando de execução
"Implemente o Agente 012 conforme o arquivo. Atualize o checklist granular após cada item. Gere `012-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
