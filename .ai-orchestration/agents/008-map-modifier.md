# Sub-spec — Agent 008: MapModifier + MapModifierManager

## Objetivo
Criar dois arquivos:
1. `game/map/map-modifier.ts` — tipos, interface e lógica de um modificador de mapa
2. `game/map/map-modifier-manager.ts` — spawn, ciclo de vida e detecção de ativação pelo projétil

## Contexto Mínimo Necessário
- Stack: Phaser 3
- Grid: 450×160 células, CELL_SIZE=8px → mundo 3600×1280px
- Modificadores devem spawnar acima do nível dos personagens (Y < metade do mapa)
- Não podem spawnar sobre terreno sólido
- Radius de ativação: 20px
- Desaparecem após 3 rodadas gerais sem uso
- Projétil **atravessa** o modificador (não é bloqueado)
- Efeitos aplicados ao projétil state:
  - `damage_boost`: `baseDamage *= 1.5`
  - `excavation_boost`: `excavationRadius *= 1.5`
  - `freeze`: `applyStatus('frozen', 1)`
  - `poison`: `applyStatus('poison', 2)`
  - `burn`: `applyStatus('burn', 1)`
  - `vulnerability`: `applyStatus('vulnerability', 1)`
  - `critical`: forçar crítico
- Visual: sprite/placeholder + tween de pulsação (scale + alpha)
- Log: `[MAP_MOD] type=X activated at (x,y)`

## Arquivos Autorizados (pode criar/alterar)
- `system/frontend/src/game/map/map-modifier.ts` (CRIAR)
- `system/frontend/src/game/map/map-modifier-manager.ts` (CRIAR)

## Arquivos que Deve Apenas Consultar
- `system/frontend/src/game/scenes/battle.scene.ts` (ver estrutura existente — somente leitura)
- `system/frontend/src/game/projectiles/projectile-renderer.ts` (ver como projétil percorre path — somente leitura)

## O que Não Deve Mexer
- Nenhum arquivo existente

## Dependências Obrigatórias
- Nenhuma (pode executar imediatamente)

## Critérios de Aceite
- [ ] `MapModifierType` exportado (union type com 7 tipos)
- [ ] `MapModifier` interface exportada (id, type, worldX, worldY, radius, roundsLeft, sprite)
- [ ] `MapModifierManager` classe exportada
- [ ] `trySpawn(scene: Phaser.Scene, terrainChecker: (x: number, y: number) => boolean): void`
- [ ] `checkProjectileCollision(x: number, y: number): MapModifier | null` — retorna modificador ativado
- [ ] `applyEffect(modifier: MapModifier, projectileState: ProjectileState): void`
- [ ] `onRoundEnd(): void` — decrementa `roundsLeft`, remove expirados
- [ ] `destroy(): void` — cleanup completo
- [ ] Visual: sprite placeholder (círculo colorido por tipo) + tween idle de pulsação
- [ ] Não crashar se terrainChecker retornar inválido
- [ ] TypeScript sem erros

## Assunção Documentada
Sem assets finais disponíveis nesta fase, os modificadores usam círculos Phaser.Graphics coloridos por tipo como placeholder visual. Os assets definitivos serão trocados quando disponíveis.

## Instrução de Execução
Definir `ProjectileState` como interface local mínima (apenas os campos que o modificador precisa alterar). `MapModifierManager` gerencia array de `MapModifier[]`. `trySpawn` gera 1–2 modificadores em posições aleatórias com `Math.random()`, valida via `terrainChecker`. `checkProjectileCollision` itera o array e verifica distância euclidiana ≤ `modifier.radius`.

## Formato do Resumo Final
Criar `.ai-orchestration/agents/008-summary.md` com o template padrão de resumo.
