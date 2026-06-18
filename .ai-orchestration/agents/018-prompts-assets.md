# Agente 018 — Prompts de Assets (docs)

## Memory — Prompts de Assets

### Objetivo
Registrar/atualizar os prompts de assets de todos os novos elementos visuais (backgrounds, monstros, NPC, bosses, VFX, objetos de cenário, ícones de itens, portais) no formato do projeto.

### Contexto permitido
- Spec §27 (prompts completos), §22, §12. Style/Negative base definidos em §27.
- Seguir `docs/15-diretriz-arte.md` e a skill `rune-wars-art-director`.

### Arquivos autorizados (criar/editar)
- `system/frontend/src/assets/.../ASSET_PROMPTS.md` de dungeon (localizar o padrão existente, ex.: `assets/hub/ASSET_PROMPTS.md`; criar equivalente para dungeon)
- (opcional) `ASSET_SPEC` correspondente

### Arquivos apenas de consulta
- `system/frontend/src/assets/hub/ASSET_PROMPTS.md` (formato)
- `docs/15-diretriz-arte.md`

### O que NÃO mexer
- Código; mapas json (017); componentes.

### Dependências obrigatórias
- Nenhuma.

### Critérios de aceite
- Prompts de §27 registrados no formato do projeto (backgrounds, monstros, NPC, bosses, VFX, cenário, ícones de pedra 0–5 e fragmentos, portais).

### Checklist granular
- [ ] 18.1 Backgrounds/mapas (5)
- [ ] 18.2 Monstros + NPC + bosses
- [ ] 18.3 VFX/projéteis
- [ ] 18.4 Objetos de cenário (pedras místicas, barreira)
- [ ] 18.5 Ícones (pedra 0–5, fragmentos) + portais

### Comando de execução
"Implemente o Agente 018 conforme o arquivo. Atualize o checklist granular após cada item. Gere `018-*.summary.md` ao final."

### Formato do resumo final
Template padrão.
