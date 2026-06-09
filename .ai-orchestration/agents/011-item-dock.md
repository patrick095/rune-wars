# Agent-011 — Item Dock (Fix A9: Dois Docks Visuais no Battle Scene)

## Status
Pendente

## Objetivo
Criar classe `ItemDock` como componente Phaser-native reutilizável. Integrar dois docks no `battle.scene.ts`: um para consumíveis, um para modificadores de tiro. Docks ficam na bottom bar, com toggle, ícone 32×32px, nome e contagem.

## Memory

### Objetivo
Criar ItemDock (Phaser-native) e integrar 2 docks em battle.scene.ts.

### Contexto permitido
- Criar `src/game/hud/item-dock.ts`
- `src/app/shared/game-core/battle.scene.ts`: instanciar consumableDock e modifierDock
- Consultar `src/app/shared/game-core/shot-modifier-system.ts` (criado por Agent-010)
- Consultar sistema de consumíveis existente para entender interface de itens

### Arquivos autorizados a alterar
- `src/game/hud/item-dock.ts` (criar)
- `src/app/shared/game-core/battle.scene.ts` (adicionar docks)

### Arquivos apenas consulta
- `src/app/shared/game-core/shot-modifier-system.ts`
- `src/app/shared/game-core/secondary-item-system.ts`

### O que NÃO alterar
- Debug overlay existente
- Outros elementos do HUD

### Dependências
- Agent-010 deve estar concluído (ShotModifierSystem criado)
- Após Fase 1 para não conflitar em battle.scene.ts

### Critérios de aceite
- `ItemDock` recebe: scene, x, y, items (DockItem[]), onSelect callback
- `DockItem`: `{ id: string; label: string; iconKey?: string; count?: number; active?: boolean }`
- Botão principal togla visibilidade do painel
- Itens mostram nome + contagem; ativo = borda dourada
- `setScrollFactor(0)` em todos os objetos (HUD fixo)
- Docks recriados/atualizados ao início de cada turno do jogador
- Turno da IA: docks escondidos
- TypeScript sem erros

### Instrução de execução
```
Implemente o Fix A9 do spec v1.4.0 (Item Docks).
Criar src/game/hud/item-dock.ts com a classe ItemDock.
Implementar: constructor criando botão de toggle e painel expansível com GameObjects Phaser.
setScrollFactor(0) em todos os objetos para que fiquem fixos no HUD.
Slot ativo com borda dourada (via Graphics).
Métodos: setVisible(v), refresh(items).
Em battle.scene.ts:
  - Instanciar consumableDock com itens do sistema de consumíveis
  - Instanciar modifierDock com 4 slots fixos do ShotModifierSystem
  - No início do turno do jogador: mostrar docks e fazer refresh
  - No turno da IA: esconder docks
  - No onSelect do modifierDock: chamar shotModifierSystem.activate(id)
Atualizar .ai-orchestration/ após cada arquivo alterado.
```

## Riscos ou pendências
- Posição exata dos docks na tela (coordenadas X,Y) pode precisar de ajuste visual
- Verificar se existe pasta `src/game/hud/` ou se precisa criar
