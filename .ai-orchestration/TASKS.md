# TASKS

## Pendentes

### T2 - placeholders, anchors e validador

- Objetivo: criar tipos/constantes do manifest v2 e preparar catalogo/manifests v2 sem integrar cenas.
- Pode alterar: `system/frontend/src/game/character/asset-manifest.types.ts`, `system/frontend/src/game/character/weapon-visual-profile.ts`, `system/frontend/src/game/assets/rune-wars-assets.ts`, `system/frontend/src/assets/rune-wars/asset-catalog.json`, manifests JSON em `system/frontend/src/assets/rune-wars`.
- Apenas consulta: `docs/implementations/2026-06-26-v1.9.0-spec.md`, `system/frontend/src/app/shared/game-core/weapon-definition.ts`, `system/frontend/src/app/shared/game-core/weapon-system.ts`.
- Aceite: catalogo expõe `schemaVersion: 2`, racas obrigatorias, render order novo, animacoes canonicas e perfis iniciais de armas.

### T3 - renderer modular

- Objetivo: implementar AnchorResolver, ModularCharacterAnimator e ModularCharacterRenderer.
- Pode alterar: `system/frontend/src/game/character/anchor-resolver.ts`, `system/frontend/src/game/character/modular-character-animator.ts`, `system/frontend/src/game/character/modular-character-renderer.ts`.
- Apenas consulta: `system/frontend/src/game/character/character-sprite.ts`, `system/frontend/src/game/character/character-animator.ts`, `system/frontend/src/game/assets/rune-wars-assets.ts`.
- Aceite: renderer cria camadas sincronizadas, aplica anchors/flip/aim, troca arma/equipamento e expoe origem de projetil.

### T4 - integracao BattleScene

- Objetivo: substituir a integracao antiga de personagem em BattleScene pelo renderer modular.
- Pode alterar: `system/frontend/src/game/scenes/battle.scene.ts`.
- Apenas consulta: modulos de T3, `system/frontend/src/app/shared/game-core/weapon-system.ts`, `system/frontend/src/app/shared/game-core/weapon-definition.ts`.
- Aceite: BattleScene usa renderer modular para player/AI, troca arma via perfil, atualiza aim angle e mapeia hit/death/shoot para estados canonicos sem reescrever gameplay.

### T5 - integracao AcademyScene e DungeonScene

- Objetivo: usar o mesmo renderer modular na academia e nos players da dungeon.
- Pode alterar: `system/frontend/src/game/scenes/academy.scene.ts`, `system/frontend/src/game/scenes/dungeon.scene.ts`.
- Apenas consulta: modulos de T3, integracao de T4.
- Aceite: academia e dungeon renderizam players pelo renderer modular e atualizam mira/arma sem duplicar regras visuais.

### T6 - QA, documentacao permanente e limpeza

- Objetivo: validar build/contratos, documentar implementacao e remover `.ai-orchestration`.
- Pode alterar: `docs/implementations/2026-06-26-v1.9.0-implementation-summary.md`; remover `.ai-orchestration`.
- Apenas consulta: todos os arquivos alterados, saida dos comandos de QA.
- Aceite: build/validacao executados ou bloqueios registrados, criterios de aceite revisados, documento permanente criado e `.ai-orchestration` removido.

## Executando

### T1 - contratos v2 e estado de assets

- Objetivo: criar tipos/constantes do manifest v2 e preparar catalogo/manifests v2 sem integrar cenas.
- Pode alterar: `system/frontend/src/game/character/asset-manifest.types.ts`, `system/frontend/src/game/character/weapon-visual-profile.ts`, `system/frontend/src/game/assets/rune-wars-assets.ts`, `system/frontend/src/assets/rune-wars/asset-catalog.json`, manifests JSON em `system/frontend/src/assets/rune-wars`.
- Apenas consulta: `docs/implementations/2026-06-26-v1.9.0-spec.md`, `system/frontend/src/app/shared/game-core/weapon-definition.ts`, `system/frontend/src/app/shared/game-core/weapon-system.ts`.
- Aceite: catalogo expõe `schemaVersion: 2`, racas obrigatorias, render order novo, animacoes canonicas e perfis iniciais de armas.

## Concluidas

- Nenhuma.

## Bloqueadas

- Nenhuma.

## Ordem de execucao

1. T1
2. T2
3. T3
4. T4
5. T5
6. T6

## Tarefas paralelas possiveis

- Depois de T3, T4 e T5 podem ser preparadas em paralelo se os arquivos de cena ficarem com donos separados.
