# Sub-spec — Agent 010: CharacterSprite + CharacterAnimator

## Objetivo
Criar dois arquivos:
1. `game/character/character-sprite.ts` — sprite composto com Container Phaser e layers por slot de equipamento
2. `game/character/character-animator.ts` — máquina de estado de animação por gameplay state

## Contexto Mínimo Necessário
- Stack: Phaser 3
- Raças: `'human' | 'dwarf' | 'elf'`
- Slots de equipamento e ordem de depth:
  ```
  base (depth 0) → boots (1) → armor (2) → offhand (3) → weapon (4) → helmet (5) → necklace (6) → earring (7) → ring (8)
  ```
- Offsets por slot e raça definidos em `SLOT_CONFIGS` (constante local)
- Se slot vazio: layer não renderizado
- Fallback: se atlas não existir → usar sprite estático base (não crashar)
- Estados de animação: `idle | walk | fall | charge | shoot | damage | die | critical`
  - `die` é terminal (não sai do último frame)
  - Animações one-shot (shoot, damage, critical, die) retornam para `idle` após completar (exceto die)
- Assets atlas: `assets/characters/{race}/atlas.png` + `atlas.json` (preload na scene)
  - Se não existir: não crashar, usar fallback
- Log de transição de animação no console para debug

## Arquivos Autorizados (pode criar/alterar)
- `system/frontend/src/game/character/character-sprite.ts` (CRIAR)
- `system/frontend/src/game/character/character-animator.ts` (CRIAR)

## Arquivos que Deve Apenas Consultar
- `system/frontend/src/game/scenes/battle.scene.ts` (ver como personagens são instanciados hoje — somente leitura)

## O que Não Deve Mexer
- Nenhum arquivo existente

## Dependências Obrigatórias
- Nenhuma (código pode ser criado sem os assets — usa fallback)

## Critérios de Aceite
- [ ] `EquipmentSlot` type exportado (9 slots)
- [ ] `SlotConfig` interface exportada
- [ ] `SLOT_CONFIGS` constante com valores placeholder por raça
- [ ] `CharacterSprite` classe exportada
- [ ] `CharacterSprite.create(scene, race, x, y): void`
- [ ] `CharacterSprite.equip(slot, textureKey): void`
- [ ] `CharacterSprite.unequip(slot): void`
- [ ] `CharacterSprite.setPosition(x, y): void`
- [ ] `CharacterSprite.destroy(): void`
- [ ] `CharacterAnimator` classe exportada
- [ ] `CharacterAnimator.transition(state: AnimState): void`
- [ ] Fallback: se texture não carregada, usar `scene.add.rectangle` como placeholder
- [ ] TypeScript sem erros

## Assunção Documentada
`SLOT_CONFIGS` usa valores de offset (offsetX, offsetY) zerados como placeholder. Serão calibrados quando os assets reais forem criados. Os assets atlas (PNG + JSON) ainda não existem — o código deve lidar graciosamente com a ausência.

## Instrução de Execução
`CharacterSprite` cria um `Phaser.GameObjects.Container`. Cada slot é um `Phaser.GameObjects.Sprite` (ou Rectangle placeholder) adicionado ao Container com `setDepth`. `CharacterAnimator` recebe referência ao sprite `base` e chama `play()` verificando se a animação existe (`scene.anims.exists(key)`).

## Formato do Resumo Final
Criar `.ai-orchestration/agents/010-summary.md` com o template padrão de resumo.
